import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
          contacts(id, first_name, last_name, email, business_name),
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

      if (!contact?.email || !seq) {
        console.log("Missing contact or sequence data, skipping");
        continue;
      }

      // Parse template
      const subject = parseTemplate(seq.subject || "Follow-up", contact);
      const content = parseTemplate(seq.content || "", contact);

      console.log(`Sending follow-up to ${contact.email}: ${subject}`);

      // Get user's email settings
      const userId = followUp.campaign_contacts?.campaigns?.user_id;
      const { data: settings } = await supabase
        .from("email_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      let sent = false;

      // Try to send via Resend
      if (RESEND_API_KEY) {
        try {
          const resend = new Resend(RESEND_API_KEY);
          await resend.emails.send({
            from: "Follow-up <onboarding@resend.dev>",
            to: [contact.email],
            subject: subject,
            html: `<div>${content.replace(/\n/g, "<br>")}</div>`,
          });
          sent = true;
        } catch (e) {
          console.error("Resend error:", e);
        }
      }

      // Update queue status
      await supabase
        .from("follow_up_queue")
        .update({
          status: sent ? "sent" : "failed",
          sent_at: sent ? new Date().toISOString() : null,
        })
        .eq("id", followUp.id);

      if (sent) sentCount++;
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
    .replace(/\{\{email\}\}/g, contact.email || "");
}
