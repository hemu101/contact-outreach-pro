import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Common email patterns sorted by prevalence
const EMAIL_PATTERNS = [
  { pattern: "first.last", template: (f: string, l: string) => `${f}.${l}` },
  { pattern: "first", template: (f: string) => f },
  { pattern: "flast", template: (f: string, l: string) => `${f[0]}${l}` },
  { pattern: "firstl", template: (f: string, l: string) => `${f}${l[0]}` },
  { pattern: "first_last", template: (f: string, l: string) => `${f}_${l}` },
  { pattern: "last.first", template: (f: string, l: string) => `${l}.${f}` },
  { pattern: "last", template: (_f: string, l: string) => l },
  { pattern: "first.l", template: (f: string, l: string) => `${f}.${l[0]}` },
  { pattern: "f.last", template: (f: string, l: string) => `${f[0]}.${l}` },
  { pattern: "firstlast", template: (f: string, l: string) => `${f}${l}` },
];

function generateEmails(firstName: string, lastName: string, domain: string): { email: string; pattern: string }[] {
  const f = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const l = lastName.toLowerCase().replace(/[^a-z]/g, '');
  if (!f || !l) return [];

  return EMAIL_PATTERNS.map(p => ({
    email: `${p.template(f, l)}@${domain}`,
    pattern: p.pattern,
  }));
}

// Extract domain from company website or name
function guessDomain(companyName: string, website?: string): string {
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch { /* fall through */ }
  }
  // Guess from company name
  return `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
}

// Check MX records via DNS-over-HTTPS
async function checkMXRecords(domain: string): Promise<{ hasMX: boolean; records: string[] }> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await res.json();
    if (data.Answer) {
      const records = data.Answer.map((a: any) => a.data).filter(Boolean);
      return { hasMX: records.length > 0, records };
    }
    return { hasMX: false, records: [] };
  } catch {
    return { hasMX: false, records: [] };
  }
}

// Check if domain has catch-all (accepts any email)
async function checkCatchAll(domain: string): Promise<boolean> {
  // We can't do full SMTP from edge functions, but we check MX exists
  // A real catch-all check requires SMTP RCPT TO verification
  return false; // Conservative default
}

// Score the confidence of each email candidate
function scoreEmail(pattern: string, hasMX: boolean, existingEmails: string[]): number {
  let score = 0;
  
  // MX records exist
  if (hasMX) score += 30;
  
  // Pattern popularity bonus
  const popularPatterns: Record<string, number> = {
    "first.last": 35, "first": 25, "flast": 20, "firstl": 15,
    "first_last": 10, "last.first": 8, "firstlast": 5,
  };
  score += popularPatterns[pattern] || 3;
  
  // If other contacts at same domain use same pattern, boost confidence
  // This is checked at a higher level
  
  return Math.min(score, 95);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { contact_id, first_name, last_name, company_name, website, domain: providedDomain } = body;

    if (!first_name || !last_name) {
      return new Response(JSON.stringify({ error: "first_name and last_name are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const domain = providedDomain || guessDomain(company_name || '', website);

    // Check MX records
    const mx = await checkMXRecords(domain);
    const isCatchAll = await checkCatchAll(domain);

    // Generate email candidates
    const candidates = generateEmails(first_name, last_name, domain);

    // Check existing verified patterns for this domain
    const { data: existingVerifications } = await supabase
      .from("email_verifications")
      .select("pattern_used, verification_status")
      .eq("domain", domain)
      .eq("verification_status", "verified");

    const verifiedPatterns = (existingVerifications || []).map((v: any) => v.pattern_used);

    // Score candidates
    const scoredCandidates = candidates.map(c => {
      let confidence = scoreEmail(c.pattern, mx.hasMX, []);
      // Boost if pattern is already verified for this domain
      if (verifiedPatterns.includes(c.pattern)) confidence = Math.min(confidence + 30, 98);
      return { ...c, confidence, domain };
    }).sort((a, b) => b.confidence - a.confidence);

    // Save top result and log
    const bestCandidate = scoredCandidates[0];

    if (contact_id && bestCandidate) {
      // Save verification record
      await supabase.from("email_verifications").insert({
        user_id: user.id,
        contact_id,
        email: bestCandidate.email,
        domain,
        pattern_used: bestCandidate.pattern,
        verification_status: mx.hasMX ? "likely_valid" : "unverified",
        mx_records: mx.records,
        is_catch_all: isCatchAll,
        confidence_score: bestCandidate.confidence,
        verified_at: new Date().toISOString(),
      });

      // Log enrichment
      await supabase.from("enrichment_logs").insert({
        user_id: user.id,
        contact_id,
        enrichment_type: "email_finder",
        source: "pattern_prediction",
        status: "completed",
        input_data: { first_name, last_name, domain, company_name },
        result_data: { best_email: bestCandidate.email, confidence: bestCandidate.confidence, candidates_count: scoredCandidates.length },
        fields_enriched: ["email"],
      });
    }

    return new Response(JSON.stringify({
      success: true,
      domain,
      mx_valid: mx.hasMX,
      mx_records: mx.records,
      is_catch_all: isCatchAll,
      best_email: bestCandidate?.email,
      best_confidence: bestCandidate?.confidence,
      candidates: scoredCandidates.slice(0, 5),
      total_patterns: scoredCandidates.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
