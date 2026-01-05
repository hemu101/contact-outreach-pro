import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncomingEmail {
  from_email: string;
  from_name?: string;
  to_email: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  message_id?: string;
  in_reply_to?: string;
  received_at?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const email: IncomingEmail = await req.json();
    console.log("Processing incoming email:", email.from_email, email.subject);

    // Extract user_id from the to_email address
    // This assumes emails are forwarded to a user-specific address
    // In production, you'd use a proper email forwarding setup
    
    // Try to find matching contact by email
    const { data: contacts, error: contactError } = await supabase
      .from("contacts")
      .select("id, user_id, first_name, last_name, email")
      .eq("email", email.from_email)
      .limit(1);

    if (contactError) {
      console.error("Error finding contact:", contactError);
    }

    const matchedContact = contacts?.[0];
    let matchedCampaign = null;
    let matchedCampaignContact = null;

    if (matchedContact) {
      console.log("Matched contact:", matchedContact.id);

      // Try to find the campaign this reply is for
      // First check by in_reply_to header
      if (email.in_reply_to) {
        const { data: sentEmails } = await supabase
          .from("email_inbox")
          .select("campaign_id, campaign_contact_id")
          .eq("message_id", email.in_reply_to)
          .limit(1);

        if (sentEmails?.[0]) {
          matchedCampaign = sentEmails[0].campaign_id;
          matchedCampaignContact = sentEmails[0].campaign_contact_id;
        }
      }

      // If no match by in_reply_to, try to find recent campaigns sent to this contact
      if (!matchedCampaign) {
        const { data: campaignContacts } = await supabase
          .from("campaign_contacts")
          .select("campaign_id, id")
          .eq("contact_id", matchedContact.id)
          .eq("status", "sent")
          .order("sent_at", { ascending: false })
          .limit(1);

        if (campaignContacts?.[0]) {
          matchedCampaign = campaignContacts[0].campaign_id;
          matchedCampaignContact = campaignContacts[0].id;
        }
      }
    }

    // Determine the user_id for this email
    let userId = matchedContact?.user_id;

    // If no matched contact, try to find user by to_email in email_settings or profiles
    if (!userId) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.to_email)
        .limit(1);

      if (profiles?.[0]) {
        userId = profiles[0].id;
      }
    }

    if (!userId) {
      console.log("Could not determine user for email");
      return new Response(
        JSON.stringify({ error: "Could not determine recipient user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save the email to inbox
    const { data: savedEmail, error: saveError } = await supabase
      .from("email_inbox")
      .insert({
        user_id: userId,
        from_email: email.from_email,
        from_name: email.from_name || null,
        to_email: email.to_email,
        subject: email.subject || null,
        body_text: email.body_text || null,
        body_html: email.body_html || null,
        message_id: email.message_id || null,
        in_reply_to: email.in_reply_to || null,
        received_at: email.received_at || new Date().toISOString(),
        folder: "inbox",
        is_read: false,
        is_starred: false,
        contact_id: matchedContact?.id || null,
        campaign_id: matchedCampaign || null,
        campaign_contact_id: matchedCampaignContact || null,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving email:", saveError);
      throw saveError;
    }

    console.log("Email saved:", savedEmail.id);

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action_type: matchedCampaign ? "campaign_reply_received" : "email_received",
      entity_type: "email_inbox",
      entity_id: savedEmail.id,
      metadata: {
        from_email: email.from_email,
        subject: email.subject,
        contact_id: matchedContact?.id,
        campaign_id: matchedCampaign,
        matched_by: matchedContact ? (email.in_reply_to ? "in_reply_to" : "contact_email") : null,
      },
    });

    // If this is a campaign reply, update the campaign contact status
    if (matchedCampaignContact) {
      await supabase
        .from("campaign_contacts")
        .update({ status: "replied" })
        .eq("id", matchedCampaignContact);

      console.log("Updated campaign contact status to replied");
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: savedEmail.id,
        matched_contact: matchedContact?.id || null,
        matched_campaign: matchedCampaign || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
