// Verify a website: HTTP fetch first, optional Firecrawl fallback for JS-rendered sites.
// Extracts: status, title, emails, phones, social links, D2C/ecom/video signals.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UA = 'Mozilla/5.0 (compatible; OutreachCopilotBot/1.0)';
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_RE = /\+?\d[\d\s().\-]{8,}\d/g;
const SOCIAL_PATTERNS: Record<string, RegExp> = {
  instagram: /https?:\/\/(?:www\.)?instagram\.com\/(?!p\/|reel\/|explore\/)[A-Za-z0-9._]+/i,
  facebook: /https?:\/\/(?:www\.)?facebook\.com\/(?!sharer|share\.php)[A-Za-z0-9.\-_]+/i,
  twitter: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/(?!intent|share)[A-Za-z0-9_]+/i,
  linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[A-Za-z0-9.\-_]+/i,
  youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|user\/|@)[A-Za-z0-9._\-]+/i,
  tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@[A-Za-z0-9._]+/i,
  pinterest: /https?:\/\/(?:www\.)?pinterest\.com\/[A-Za-z0-9._]+/i,
};
const D2C_KW = ['shop', 'buy now', 'add to cart', 'checkout', 'order now', 'free shipping', 'shop now'];
const ECOM_KW = ['shopify', 'woocommerce', 'bigcommerce', 'magento', 'cart', 'paypal', 'stripe', 'apple pay'];
const HIRING_UGC_KW = ['ugc creator', 'content creator', 'social media manager', 'influencer marketing', 'we\'re hiring', 'careers'];
const ADS_KW = ['utm_source=facebook', 'utm_source=google', 'fbclid', 'gclid'];
const CAMPAIGN_KW = ['new collection', 'launching', 'just launched', 'now available', 'pre-order'];
const MARKETING_KW = ['marketing team', 'cmo', 'head of marketing', 'marketing director'];

const LANDING_RE = [
  /domain\s+for\s+sale/i, /buy\s+this\s+domain/i, /parked\s+domain/i,
  /coming\s+soon/i, /under\s+construction/i, /404\s+not\s+found/i,
  /page\s+not\s+found/i, /account\s+suspended/i,
];

function uniq(arr: string[]) { return Array.from(new Set(arr)); }

function extractFromHtml(html: string, url: string) {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const lower = text.toLowerCase();
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const isLanding = LANDING_RE.some((r) => r.test(lower));
  const tooShort = text.replace(/\s+/g, ' ').trim().length < 150;

  const emails = uniq((html.match(EMAIL_RE) || []).filter((e) =>
    !/\.(png|jpg|gif|css|js|svg|webp)$/i.test(e)
  )).slice(0, 10);
  const phones = uniq((text.match(PHONE_RE) || []).map((p) => p.trim()).filter((p) => p.replace(/\D/g, '').length >= 10)).slice(0, 5);

  const socials: Record<string, string> = {};
  for (const [k, re] of Object.entries(SOCIAL_PATTERNS)) {
    const m = html.match(re);
    if (m) socials[k] = m[0];
  }
  const hasVideo = /<video|youtube\.com\/embed|player\.vimeo|wistia|loom\.com/i.test(html);

  return {
    title,
    status: isLanding ? 'Improper' : tooShort ? 'Improper' : 'Proper',
    landing: isLanding,
    emails,
    phones,
    socials,
    social_media_presence: Object.keys(socials).length > 0,
    integrated_videos: hasVideo,
    d2c_presence: D2C_KW.some((k) => lower.includes(k)),
    e_commerce_presence: ECOM_KW.some((k) => lower.includes(k)),
    is_hiring_ugc: HIRING_UGC_KW.some((k) => lower.includes(k)),
    is_running_ads: ADS_KW.some((k) => lower.includes(k)) || /\bads?\b.*manager/i.test(lower),
    recent_campaign_launch: CAMPAIGN_KW.some((k) => lower.includes(k)),
    marketing_team_exists: MARKETING_KW.some((k) => lower.includes(k)),
  };
}

async function fetchHtml(url: string): Promise<{ html: string; status: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { html: '', status: res.status };
    const html = await res.text();
    return { html, status: res.status };
  } catch (_e) {
    return null;
  }
}

async function firecrawlScrape(url: string): Promise<string | null> {
  const key = Deno.env.get('FIRECRAWL_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['html'], onlyMainContent: false }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.html || data?.html || null;
  } catch { return null; }
}

function normalizeUrl(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try { new URL(u); return u; } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json().catch(() => ({}));
    const { website, company_id } = body as { website?: string; company_id?: string };
    const url = normalizeUrl(website || '');
    if (!url) return new Response(JSON.stringify({ error: 'invalid website' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    let method = 'fetch';
    let result = null;
    let errorMsg: string | null = null;

    const fetched = await fetchHtml(url);
    if (fetched && fetched.html && fetched.html.length > 500) {
      result = extractFromHtml(fetched.html, url);
    } else {
      method = 'firecrawl';
      const fcHtml = await firecrawlScrape(url);
      if (fcHtml) {
        result = extractFromHtml(fcHtml, url);
      } else {
        errorMsg = 'Could not fetch site (network or JS-only without Firecrawl)';
        result = { status: 'Broken', title: '', emails: [], phones: [], socials: {} };
      }
    }

    // Update companies row if provided
    if (company_id && result.status !== 'Broken') {
      await supabase.from('companies').update({
        website_verified: true,
        website_verified_at: new Date().toISOString(),
        website_verification_data: result,
        d2c_presence: result.d2c_presence ? 'Yes' : 'No',
        e_commerce_presence: result.e_commerce_presence ? 'Yes' : 'No',
        social_media_presence: result.social_media_presence ? 'Yes' : 'No',
        is_hiring_ugc: result.is_hiring_ugc,
        is_running_ads: result.is_running_ads,
        recent_campaign_launch: result.recent_campaign_launch,
        marketing_team_exists: result.marketing_team_exists,
        instagram_url: result.socials?.instagram,
        facebook_url: result.socials?.facebook,
        twitter_url: result.socials?.twitter,
        linkedin_url: result.socials?.linkedin,
      }).eq('id', company_id).eq('user_id', user.id);
    }

    await supabase.from('website_verification_logs').insert({
      user_id: user.id,
      company_id: company_id ?? null,
      website: url,
      status: result.status,
      method,
      response_data: result,
      error_message: errorMsg,
    });

    return new Response(JSON.stringify({ success: true, method, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
