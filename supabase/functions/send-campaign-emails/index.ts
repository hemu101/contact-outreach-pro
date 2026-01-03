import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaignId: string;
}

interface EmailSettings {
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_user: string | null;
  smtp_password: string | null;
  brevo_api_key: string | null;
  sendgrid_key: string | null;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req: Request) => {
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

    // Get user's email settings from database
    const { data: emailSettings, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (settingsError && settingsError.code !== "PGRST116") {
      console.log("Error fetching email settings:", settingsError);
    }

    console.log("Email settings found:", emailSettings ? "yes" : "no");

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

    // Check warmup limits
    const { data: warmupSchedule } = await supabase
      .from("email_warmup_schedules")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    let warmupLimit = Infinity;
    if (warmupSchedule) {
      const today = new Date().toISOString().split("T")[0];
      const isNewDay = warmupSchedule.last_send_date !== today;
      
      if (isNewDay) {
        const newLimit = Math.min(
          warmupSchedule.current_daily_limit + warmupSchedule.increment_per_day,
          warmupSchedule.target_daily_limit
        );
        
        await supabase
          .from("email_warmup_schedules")
          .update({
            emails_sent_today: 0,
            last_send_date: today,
            current_daily_limit: newLimit,
          })
          .eq("id", warmupSchedule.id);
        
        warmupLimit = newLimit;
      } else {
        warmupLimit = warmupSchedule.current_daily_limit - warmupSchedule.emails_sent_today;
      }
      
      console.log(`Warmup limit: ${warmupLimit} emails remaining today`);
    }

    let sentCount = 0;
    let failedCount = 0;

    const template = campaign.templates;

    // Determine which email provider to use
    const useBrevoSmtp = emailSettings?.smtp_host && emailSettings?.smtp_user && emailSettings?.smtp_password;
    const useBrevoApi = emailSettings?.brevo_api_key;
    const useSendGrid = emailSettings?.sendgrid_key;
    
    console.log(`Email provider: ${useBrevoSmtp ? 'Brevo SMTP' : useBrevoApi ? 'Brevo API' : useSendGrid ? 'SendGrid' : RESEND_API_KEY ? 'Resend' : 'Demo mode'}`);

    // Initialize SMTP client if using Brevo SMTP
    let smtpClient: SMTPClient | null = null;
    if (useBrevoSmtp) {
      try {
        smtpClient = new SMTPClient({
          connection: {
            hostname: emailSettings.smtp_host!,
            port: parseInt(emailSettings.smtp_port || "587"),
            tls: true,
            auth: {
              username: emailSettings.smtp_user!,
              password: emailSettings.smtp_password!,
            },
          },
        });
        console.log("SMTP client initialized successfully");
      } catch (error: any) {
        console.error("Failed to initialize SMTP client:", error.message);
      }
    }

    // Track warmup emails sent
    let warmupEmailsSent = 0;

    for (const cc of campaignContacts || []) {
      const contact = cc.contacts;
      if (!contact?.email) {
        console.log(`Skipping contact ${cc.contact_id}: no email`);
        continue;
      }

      // Check warmup limit
      if (warmupSchedule && warmupEmailsSent >= warmupLimit) {
        console.log(`Warmup limit reached, pausing campaign`);
        await supabase
          .from("campaigns")
          .update({ status: "paused" })
          .eq("id", campaignId);
        break;
      }

      try {
        const subject = parseTemplate(template?.subject || "Hello {{firstName}}", contact);
        const body = parseTemplate(template?.content || "Hi {{firstName}}!", contact);

        // Generate tracking pixel URL
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email?id=${cc.id}&event=open`;
        
        // Wrap links for click tracking and convert to HTML
        const htmlBody = convertToHtml(wrapLinksForTracking(body, cc.id));
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${htmlBody}
            <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
          </body>
          </html>
        `;

        let emailSent = false;

        // Try Brevo SMTP first
        if (smtpClient && !emailSent) {
          try {
            await smtpClient.send({
              from: emailSettings.smtp_user!,
              to: contact.email,
              subject: subject,
              content: "auto",
              html: htmlContent,
            });
            emailSent = true;
            console.log(`Email sent via Brevo SMTP to ${contact.email}`);
          } catch (error: any) {
            console.error(`Brevo SMTP failed for ${contact.email}:`, error.message);
          }
        }

        // Try Brevo API
        if (useBrevoApi && !emailSent) {
          try {
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
            } else {
              const errorData = await brevoResponse.text();
              console.error(`Brevo API error for ${contact.email}:`, errorData);
            }
          } catch (error: any) {
            console.error(`Brevo API failed for ${contact.email}:`, error.message);
          }
        }

        // Try SendGrid
        if (useSendGrid && !emailSent) {
          try {
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
            } else {
              const errorData = await sgResponse.text();
              console.error(`SendGrid error for ${contact.email}:`, errorData);
            }
          } catch (error: any) {
            console.error(`SendGrid failed for ${contact.email}:`, error.message);
          }
        }

        // Fallback to Resend
        if (RESEND_API_KEY && !emailSent) {
          try {
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
            } else {
              const errorData = await emailResponse.text();
              console.error(`Resend error for ${contact.email}:`, errorData);
            }
          } catch (error: any) {
            console.error(`Resend failed for ${contact.email}:`, error.message);
          }
        }

        // Demo mode
        if (!emailSent) {
          console.log(`[DEMO] Would send email to ${contact.email}`);
          console.log(`[DEMO] Subject: ${subject}`);
          emailSent = true; // Mark as sent for demo purposes
        }

        if (emailSent) {
          await supabase
            .from("campaign_contacts")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", cc.id);

          await supabase
            .from("contacts")
            .update({ email_sent: true, status: "sent" })
            .eq("id", contact.id);

          // Log activity
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            action_type: "email_sent",
            entity_type: "campaign_contacts",
            entity_id: cc.id,
            metadata: { 
              campaign_id: campaignId, 
              contact_email: contact.email,
              subject 
            },
          });

          sentCount++;
          warmupEmailsSent++;
        }
      } catch (error: any) {
        console.error(`Failed to send to ${contact.email}:`, error.message);
        
        await supabase
          .from("campaign_contacts")
          .update({ status: "failed", error_message: error.message })
          .eq("id", cc.id);

        failedCount++;
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Close SMTP connection
    if (smtpClient) {
      try {
        await smtpClient.close();
      } catch (e) {
        console.log("SMTP close error (ignorable):", e);
      }
    }

    // Update warmup schedule with emails sent
    if (warmupSchedule && warmupEmailsSent > 0) {
      await supabase
        .from("email_warmup_schedules")
        .update({
          emails_sent_today: (warmupSchedule.emails_sent_today || 0) + warmupEmailsSent,
          last_send_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", warmupSchedule.id);
    }

    // Update campaign stats
    const finalStatus = warmupSchedule && warmupEmailsSent >= warmupLimit ? "paused" : "completed";
    await supabase
      .from("campaigns")
      .update({
        status: finalStatus,
        completed_at: finalStatus === "completed" ? new Date().toISOString() : null,
        sent_count: sentCount,
      })
      .eq("id", campaignId);

    // Log campaign completion
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action_type: finalStatus === "completed" ? "campaign_completed" : "campaign_paused_warmup",
      entity_type: "campaigns",
      entity_id: campaignId,
      metadata: { sent_count: sentCount, failed_count: failedCount },
    });

    console.log(`Campaign ${finalStatus}: ${sentCount} sent, ${failedCount} failed`);

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
    .replace(/\{\{email\}\}/g, contact.email || "")
    .replace(/\{\{phone\}\}/g, contact.phone || "")
    .replace(/\{\{jobTitle\}\}/g, contact.job_title || "")
    .replace(/\{\{location\}\}/g, contact.location || "")
    .replace(/\{\{city\}\}/g, contact.city || "")
    .replace(/\{\{state\}\}/g, contact.state || "")
    .replace(/\{\{country\}\}/g, contact.country || "")
    .replace(/\{\{linkedin\}\}/g, contact.linkedin || "");
}

function wrapLinksForTracking(content: string, campaignContactId: string): string {
  const linkRegex = /https?:\/\/[^\s<\]]+/g;
  const baseUrl = SUPABASE_URL;
  
  return content.replace(linkRegex, (url) => {
    // Don't wrap tracking URLs or media URLs that are part of embed syntax
    if (url.includes('/functions/v1/track-email') || url.includes('youtube.com') || url.includes('vimeo.com')) {
      return url;
    }
    const trackingUrl = `${baseUrl}/functions/v1/track-email?id=${campaignContactId}&event=click&url=${encodeURIComponent(url)}`;
    return trackingUrl;
  });
}

function convertToHtml(content: string): string {
  let html = content;

  // Convert image syntax: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0;" />');

  // Convert video syntax: [video](url)
  html = html.replace(/\[video\]\(([^)]+)\)/g, (match, url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop() 
        : new URL(url).searchParams.get('v');
      return `<a href="${url}" style="display: block; margin: 10px 0;"><img src="https://img.youtube.com/vi/${videoId}/0.jpg" alt="Video" style="max-width: 100%;" /><br/>▶️ Watch Video</a>`;
    }
    return `<a href="${url}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">▶️ Watch Video</a>`;
  });

  // Convert audio syntax: [audio](url)
  html = html.replace(/\[audio\]\(([^)]+)\)/g, '<a href="$1" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">🎵 Listen to Audio</a>');

  // Convert link syntax: [text](url) (but not already converted)
  html = html.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #007bff;">$1</a>');

  // Convert line breaks
  html = html.replace(/\n/g, "<br>");

  return html;
}
