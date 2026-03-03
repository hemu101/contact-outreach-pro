import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ScrapedProfile {
  full_name: string;
  first_name: string;
  last_name: string;
  headline: string;
  location: string;
  about: string;
  profile_image_url: string;
  experiences: Array<{
    company_name: string;
    total_duration: string;
    roles: Array<{ title: string; dates: string; description: string }>;
  }>;
  skills: string[];
}

function parseProfileFromHtml(html: string, targetCompany?: string): { profile: ScrapedProfile; workingStatus: string } {
  // Extract name from <title> tag
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const titleText = titleMatch?.[1] || "";
  const fullName = titleText.split("|")[0]?.split("-")[0]?.replace(/\(.*\)/g, "").trim() || "N/A";
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Extract headline from meta description
  const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*?)"/i) 
    || html.match(/<meta[^>]*content="([^"]*?)"[^>]*name="description"/i);
  const metaDesc = metaDescMatch?.[1] || "";
  const headline = metaDesc.split("·")[0]?.trim() || "";

  // Extract location from meta or page content
  const locationMatch = html.match(/(?:location[\"\s:]+)([^",<]+)/i);
  const location = locationMatch?.[1]?.trim() || "";

  // Extract about section
  let about = "";
  const aboutMatch = html.match(/id="about"[\s\S]*?<span[^>]*aria-hidden="true"[^>]*>([\s\S]*?)<\/span>/i);
  if (aboutMatch) {
    about = aboutMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  // Extract profile image
  const imgMatch = html.match(/img[^>]*class="[^"]*pv-top-card[^"]*"[^>]*src="([^"]+)"/i)
    || html.match(/img[^>]*id="ember\d+"[^>]*src="(https:\/\/media\.licdn\.com[^"]+)"/i);
  const profileImageUrl = imgMatch?.[1] || "";

  // Extract experiences - parse experience section
  const experiences: ScrapedProfile["experiences"] = [];
  const expSectionMatch = html.match(/id="experience"[\s\S]*?<\/section>/i);
  if (expSectionMatch) {
    const expSection = expSectionMatch[0];
    // Extract company blocks
    const listItems = expSection.split(/li class="[^"]*artdeco-list__item/i);
    for (let i = 1; i < listItems.length; i++) {
      const item = listItems[i];
      // Extract visible text spans
      const visHiddenSpans = [...item.matchAll(/<span[^>]*class="visually-hidden"[^>]*>([\s\S]*?)<\/span>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, "").trim())
        .filter(Boolean);
      
      if (visHiddenSpans.length > 0) {
        const companyEntry: ScrapedProfile["experiences"][0] = {
          company_name: visHiddenSpans[1] || visHiddenSpans[0] || "N/A",
          total_duration: visHiddenSpans[2] || "N/A",
          roles: [{
            title: visHiddenSpans[0] || "N/A",
            dates: visHiddenSpans[2] || "N/A",
            description: visHiddenSpans[3] || ""
          }]
        };
        experiences.push(companyEntry);
      }
    }
  }

  // Determine working status based on target company
  let workingStatus = "False";
  if (targetCompany) {
    const tc = targetCompany.toLowerCase();
    const searchText = `${headline} ${experiences.map(e => e.company_name).join(" ")}`.toLowerCase();
    if (searchText.includes(tc)) {
      workingStatus = "True";
    }
  } else {
    workingStatus = "True"; // No target company to verify
  }

  return {
    profile: {
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      headline,
      location,
      about,
      profile_image_url: profileImageUrl,
      experiences,
      skills: [],
    },
    workingStatus,
  };
}

async function scrapeWithAI(html: string, linkedinUrl: string, targetCompany?: string): Promise<{ profile: ScrapedProfile; workingStatus: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  // Clean HTML - remove scripts, styles, keep text content
  const cleanHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .substring(0, 15000); // Limit size

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You extract LinkedIn profile data from HTML. Return ONLY valid JSON with this exact structure:
{
  "full_name": "string",
  "first_name": "string", 
  "last_name": "string",
  "headline": "string",
  "location": "string",
  "about": "string",
  "profile_image_url": "string",
  "experiences": [{"company_name": "string", "total_duration": "string", "roles": [{"title": "string", "dates": "string", "description": "string"}]}],
  "skills": ["string"],
  "working_status": "True or False - True if person currently works at target company: ${targetCompany || 'any'}"
}`
        },
        {
          role: "user",
          content: `Extract profile data from this LinkedIn page HTML. URL: ${linkedinUrl}\n\nHTML:\n${cleanHtml}`
        }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI Gateway error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content || "";
  
  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch?.[1] || jsonMatch?.[0] || content;
  
  const parsed = JSON.parse(jsonStr);
  
  return {
    profile: {
      full_name: parsed.full_name || "N/A",
      first_name: parsed.first_name || "",
      last_name: parsed.last_name || "",
      headline: parsed.headline || "",
      location: parsed.location || "",
      about: parsed.about || "",
      profile_image_url: parsed.profile_image_url || "",
      experiences: parsed.experiences || [],
      skills: parsed.skills || [],
    },
    workingStatus: parsed.working_status === "True" ? "True" : "False",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { leadId } = await req.json();
    if (!leadId) {
      return new Response(JSON.stringify({ error: "leadId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the lead
    const { data: lead, error: leadError } = await supabase
      .from("linkedin_leads")
      .select("*")
      .eq("id", leadId)
      .eq("user_id", user.id)
      .single();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const linkedinUrl = lead.linkedin_url;

    // Try to fetch the LinkedIn profile page
    let html: string;
    try {
      const fetchResponse = await fetch(linkedinUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (fetchResponse.status === 404) {
        await supabase
          .from("linkedin_leads")
          .update({ working_status: "404_NOT_FOUND", scraped_at: new Date().toISOString() })
          .eq("id", leadId);

        return new Response(JSON.stringify({ success: true, status: "404_NOT_FOUND" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      html = await fetchResponse.text();
    } catch (fetchErr) {
      // If fetch fails completely, mark as error
      await supabase
        .from("linkedin_leads")
        .update({ working_status: "ERROR", scraped_at: new Date().toISOString() })
        .eq("id", leadId);

      return new Response(JSON.stringify({ error: "Failed to fetch LinkedIn profile", details: String(fetchErr) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if we got a login wall or CAPTCHA
    if (html.includes("authwall") || html.includes("sign-in") || html.length < 5000) {
      // Try AI-based extraction with whatever HTML we got, or use basic parsing
      console.log("LinkedIn returned limited content (authwall likely). Attempting basic parse...");
    }

    // Try AI-powered extraction first, fall back to HTML parsing
    let profile: ScrapedProfile;
    let workingStatus: string;

    try {
      const aiResult = await scrapeWithAI(html, linkedinUrl, lead.company_name);
      profile = aiResult.profile;
      workingStatus = aiResult.workingStatus;
    } catch (aiErr) {
      console.error("AI extraction failed, falling back to HTML parsing:", aiErr);
      const htmlResult = parseProfileFromHtml(html, lead.company_name);
      profile = htmlResult.profile;
      workingStatus = htmlResult.workingStatus;
    }

    // Update the lead with scraped data
    const { error: updateError } = await supabase
      .from("linkedin_leads")
      .update({
        first_name: profile.first_name || lead.first_name,
        last_name: profile.last_name || lead.last_name,
        headline: profile.headline || lead.headline,
        location: profile.location || lead.location,
        about: profile.about || lead.about,
        profile_image_url: profile.profile_image_url || lead.profile_image_url,
        experience: profile.experiences,
        skills: profile.skills,
        working_status: workingStatus,
        scraped_at: new Date().toISOString(),
        scraped_data: {
          full_name: profile.full_name,
          person_linkedin_url: linkedinUrl,
          scraped_date: new Date().toISOString(),
          short_intro: profile.headline,
          about: profile.about,
          profile_pic: profile.profile_image_url,
          experiences: profile.experiences,
        },
      })
      .eq("id", leadId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: workingStatus,
        profile: {
          name: profile.full_name,
          headline: profile.headline,
          location: profile.location,
          experienceCount: profile.experiences.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Scrape error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
