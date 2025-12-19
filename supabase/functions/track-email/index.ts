import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// 1x1 transparent GIF for tracking pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
]);

serve(async (req: Request) => {
  const url = new URL(req.url);
  const campaignContactId = url.searchParams.get("id");
  const event = url.searchParams.get("event") || "open";
  const redirectUrl = url.searchParams.get("url");

  console.log(`Tracking event: ${event} for campaign_contact: ${campaignContactId}`);

  if (!campaignContactId) {
    return new Response("Missing id parameter", { status: 400 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Record the event
    await supabase.from("email_events").insert({
      campaign_contact_id: campaignContactId,
      event_type: event,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
      metadata: { url: redirectUrl },
    });

    // Update campaign_contacts timestamp
    if (event === "open") {
      await supabase
        .from("campaign_contacts")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", campaignContactId)
        .is("opened_at", null);

      // Update campaign open count
      const { data: cc } = await supabase
        .from("campaign_contacts")
        .select("campaign_id")
        .eq("id", campaignContactId)
        .single();

      if (cc) {
        // Increment open count directly
        await supabase
          .from("campaigns")
          .update({ open_count: 1 })
          .eq("id", cc.campaign_id);
      }
    } else if (event === "click") {
      await supabase
        .from("campaign_contacts")
        .update({ clicked_at: new Date().toISOString() })
        .eq("id", campaignContactId)
        .is("clicked_at", null);
    }

    console.log(`Event ${event} recorded for ${campaignContactId}`);

    // Handle response based on event type
    if (event === "click" && redirectUrl) {
      // Redirect to original URL for click tracking
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    }

    // Return tracking pixel for open events
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("Error tracking event:", error);
    
    // Still return pixel/redirect even on error
    if (event === "click" && redirectUrl) {
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    }
    
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: { "Content-Type": "image/gif" },
    });
  }
});
