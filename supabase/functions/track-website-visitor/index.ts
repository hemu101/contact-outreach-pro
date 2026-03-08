import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      account_id, // the user_id of the account owner
      visitor_id, // anonymous cookie-based ID
      event_type, // page_view, identify, form_submit, click
      page_url,
      page_title,
      referrer,
      email, // for identify events
      metadata,
    } = body;

    if (!account_id || !visitor_id) {
      return new Response(JSON.stringify({ error: "Missing account_id or visitor_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "";
    const userAgent = req.headers.get("user-agent") || "";

    // Upsert tracking session
    const { data: existingSession } = await supabase
      .from("tracking_sessions")
      .select("id, total_page_views, pages_viewed, contact_id")
      .eq("visitor_id", visitor_id)
      .eq("user_id", account_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let sessionId: string;
    let contactId: string | null = existingSession?.contact_id || null;

    // If identify event, try to match contact by email
    if (event_type === "identify" && email) {
      const { data: contact } = await supabase
        .from("company_contacts")
        .select("id")
        .eq("user_id", account_id)
        .eq("email", email)
        .limit(1)
        .single();

      if (contact) {
        contactId = contact.id;
      }
    }

    if (existingSession) {
      sessionId = existingSession.id;
      const pagesViewed = existingSession.pages_viewed || [];
      if (page_url) {
        pagesViewed.push({ url: page_url, title: page_title, timestamp: new Date().toISOString() });
      }
      await supabase
        .from("tracking_sessions")
        .update({
          total_page_views: (existingSession.total_page_views || 0) + (event_type === "page_view" ? 1 : 0),
          pages_viewed: pagesViewed,
          last_seen_at: new Date().toISOString(),
          is_identified: !!contactId || (event_type === "identify"),
          contact_id: contactId,
          email: email || undefined,
        })
        .eq("id", sessionId);
    } else {
      const { data: newSession } = await supabase
        .from("tracking_sessions")
        .insert({
          user_id: account_id,
          visitor_id,
          contact_id: contactId,
          email,
          ip_address: ip,
          user_agent: userAgent,
          referrer,
          landing_page: page_url,
          pages_viewed: page_url ? [{ url: page_url, title: page_title, timestamp: new Date().toISOString() }] : [],
          total_page_views: event_type === "page_view" ? 1 : 0,
          is_identified: !!contactId,
        })
        .select("id")
        .single();
      sessionId = newSession?.id || "";
    }

    // Log activity if contact is identified
    if (contactId) {
      await supabase.from("contact_activities").insert({
        user_id: account_id,
        contact_id: contactId,
        activity_type: event_type,
        title: page_title || event_type,
        description: page_url ? `Visited ${page_url}` : undefined,
        source: "tracking_script",
        ip_address: ip,
        user_agent: userAgent,
        page_url,
        metadata: metadata || {},
      });
    }

    return new Response(
      JSON.stringify({ success: true, session_id: sessionId, identified: !!contactId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
