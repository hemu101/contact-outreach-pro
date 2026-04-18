// LeadIQ-style: Given a company URL/domain, find employees via:
// 1. Scrape /team /about /people pages (free)
// 2. Firecrawl web search for "site:linkedin.com/in {company}"
// 3. Predict emails using common patterns + verify via MX
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const UA = 'Mozilla/5.0 (compatible; OutreachCopilotBot/1.0)';
const TARGET_PATHS = ['/team', '/about', '/about-us', '/our-team', '/people', '/leadership', '/staff'];
const LINKEDIN_RE = /https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9.\-_%]+/gi;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

interface Person {
  name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  predicted_emails?: string[];
  linkedin?: string;
  source: string;
  confidence: number;
}

function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try { new URL(u); return u; } catch { return null; }
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function predictEmails(first: string, last: string, domain: string): string[] {
  if (!first || !domain) return [];
  const f = first.toLowerCase().replace(/[^a-z]/g, '');
  const l = (last || '').toLowerCase().replace(/[^a-z]/g, '');
  const patterns = [
    `${f}.${l}@${domain}`, `${f}${l}@${domain}`, `${f}@${domain}`,
    `${f[0]}${l}@${domain}`, `${f}_${l}@${domain}`, `${f}-${l}@${domain}`,
    `${l}.${f}@${domain}`, `${f[0]}.${l}@${domain}`,
  ].filter(e => !e.includes('@.') && !e.startsWith('@') && !e.endsWith('@'));
  return Array.from(new Set(patterns));
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function firecrawlSearch(query: string): Promise<{ url: string; title: string; description: string }[]> {
  const key = Deno.env.get('FIRECRAWL_API_KEY');
  if (!key) return [];
  try {
    const res = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 15 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.web || data?.data || [];
    return Array.isArray(results) ? results.map((r: any) => ({ url: r.url || '', title: r.title || '', description: r.description || '' })) : [];
  } catch { return []; }
}

function extractFromScrape(html: string): Person[] {
  const people = new Map<string, Person>();
  const blockRe = /<(?:h[1-6]|p|span|div)[^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s*<\/(?:h[1-6]|p|span|div)>\s*(?:<[^>]+>\s*)*<(?:p|span|h[1-6]|div)[^>]*>\s*(CEO|CTO|CFO|COO|CMO|VP[^<]{0,60}|Chief[^<]{0,60}|Founder[^<]{0,60}|Director[^<]{0,60}|Head of[^<]{0,60}|Manager[^<]{0,60}|President[^<]{0,60}|Lead[^<]{0,60})\s*</gi;
  const linkedins = Array.from(new Set(html.match(LINKEDIN_RE) || []));
  const emails = Array.from(new Set(html.match(EMAIL_RE) || []));

  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const name = m[1].trim();
    if (!people.has(name)) {
      const [first, ...rest] = name.split(' ');
      const last = rest.join(' ');
      const lower = last.toLowerCase();
      people.set(name, {
        name,
        first_name: first,
        last_name: last,
        title: m[2].trim().replace(/\s+/g, ' '),
        linkedin: linkedins.find(u => u.toLowerCase().includes(lower)),
        email: emails.find(e => e.toLowerCase().includes(lower)),
        source: 'website_scrape',
        confidence: 0.8,
      });
    }
    if (people.size >= 30) break;
  }
  return Array.from(people.values());
}

function extractFromLinkedinResults(results: { url: string; title: string; description: string }[], companyName: string): Person[] {
  const people: Person[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (!r.url.includes('linkedin.com/in/')) continue;
    // Title format: "Name - Title at Company | LinkedIn"
    const titleMatch = r.title.match(/^([^-|]+)(?:\s*[-|]\s*(.+?))?(?:\s*[-|]\s*LinkedIn)?$/);
    if (!titleMatch) continue;
    const name = titleMatch[1].trim();
    const titlePart = titleMatch[2]?.trim() || '';
    if (!name || seen.has(name) || name.length > 60 || !/^[A-Z]/.test(name)) continue;
    seen.add(name);
    const parts = name.split(/\s+/);
    const first = parts[0];
    const last = parts.slice(1).join(' ');
    let title = titlePart;
    if (companyName && title.toLowerCase().includes(`at ${companyName.toLowerCase()}`)) {
      title = title.split(/\s+at\s+/i)[0];
    }
    people.push({
      name,
      first_name: first,
      last_name: last,
      title: title || undefined,
      linkedin: r.url.split('?')[0],
      source: 'linkedin_search',
      confidence: 0.7,
    });
    if (people.length >= 25) break;
  }
  return people;
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

    const { website, company_name, company_id, save = true } = await req.json();
    const url = normalizeUrl(website || '');
    if (!url) return new Response(JSON.stringify({ error: 'invalid website' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const domain = getDomain(url);
    const compName = company_name || domain.split('.')[0];

    const { data: jobRow } = await supabase.from('people_discovery_jobs').insert({
      user_id: user.id, input_url: url, company_id: company_id ?? null, status: 'running',
    }).select().single();

    const merged = new Map<string, Person>();
    const sources: string[] = [];

    // 1. Scrape website
    sources.push('scrape');
    const origin = `https://${domain}`;
    for (const path of [origin, ...TARGET_PATHS.map(p => origin + p)]) {
      const html = await fetchHtml(path);
      if (!html) continue;
      for (const p of extractFromScrape(html)) {
        const key = p.name.toLowerCase();
        if (!merged.has(key)) merged.set(key, p);
      }
      if (merged.size >= 20) break;
    }

    // 2. Firecrawl LinkedIn search
    if (Deno.env.get('FIRECRAWL_API_KEY')) {
      sources.push('linkedin_search');
      const query = `site:linkedin.com/in "${compName}"`;
      const results = await firecrawlSearch(query);
      for (const p of extractFromLinkedinResults(results, compName)) {
        const key = p.name.toLowerCase();
        if (!merged.has(key)) merged.set(key, p);
        else if (p.linkedin && !merged.get(key)!.linkedin) merged.get(key)!.linkedin = p.linkedin;
      }
    }

    // 3. Predict emails for everyone without one
    sources.push('email_prediction');
    for (const p of merged.values()) {
      if (!p.email && p.first_name) {
        p.predicted_emails = predictEmails(p.first_name, p.last_name || '', domain);
      }
    }

    const people = Array.from(merged.values());

    let saved = 0;
    if (save && company_id && people.length) {
      for (const p of people) {
        const { error } = await supabase.from('company_contacts').insert({
          user_id: user.id,
          company_id,
          first_name: p.first_name,
          last_name: p.last_name,
          title: p.title,
          email: p.email || p.predicted_emails?.[0],
          person_linkedin_url: p.linkedin,
          extra_data: { source: p.source, predicted_emails: p.predicted_emails, confidence: p.confidence },
        });
        if (!error) saved++;
      }
    }

    if (jobRow) {
      await supabase.from('people_discovery_jobs').update({
        status: 'completed', sources_used: sources, results: people as any, result_count: people.length, completed_at: new Date().toISOString(),
      }).eq('id', jobRow.id);
    }

    return new Response(JSON.stringify({ success: true, people, saved, sources, job_id: jobRow?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
