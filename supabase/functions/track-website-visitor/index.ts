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
      account_id,
      visitor_id,
      event_type,
      page_url,
      page_title,
      referrer,
      email,
      metadata,
      device_type,
      browser,
      os,
      screen_resolution,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      scroll_depth,
      click_count,
      time_on_page,
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
      .select("id, total_page_views, pages_viewed, contact_id, total_clicks, duration_seconds")
      .eq("visitor_id", visitor_id)
      .eq("user_id", account_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let sessionId: string;
    let contactId: string | null = existingSession?.contact_id || null;

    // If identify event, match contact by email
    if (event_type === "identify" && email) {
      const { data: contact } = await supabase
        .from("company_contacts")
        .select("id")
        .eq("user_id", account_id)
        .eq("email", email)
        .limit(1)
        .single();
      if (contact) contactId = contact.id;
    }

    // Detect social referrer
    let socialSource: string | null = null;
    if (referrer) {
      const socialMatch = referrer.match(/(facebook|instagram|twitter|linkedin|tiktok|youtube|pinterest)/i);
      if (socialMatch) socialSource = socialMatch[1].toLowerCase();
    }

    // Calculate engagement score
    const pageViews = (existingSession?.total_page_views || 0) + (event_type === "page_view" ? 1 : 0);
    const clicks = (existingSession?.total_clicks || 0) + (click_count || 0);
    const duration = (existingSession?.duration_seconds || 0) + (time_on_page || 0);
    const engagementScore = Math.min(
      (pageViews * 10) + (clicks * 5) + (Math.min(duration, 600) / 10) + ((scroll_depth || 0) / 5) + (contactId ? 20 : 0),
      100
    );

    if (existingSession) {
      sessionId = existingSession.id;
      const pagesViewed = existingSession.pages_viewed || [];
      if (page_url && event_type === "page_view") {
        pagesViewed.push({ url: page_url, title: page_title, timestamp: new Date().toISOString() });
      }
      await supabase
        .from("tracking_sessions")
        .update({
          total_page_views: pageViews,
          pages_viewed: pagesViewed,
          last_seen_at: new Date().toISOString(),
          is_identified: !!contactId || event_type === "identify",
          contact_id: contactId,
          email: email || undefined,
          device_type: device_type || undefined,
          browser: browser || undefined,
          os: os || undefined,
          screen_resolution: screen_resolution || undefined,
          utm_source: utm_source || undefined,
          utm_medium: utm_medium || undefined,
          utm_campaign: utm_campaign || undefined,
          total_clicks: clicks,
          avg_scroll_depth: scroll_depth || undefined,
          engagement_score: engagementScore,
          social_source: socialSource || undefined,
          duration_seconds: duration,
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
          device_type,
          browser,
          os,
          screen_resolution,
          utm_source,
          utm_medium,
          utm_campaign,
          total_clicks: click_count || 0,
          avg_scroll_depth: scroll_depth || 0,
          engagement_score: engagementScore,
          social_source: socialSource,
          duration_seconds: time_on_page || 0,
        })
        .select("id")
        .single();
      sessionId = newSession?.id || "";
    }

    // Store detailed event
    await supabase.from("visitor_events").insert({
      user_id: account_id,
      session_id: sessionId,
      visitor_id,
      event_type,
      page_url,
      page_title,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      device_type,
      browser,
      os,
      screen_resolution,
      scroll_depth: scroll_depth || null,
      duration_on_page: time_on_page || null,
      element_text: metadata?.text || null,
      element_selector: metadata?.selector || null,
      click_x: metadata?.x || null,
      click_y: metadata?.y || null,
      metadata: metadata || {},
    });

    // If social referrer detected, log social visitor
    if (socialSource) {
      await supabase.from("social_visitors").upsert({
        user_id: account_id,
        contact_id: contactId,
        platform: socialSource,
        source: "referral",
        last_interaction_at: new Date().toISOString(),
        metadata: { referrer, page_url },
      }, { onConflict: "id" }).select().maybeSingle();
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
        metadata: { ...metadata, device_type, browser, scroll_depth, utm_source },
      });
    }

    return new Response(
      JSON.stringify({ success: true, session_id: sessionId, identified: !!contactId, engagement_score: engagementScore }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
