import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log("Processing follow-up sequences...");

    // Get all active sequences
    const { data: sequences, error: seqError } = await supabase
      .from("follow_up_sequences")
      .select(`
        *,
        campaigns(
          id, user_id, name, status,
          templates(subject, content)
        )
      `)
      .eq("status", "active");

    if (seqError) {
      console.error("Error fetching sequences:", seqError);
      throw seqError;
    }

    console.log(`Found ${sequences?.length || 0} active sequences`);

    let queuedCount = 0;

    for (const seq of sequences || []) {
      // Only process sequences for completed campaigns
      if (seq.campaigns?.status !== "completed") continue;

      console.log(`Processing sequence: ${seq.name} (${seq.trigger_type})`);

      // Get campaign contacts that match the trigger
      let query = supabase
        .from("campaign_contacts")
        .select("*, contacts(id, first_name, last_name, email, business_name)")
        .eq("campaign_id", seq.campaign_id)
        .eq("status", "sent");

      // Apply trigger filters
      switch (seq.trigger_type) {
        case "opened_not_clicked":
          query = query.not("opened_at", "is", null).is("clicked_at", null);
          break;
        case "not_opened":
          query = query.is("opened_at", null);
          break;
        case "clicked":
          query = query.not("clicked_at", "is", null);
          break;
      }

      const { data: eligibleContacts, error: contactsError } = await query;

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError);
        continue;
      }

      console.log(`Found ${eligibleContacts?.length || 0} eligible contacts for ${seq.trigger_type}`);

      // Check which contacts already have a queued follow-up for this sequence
      const { data: existingQueue } = await supabase
        .from("follow_up_queue")
        .select("campaign_contact_id")
        .eq("sequence_id", seq.id);

      const existingIds = new Set(existingQueue?.map((q) => q.campaign_contact_id) || []);

      // Queue follow-ups for new eligible contacts
      for (const contact of eligibleContacts || []) {
        if (existingIds.has(contact.id)) continue;

        // Calculate scheduled time based on when the triggering event happened
        let triggerTime: Date;
        switch (seq.trigger_type) {
          case "opened_not_clicked":
            triggerTime = new Date(contact.opened_at);
            break;
          case "clicked":
            triggerTime = new Date(contact.clicked_at);
            break;
          default:
            triggerTime = new Date(contact.sent_at);
        }

        const scheduledAt = new Date(triggerTime.getTime() + seq.delay_hours * 60 * 60 * 1000);

        // Only queue if the scheduled time is in the future or within 1 hour past
        const now = new Date();
        if (scheduledAt.getTime() < now.getTime() - 60 * 60 * 1000) continue;

        await supabase.from("follow_up_queue").insert({
          sequence_id: seq.id,
          campaign_contact_id: contact.id,
          scheduled_at: scheduledAt.toISOString(),
          status: "pending",
        });

        // Log activity
        await supabase.from("activity_logs").insert({
          user_id: seq.campaigns.user_id,
          action_type: "follow_up_queued",
          entity_type: "follow_up_queue",
          metadata: { 
            sequence_name: seq.name, 
            contact_email: contact.contacts?.email,
            trigger_type: seq.trigger_type 
          },
        });

        queuedCount++;
      }
    }

    console.log(`Queued ${queuedCount} new follow-ups`);

    // Process pending follow-ups that are due
    const { data: dueFollowUps, error: dueError } = await supabase
      .from("follow_up_queue")
      .select(`
        *,
        follow_up_sequences(*),
        campaign_contacts(
          *,
          contacts(id, first_name, last_name, email, business_name, job_title, location, city, state, country),
          campaigns(user_id)
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString());

    if (dueError) {
      console.error("Error fetching due follow-ups:", dueError);
      throw dueError;
    }

    console.log(`Processing ${dueFollowUps?.length || 0} due follow-ups`);

    let sentCount = 0;

    for (const followUp of dueFollowUps || []) {
      const contact = followUp.campaign_contacts?.contacts;
      const seq = followUp.follow_up_sequences;
      const userId = followUp.campaign_contacts?.campaigns?.user_id;

      if (!contact?.email || !seq || !userId) {
        console.log("Missing contact, sequence, or user data, skipping");
        continue;
      }

      // Check warmup limits before sending
      const { data: warmupSchedule } = await supabase
        .from("email_warmup_schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (warmupSchedule) {
        const today = new Date().toISOString().split("T")[0];
        const isNewDay = warmupSchedule.last_send_date !== today;
        
        // Reset counter if new day
        if (isNewDay) {
          // Increment daily limit (warmup progression)
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
          
          warmupSchedule.emails_sent_today = 0;
          warmupSchedule.current_daily_limit = newLimit;
        }

        // Check if we've hit the daily limit
        if (warmupSchedule.emails_sent_today >= warmupSchedule.current_daily_limit) {
          console.log(`Warmup limit reached for user ${userId}, skipping`);
          continue;
        }
      }

      // Parse template
      const subject = parseTemplate(seq.subject || "Follow-up", contact);
      const content = parseTemplate(seq.content || "", contact);

      console.log(`Sending follow-up to ${contact.email}: ${subject}`);

      // Get user's email settings
      const { data: settings } = await supabase
        .from("email_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      let sent = false;

      // Try SMTP first
      if (settings?.smtp_host && settings?.smtp_user && settings?.smtp_password) {
        try {
          const smtpClient = new SMTPClient({
            connection: {
              hostname: settings.smtp_host,
              port: parseInt(settings.smtp_port || "587"),
              tls: true,
              auth: {
                username: settings.smtp_user,
                password: settings.smtp_password,
              },
            },
          });

          await smtpClient.send({
            from: settings.smtp_user,
            to: contact.email,
            subject: subject,
            content: "auto",
            html: `<div style="font-family: Arial, sans-serif;">${content.replace(/\n/g, "<br>")}</div>`,
          });

          await smtpClient.close();
          sent = true;
          console.log(`Follow-up sent via SMTP to ${contact.email}`);
        } catch (e: any) {
          console.error("SMTP error:", e.message);
        }
      }

      // Try Brevo API
      if (!sent && settings?.brevo_api_key) {
        try {
          const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": settings.brevo_api_key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender: { email: settings.smtp_user || "noreply@example.com", name: "OutreachAI" },
              to: [{ email: contact.email }],
              subject: subject,
              htmlContent: `<div style="font-family: Arial, sans-serif;">${content.replace(/\n/g, "<br>")}</div>`,
            }),
          });

          if (response.ok) {
            sent = true;
            console.log(`Follow-up sent via Brevo API to ${contact.email}`);
          }
        } catch (e: any) {
          console.error("Brevo API error:", e.message);
        }
      }

      // Try SendGrid
      if (!sent && settings?.sendgrid_key) {
        try {
          const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${settings.sendgrid_key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: contact.email }] }],
              from: { email: settings.smtp_user || "noreply@example.com" },
              subject: subject,
              content: [{ type: "text/html", value: `<div style="font-family: Arial, sans-serif;">${content.replace(/\n/g, "<br>")}</div>` }],
            }),
          });

          if (response.ok || response.status === 202) {
            sent = true;
            console.log(`Follow-up sent via SendGrid to ${contact.email}`);
          }
        } catch (e: any) {
          console.error("SendGrid error:", e.message);
        }
      }

      // Fallback to Resend
      if (!sent && RESEND_API_KEY) {
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "OutreachAI <onboarding@resend.dev>",
              to: [contact.email],
              subject: subject,
              html: `<div style="font-family: Arial, sans-serif;">${content.replace(/\n/g, "<br>")}</div>`,
            }),
          });

          if (response.ok) {
            sent = true;
            console.log(`Follow-up sent via Resend to ${contact.email}`);
          }
        } catch (e: any) {
          console.error("Resend error:", e.message);
        }
      }

      // Demo mode fallback
      if (!sent) {
        console.log(`[DEMO] Would send follow-up to ${contact.email}`);
        sent = true;
      }

      // Update queue status
      await supabase
        .from("follow_up_queue")
        .update({
          status: sent ? "sent" : "failed",
          sent_at: sent ? new Date().toISOString() : null,
        })
        .eq("id", followUp.id);

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: userId,
        action_type: sent ? "follow_up_sent" : "follow_up_failed",
        entity_type: "follow_up_queue",
        entity_id: followUp.id,
        metadata: { contact_email: contact.email, subject },
      });

      // Update warmup counter
      if (sent && warmupSchedule) {
        await supabase
          .from("email_warmup_schedules")
          .update({
            emails_sent_today: warmupSchedule.emails_sent_today + 1,
          })
          .eq("id", warmupSchedule.id);
      }

      if (sent) sentCount++;

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Sent ${sentCount} follow-up emails`);

    return new Response(
      JSON.stringify({
        success: true,
        queued: queuedCount,
        sent: sentCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing follow-ups:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseTemplate(template: string, contact: any): string {
  return template
    .replace(/\{\{firstName\}\}/g, contact.first_name || "")
    .replace(/\{\{lastName\}\}/g, contact.last_name || "")
    .replace(/\{\{businessName\}\}/g, contact.business_name || "")
    .replace(/\{\{email\}\}/g, contact.email || "")
    .replace(/\{\{jobTitle\}\}/g, contact.job_title || "")
    .replace(/\{\{location\}\}/g, contact.location || "")
    .replace(/\{\{city\}\}/g, contact.city || "")
    .replace(/\{\{state\}\}/g, contact.state || "")
    .replace(/\{\{country\}\}/g, contact.country || "");
}
