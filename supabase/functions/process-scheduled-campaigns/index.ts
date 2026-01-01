import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log("Checking for scheduled campaigns...");

    // Find campaigns that are scheduled and due to run
    const now = new Date().toISOString();
    const { data: scheduledCampaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("*, templates(*)")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (campaignsError) {
      throw new Error(`Failed to fetch scheduled campaigns: ${campaignsError.message}`);
    }

    console.log(`Found ${scheduledCampaigns?.length || 0} campaigns ready to send`);

    const results = [];

    for (const campaign of scheduledCampaigns || []) {
      console.log(`Processing scheduled campaign: ${campaign.id} - ${campaign.name}`);

      try {
        // Get campaign contacts count
        const { count } = await supabase
          .from("campaign_contacts")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", campaign.id)
          .eq("status", "pending");

        if (!count || count === 0) {
          console.log(`Campaign ${campaign.id} has no pending contacts, skipping`);
          await supabase
            .from("campaigns")
            .update({ status: "completed", completed_at: now })
            .eq("id", campaign.id);
          continue;
        }

        // Update status to running
        await supabase
          .from("campaigns")
          .update({ status: "running", started_at: now })
          .eq("id", campaign.id);

        // Get user's email settings
        const { data: emailSettings } = await supabase
          .from("email_settings")
          .select("*")
          .eq("user_id", campaign.user_id)
          .single();

        // Get pending contacts
        const { data: campaignContacts, error: contactsError } = await supabase
          .from("campaign_contacts")
          .select("*, contacts(*)")
          .eq("campaign_id", campaign.id)
          .eq("status", "pending");

        if (contactsError) {
          throw new Error(`Failed to get contacts: ${contactsError.message}`);
        }

        let sentCount = 0;
        let failedCount = 0;
        const template = campaign.templates;

        // Determine email provider
        const useBrevoApi = emailSettings?.brevo_api_key;
        const useSendGrid = emailSettings?.sendgrid_key;
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

        for (const cc of campaignContacts || []) {
          const contact = cc.contacts;
          if (!contact?.email) continue;

          try {
            const subject = parseTemplate(template?.subject || "Hello {{firstName}}", contact);
            const body = parseTemplate(template?.content || "Hi {{firstName}}!", contact);

            const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email?id=${cc.id}&event=open`;
            const htmlBody = convertToHtml(wrapLinksForTracking(body, cc.id));
            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"></head>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                ${htmlBody}
                <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
              </body>
              </html>
            `;

            let emailSent = false;

            // Try Brevo API
            if (useBrevoApi && !emailSent) {
              const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                  "api-key": emailSettings.brevo_api_key!,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  sender: { email: emailSettings.smtp_user || "noreply@example.com", name: "OutreachAI" },
                  to: [{ email: contact.email }],
                  subject: subject,
                  htmlContent: htmlContent,
                }),
              });
              if (brevoResponse.ok) {
                emailSent = true;
                console.log(`Email sent via Brevo API to ${contact.email}`);
              }
            }

            // Try SendGrid
            if (useSendGrid && !emailSent) {
              const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${emailSettings.sendgrid_key}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  personalizations: [{ to: [{ email: contact.email }] }],
                  from: { email: emailSettings.smtp_user || "noreply@example.com" },
                  subject: subject,
                  content: [{ type: "text/html", value: htmlContent }],
                }),
              });
              if (sgResponse.ok || sgResponse.status === 202) {
                emailSent = true;
                console.log(`Email sent via SendGrid to ${contact.email}`);
              }
            }

            // Fallback to Resend
            if (RESEND_API_KEY && !emailSent) {
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
              if (emailResponse.ok) {
                emailSent = true;
                console.log(`Email sent via Resend to ${contact.email}`);
              }
            }

            if (emailSent) {
              await supabase
                .from("campaign_contacts")
                .update({ status: "sent", sent_at: new Date().toISOString() })
                .eq("id", cc.id);
              sentCount++;
            } else {
              throw new Error("No email provider available");
            }
          } catch (error: any) {
            console.error(`Failed to send to ${contact.email}:`, error.message);
            await supabase
              .from("campaign_contacts")
              .update({ status: "failed", error_message: error.message })
              .eq("id", cc.id);
            failedCount++;
          }

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
          .eq("id", campaign.id);

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          sentCount,
          failedCount,
          status: "completed",
        });

        console.log(`Campaign ${campaign.id} completed: ${sentCount} sent, ${failedCount} failed`);
      } catch (error: any) {
        console.error(`Error processing campaign ${campaign.id}:`, error.message);
        
        await supabase
          .from("campaigns")
          .update({ status: "failed" })
          .eq("id", campaign.id);

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          error: error.message,
          status: "failed",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} scheduled campaigns`,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in scheduled campaign processor:", error);
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
    .replace(/\{\{email\}\}/g, contact.email || "")
    .replace(/\{\{phone\}\}/g, contact.phone || "")
    .replace(/\{\{jobTitle\}\}/g, contact.job_title || "")
    .replace(/\{\{location\}\}/g, contact.location || "");
}

function wrapLinksForTracking(content: string, campaignContactId: string): string {
  const linkRegex = /https?:\/\/[^\s<\]]+/g;
  const baseUrl = SUPABASE_URL;
  
  return content.replace(linkRegex, (url) => {
    if (url.includes('/functions/v1/track-email')) return url;
    const trackingUrl = `${baseUrl}/functions/v1/track-email?id=${campaignContactId}&event=click&url=${encodeURIComponent(url)}`;
    return trackingUrl;
  });
}

function convertToHtml(content: string): string {
  let html = content;
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');
  html = html.replace(/\[video\]\(([^)]+)\)/g, '<a href="$1" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">▶️ Watch Video</a>');
  html = html.replace(/\[audio\]\(([^)]+)\)/g, '<a href="$1" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">🎵 Listen</a>');
  html = html.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #007bff;">$1</a>');
  html = html.replace(/\n/g, "<br>");
  return html;
}
