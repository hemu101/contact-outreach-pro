// Scrape /team /about /people /contact pages of a company website to find people.
// Extracts name + title + email + linkedin from common patterns.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const UA = 'Mozilla/5.0 (compatible; OutreachCopilotBot/1.0)';
const TARGET_PATHS = ['/team', '/about', '/about-us', '/our-team', '/people', '/leadership', '/contact', '/staff'];
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const LINKEDIN_RE = /https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9.\-_]+/gi;

interface Person { name: string; title?: string; email?: string; linkedin?: string; }

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

function extractPeople(html: string): Person[] {
  const people: Person[] = [];
  const seen = new Set<string>();

  // Strategy 1: structured cards (h3/h4 + p with role)
  const cardRe = /<(?:h[1-6]|div|article|section)[^>]*>([\s\S]{0,400}?)<\/(?:h[1-6]|div|article|section)>/gi;
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

  // Strategy 2: name + title near each other
  const blockRe = /<(?:h[1-6]|p|span|div)[^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s*<\/(?:h[1-6]|p|span|div)>\s*(?:<[^>]+>\s*)*<(?:p|span|h[1-6]|div)[^>]*>\s*(CEO|CTO|CFO|COO|CMO|VP[^<]*|Chief[^<]*|Founder[^<]*|Director[^<]*|Head of[^<]*|Manager[^<]*|President[^<]*|Lead[^<]*)\s*</gi;

  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    const name = m[1].trim();
    const title = m[2].trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      people.push({ name, title });
    }
    if (people.length >= 50) break;
  }

  // Attach emails and LinkedIn URLs found in the page (best-effort match by surname)
  const emails = Array.from(new Set(html.match(EMAIL_RE) || []));
  const linkedins = Array.from(new Set(html.match(LINKEDIN_RE) || []));
  for (const p of people) {
    const last = p.name.split(' ').pop()?.toLowerCase() ?? '';
    p.email = emails.find((e) => last && e.toLowerCase().includes(last));
    p.linkedin = linkedins.find((u) => last && u.toLowerCase().includes(last));
  }
  return people;
}

function buildUrls(base: string): string[] {
  try {
    const u = new URL(base);
    const origin = `${u.protocol}//${u.host}`;
    return [origin, ...TARGET_PATHS.map((p) => origin + p)];
  } catch { return [base]; }
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

    const { website, company_id, save = true } = await req.json();
    if (!website) return new Response(JSON.stringify({ error: 'missing website' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const urls = buildUrls(website);
    const allPeople = new Map<string, Person>();
    for (const url of urls) {
      const html = await fetchHtml(url);
      if (!html) continue;
      for (const p of extractPeople(html)) {
        if (!allPeople.has(p.name)) allPeople.set(p.name, p);
      }
      if (allPeople.size >= 30) break;
    }
    const people = Array.from(allPeople.values());

    let saved = 0;
    if (save && company_id && people.length) {
      for (const p of people) {
        const [first, ...rest] = p.name.split(' ');
        const last = rest.join(' ');
        const { error } = await supabase.from('company_contacts').insert({
          user_id: user.id,
          company_id,
          first_name: first,
          last_name: last,
          title: p.title,
          email: p.email,
          person_linkedin_url: p.linkedin,
        });
        if (!error) saved++;
      }
    }

    await supabase.from('people_search_logs').insert({
      user_id: user.id,
      query: { website, company_id },
      result_count: people.length,
      source: 'website_scrape',
    });

    return new Response(JSON.stringify({ success: true, people, saved }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
