import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaignId: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { campaignId }: CampaignRequest = await req.json();
    console.log(`Processing campaign: ${campaignId}`);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*, templates(*)")
      .eq("id", campaignId)
      .eq("user_id", user.id)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found or access denied");
    }

    // Get campaign contacts with contact details
    const { data: campaignContacts, error: contactsError } = await supabase
      .from("campaign_contacts")
      .select("*, contacts(*)")
      .eq("campaign_id", campaignId)
      .eq("status", "pending");

    if (contactsError) {
      throw new Error(`Failed to get contacts: ${contactsError.message}`);
    }

    console.log(`Found ${campaignContacts?.length || 0} pending contacts`);

    // Update campaign status to running
    await supabase
      .from("campaigns")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", campaignId);

    let sentCount = 0;
    let failedCount = 0;

    // Get template content
    const template = campaign.templates;

    for (const cc of campaignContacts || []) {
      const contact = cc.contacts;
      if (!contact?.email) {
        console.log(`Skipping contact ${cc.contact_id}: no email`);
        continue;
      }

      try {
        // Parse template with contact data
        const subject = parseTemplate(template?.subject || "Hello {{firstName}}", contact);
        const body = parseTemplate(template?.content || "Hi {{firstName}}!", contact);

        // Generate tracking pixel URL
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email?id=${cc.id}&event=open`;
        
        // Wrap links for click tracking
        const htmlBody = wrapLinksForTracking(body, cc.id);
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${htmlBody.replace(/\n/g, "<br>")}
            <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
          </div>
        `;

        if (RESEND_API_KEY) {
          // Send via Resend
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "OutreachAI <onboarding@resend.dev>",
              to: [contact.email],
              subject: subject,
              html: htmlContent,
            }),
          });

          if (!emailResponse.ok) {
            const errorData = await emailResponse.text();
            throw new Error(`Resend API error: ${errorData}`);
          }

          console.log(`Email sent to ${contact.email}`);
        } else {
          // Demo mode - log email
          console.log(`[DEMO] Would send email to ${contact.email}`);
          console.log(`[DEMO] Subject: ${subject}`);
        }

        // Update campaign contact status
        await supabase
          .from("campaign_contacts")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", cc.id);

        // Update contact status
        await supabase
          .from("contacts")
          .update({ email_sent: true, status: "sent" })
          .eq("id", contact.id);

        sentCount++;
      } catch (error: any) {
        console.error(`Failed to send to ${contact.email}:`, error.message);
        
        await supabase
          .from("campaign_contacts")
          .update({ status: "failed", error_message: error.message })
          .eq("id", cc.id);

        failedCount++;
      }

      // Rate limiting - wait 100ms between emails
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update campaign stats
    await supabase
      .from("campaigns")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
      })
      .eq("id", campaignId);

    console.log(`Campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Campaign sent: ${sentCount} emails delivered, ${failedCount} failed`,
        sentCount,
        failedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error processing campaign:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

function parseTemplate(template: string, contact: any): string {
  return template
    .replace(/\{\{firstName\}\}/g, contact.first_name || "")
    .replace(/\{\{lastName\}\}/g, contact.last_name || "")
    .replace(/\{\{businessName\}\}/g, contact.business_name || "")
    .replace(/\{\{email\}\}/g, contact.email || "");
}

function wrapLinksForTracking(content: string, campaignContactId: string): string {
  const linkRegex = /https?:\/\/[^\s<]+/g;
  const baseUrl = Deno.env.get("SUPABASE_URL");
  
  return content.replace(linkRegex, (url) => {
    const trackingUrl = `${baseUrl}/functions/v1/track-email?id=${campaignContactId}&event=click&url=${encodeURIComponent(url)}`;
    return `<a href="${trackingUrl}">${url}</a>`;
  });
}
