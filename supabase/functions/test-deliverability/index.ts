import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  email: string;
  testId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, testId }: TestRequest = await req.json();
    console.log("Testing deliverability for:", email);

    // Extract domain from email
    const domain = email.split("@")[1];
    if (!domain) {
      throw new Error("Invalid email format");
    }

    // Perform DNS checks for email authentication
    const authResults = await checkEmailAuthentication(domain);
    
    // Calculate spam score based on authentication results
    let spamScore = 0;
    const warnings: string[] = [];

    if (!authResults.spf) {
      spamScore += 1.5;
      warnings.push("SPF record not found or invalid - emails may be marked as spam");
    }
    if (!authResults.dkim) {
      spamScore += 1.5;
      warnings.push("DKIM not configured - reduces email trust");
    }
    if (!authResults.dmarc) {
      spamScore += 1.0;
      warnings.push("DMARC policy not set - consider adding for better deliverability");
    }
    if (!authResults.mx) {
      spamScore += 1.0;
      warnings.push("No MX records found for domain");
    }

    // Additional checks based on domain reputation (simplified)
    const reputationCheck = await checkDomainReputation(domain);
    if (reputationCheck.blacklisted) {
      spamScore += 2.0;
      warnings.push(`Domain found on blacklist: ${reputationCheck.blacklistName}`);
    }
    if (reputationCheck.ageWarning) {
      spamScore += 0.5;
      warnings.push("Domain is relatively new - reputation still building");
    }

    // Determine inbox placement prediction
    const inboxPlacement = spamScore < 2 ? "inbox" : spamScore < 4 ? "promotions" : "spam";

    // Update the test record with results
    const { error: updateError } = await supabase
      .from("email_deliverability_tests")
      .update({
        status: "completed",
        spam_score: Math.min(spamScore, 5),
        inbox_placement: inboxPlacement,
        authentication_results: authResults,
        warnings: warnings.length > 0 ? warnings : null,
        completed_at: new Date().toISOString(),
        result: {
          domain,
          checks: {
            spf: authResults.spf,
            dkim: authResults.dkim,
            dmarc: authResults.dmarc,
            mx: authResults.mx,
          },
          reputation: reputationCheck,
        },
      })
      .eq("id", testId);

    if (updateError) {
      console.error("Error updating test:", updateError);
      throw updateError;
    }

    console.log("Deliverability test completed:", { spamScore, inboxPlacement });

    return new Response(
      JSON.stringify({
        success: true,
        spamScore: Math.min(spamScore, 5),
        inboxPlacement,
        warnings,
        authResults,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Deliverability test error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkEmailAuthentication(domain: string): Promise<{
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  mx: boolean;
  spfRecord?: string;
  dmarcRecord?: string;
}> {
  const results = {
    spf: false,
    dkim: false,
    dmarc: false,
    mx: false,
    spfRecord: undefined as string | undefined,
    dmarcRecord: undefined as string | undefined,
  };

  try {
    // Check SPF record
    const spfResponse = await fetch(
      `https://dns.google/resolve?name=${domain}&type=TXT`
    );
    if (spfResponse.ok) {
      const spfData = await spfResponse.json();
      const txtRecords = spfData.Answer || [];
      for (const record of txtRecords) {
        const data = record.data?.replace(/"/g, "") || "";
        if (data.startsWith("v=spf1")) {
          results.spf = true;
          results.spfRecord = data;
          break;
        }
      }
    }
  } catch (e) {
    console.log("SPF check failed:", e);
  }

  try {
    // Check DMARC record
    const dmarcResponse = await fetch(
      `https://dns.google/resolve?name=_dmarc.${domain}&type=TXT`
    );
    if (dmarcResponse.ok) {
      const dmarcData = await dmarcResponse.json();
      const txtRecords = dmarcData.Answer || [];
      for (const record of txtRecords) {
        const data = record.data?.replace(/"/g, "") || "";
        if (data.startsWith("v=DMARC1")) {
          results.dmarc = true;
          results.dmarcRecord = data;
          break;
        }
      }
    }
  } catch (e) {
    console.log("DMARC check failed:", e);
  }

  try {
    // Check MX records
    const mxResponse = await fetch(
      `https://dns.google/resolve?name=${domain}&type=MX`
    );
    if (mxResponse.ok) {
      const mxData = await mxResponse.json();
      results.mx = (mxData.Answer?.length || 0) > 0;
    }
  } catch (e) {
    console.log("MX check failed:", e);
  }

  // DKIM check is complex (requires knowing the selector), 
  // so we'll check for common selectors
  try {
    const commonSelectors = ["google", "default", "selector1", "k1", "mail"];
    for (const selector of commonSelectors) {
      const dkimResponse = await fetch(
        `https://dns.google/resolve?name=${selector}._domainkey.${domain}&type=TXT`
      );
      if (dkimResponse.ok) {
        const dkimData = await dkimResponse.json();
        if (dkimData.Answer?.length > 0) {
          results.dkim = true;
          break;
        }
      }
    }
  } catch (e) {
    console.log("DKIM check failed:", e);
  }

  return results;
}

async function checkDomainReputation(domain: string): Promise<{
  blacklisted: boolean;
  blacklistName?: string;
  ageWarning: boolean;
}> {
  const result = {
    blacklisted: false,
    blacklistName: undefined as string | undefined,
    ageWarning: false,
  };

  // Check against common DNS blacklists (simplified check)
  const blacklists = [
    "zen.spamhaus.org",
    "bl.spamcop.net",
  ];

  for (const bl of blacklists) {
    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${domain}.${bl}&type=A`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.Answer?.length > 0) {
          result.blacklisted = true;
          result.blacklistName = bl;
          break;
        }
      }
    } catch (e) {
      // Blacklist check failed, assume not listed
    }
  }

  // Check domain age via WHOIS would require additional API
  // For now, we'll skip this check
  
  return result;
}
