import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Webhook handler for SendGrid, Resend, and other email providers
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const contentType = req.headers.get("content-type") || "";
    let payload: any;

    // Handle different content types from various providers
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      payload = await req.text();
    }

    console.log("Webhook received:", JSON.stringify(payload).slice(0, 500));

    // Detect provider and parse accordingly
    const emailData = parseEmailPayload(payload, req.headers);

    if (!emailData) {
      console.log("Could not parse email payload");
      return new Response(
        JSON.stringify({ error: "Invalid payload format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsed email:", emailData.from_email, emailData.subject);

    // Find matching contact
    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, user_id, first_name, last_name, email")
      .eq("email", emailData.from_email)
      .limit(1);

    const matchedContact = contacts?.[0];
    let matchedCampaign = null;
    let matchedCampaignContact = null;

    if (matchedContact) {
      console.log("Matched contact:", matchedContact.id);

      // Try to find campaign by in_reply_to header
      if (emailData.in_reply_to) {
        const { data: sentEmails } = await supabase
          .from("email_inbox")
          .select("campaign_id, campaign_contact_id")
          .eq("message_id", emailData.in_reply_to)
          .limit(1);

        if (sentEmails?.[0]) {
          matchedCampaign = sentEmails[0].campaign_id;
          matchedCampaignContact = sentEmails[0].campaign_contact_id;
        }
      }

      // Fallback: find recent campaign sent to this contact
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

    // Determine user_id
    let userId = matchedContact?.user_id;

    if (!userId) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", emailData.to_email)
        .limit(1);

      if (profiles?.[0]) {
        userId = profiles[0].id;
      }
    }

    if (!userId) {
      console.log("Could not determine user for email");
      // Still return 200 to prevent webhook retries
      return new Response(
        JSON.stringify({ success: false, reason: "no_user_found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to inbox
    const { data: savedEmail, error: saveError } = await supabase
      .from("email_inbox")
      .insert({
        user_id: userId,
        from_email: emailData.from_email,
        from_name: emailData.from_name || null,
        to_email: emailData.to_email,
        subject: emailData.subject || null,
        body_text: emailData.body_text || null,
        body_html: emailData.body_html || null,
        message_id: emailData.message_id || null,
        in_reply_to: emailData.in_reply_to || null,
        received_at: emailData.received_at || new Date().toISOString(),
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

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action_type: matchedCampaign ? "campaign_reply_received" : "email_received",
      entity_type: "email_inbox",
      entity_id: savedEmail.id,
      metadata: {
        from_email: emailData.from_email,
        subject: emailData.subject,
        contact_id: matchedContact?.id,
        campaign_id: matchedCampaign,
        provider: emailData.provider,
      },
    });

    // Update campaign contact status if it's a reply
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
    console.error("Webhook error:", error);
    // Return 200 to prevent retries for parsing errors
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface ParsedEmail {
  from_email: string;
  from_name?: string;
  to_email: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  message_id?: string;
  in_reply_to?: string;
  received_at?: string;
  provider: string;
}

function parseEmailPayload(payload: any, headers: Headers): ParsedEmail | null {
  // Detect Resend webhook format
  if (payload.type && payload.data && payload.type.startsWith("email.")) {
    return parseResendPayload(payload);
  }

  // Detect SendGrid Inbound Parse format
  if (payload.from || payload.envelope) {
    return parseSendGridPayload(payload);
  }

  // Detect Brevo (Sendinblue) webhook format
  if (payload.event && payload.email) {
    return parseBrevoPayload(payload);
  }

  // Generic JSON format
  if (payload.from_email) {
    return {
      from_email: payload.from_email,
      from_name: payload.from_name,
      to_email: payload.to_email || payload.to,
      subject: payload.subject,
      body_text: payload.body_text || payload.text,
      body_html: payload.body_html || payload.html,
      message_id: payload.message_id,
      in_reply_to: payload.in_reply_to,
      received_at: payload.received_at || payload.timestamp,
      provider: "generic",
    };
  }

  return null;
}

function parseResendPayload(payload: any): ParsedEmail | null {
  const data = payload.data;
  if (!data) return null;

  // Resend inbound email events
  if (payload.type === "email.received") {
    return {
      from_email: data.from?.email || data.from,
      from_name: data.from?.name,
      to_email: Array.isArray(data.to) ? data.to[0]?.email || data.to[0] : data.to,
      subject: data.subject,
      body_text: data.text,
      body_html: data.html,
      message_id: data.message_id || data.id,
      in_reply_to: data.in_reply_to,
      received_at: data.created_at || new Date().toISOString(),
      provider: "resend",
    };
  }

  return null;
}

function parseSendGridPayload(payload: any): ParsedEmail | null {
  // Parse "from" field - can be "Name <email>" or just "email"
  let fromEmail = "";
  let fromName = "";
  
  if (typeof payload.from === "string") {
    const match = payload.from.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      fromName = match[1].trim().replace(/^["']|["']$/g, "");
      fromEmail = match[2].trim();
    } else {
      fromEmail = payload.from.trim();
    }
  }

  // Parse envelope for additional info
  let toEmail = "";
  if (payload.envelope) {
    try {
      const envelope = typeof payload.envelope === "string" 
        ? JSON.parse(payload.envelope) 
        : payload.envelope;
      toEmail = envelope.to?.[0] || payload.to || "";
    } catch {
      toEmail = payload.to || "";
    }
  } else {
    toEmail = payload.to || "";
  }

  if (!fromEmail) return null;

  return {
    from_email: fromEmail,
    from_name: fromName || undefined,
    to_email: toEmail,
    subject: payload.subject,
    body_text: payload.text || payload.plain,
    body_html: payload.html,
    message_id: payload.headers?.["Message-ID"] || payload["message-id"],
    in_reply_to: payload.headers?.["In-Reply-To"] || payload["in-reply-to"],
    received_at: new Date().toISOString(),
    provider: "sendgrid",
  };
}

function parseBrevoPayload(payload: any): ParsedEmail | null {
  // Brevo inbound parsing webhook
  if (payload.event !== "inbound") return null;

  return {
    from_email: payload.email || payload["sender-email"],
    from_name: payload["sender-name"],
    to_email: payload["recipient-email"] || payload.to,
    subject: payload.subject,
    body_text: payload["text-body"] || payload.text,
    body_html: payload["html-body"] || payload.html,
    message_id: payload["message-id"],
    in_reply_to: payload["in-reply-to"],
    received_at: payload.date || new Date().toISOString(),
    provider: "brevo",
  };
}
