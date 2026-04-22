import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Globe, Linkedin, Users, ExternalLink, CheckCircle2, XCircle, Sparkles, Briefcase, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EmployeeFinderDialog } from './EmployeeFinderDialog';

interface FindResult {
  website?: string;
  linkedin?: string;
  verified?: boolean;
  verification?: any;
  companyName?: string;
}

export function LinkFinderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FindResult | null>(null);
  const [showFinder, setShowFinder] = useState(false);
  const { toast } = useToast();

  const handleFind = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      let website = query.trim();
      let companyName = query.trim();

      // If looks like a domain, normalize; else treat as company name and search
      const looksLikeDomain = /\./.test(website) && !website.includes(' ');

      if (!looksLikeDomain) {
        // Use Firecrawl-backed verification path: just guess website from name
        // We try www.<name>.com first via verify-website
        const guessed = website.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        website = guessed;
      } else {
        if (!/^https?:\/\//.test(website)) website = 'https://' + website;
        try { companyName = new URL(website).hostname.replace(/^www\./, '').split('.')[0]; } catch {}
      }

      // 1. Verify website
      const { data: vData } = await supabase.functions.invoke('verify-website', { body: { website } });
      const verification = vData?.result;

      // 2. Find LinkedIn from socials
      const linkedin = verification?.socials?.linkedin;

      setResult({ website, linkedin, verified: vData?.success && verification?.status === 'Proper', verification, companyName });
      toast({ title: 'Search complete', description: linkedin ? 'Website + LinkedIn found' : 'Website found, no LinkedIn' });
    } catch (e: any) {
      toast({ title: 'Search failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Link Finder</h1>
        <p className="text-muted-foreground mt-1">Enter a company name or domain — we find the website, LinkedIn, and employees.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Universal Company Search</CardTitle>
          <CardDescription>One input → website + LinkedIn + employees, like LeadIQ Scribe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Globe className="w-4 h-4 text-primary" />Company source</div>
              <p className="mt-1 text-xs text-muted-foreground">Resolve the brand website and validate if the domain is usable.</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Linkedin className="w-4 h-4 text-primary" />Profile matching</div>
              <p className="mt-1 text-xs text-muted-foreground">Pull LinkedIn/company signals so lead research feels closer to LeadIQ.</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Users className="w-4 h-4 text-primary" />Lead discovery</div>
              <p className="mt-1 text-xs text-muted-foreground">Open the employee finder to collect likely team members and emails.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="acme.com or Acme Inc"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleFind()}
              className="flex-1"
            />
            <Button onClick={handleFind} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" />Find</>}
            </Button>
          </div>

          {result && (
            <div className="space-y-3 pt-4 border-t border-border">
              {result.companyName && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="font-medium truncate">{result.companyName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Globe className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Website</p>
                  <p className="font-medium truncate">{result.website}</p>
                </div>
                {result.verified ? (
                  <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Verified</Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Not verified</Badge>
                )}
                <a href={result.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                </a>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Linkedin className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">LinkedIn Company Page</p>
                  <p className="font-medium truncate">{result.linkedin || '— not found —'}</p>
                </div>
                {result.linkedin && (
                  <a href={result.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                  </a>
                )}
              </div>

              {result.verification && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {result.verification.emails?.slice(0, 1).map((e: string) => (
                    <Badge key={e} variant="outline" className="justify-start truncate"><Mail className="w-3 h-3 mr-1" />{e}</Badge>
                  ))}
                  {result.verification.d2c_presence && <Badge variant="outline">🛍️ D2C</Badge>}
                  {result.verification.e_commerce_presence && <Badge variant="outline">🛒 E-com</Badge>}
                  {result.verification.is_running_ads && <Badge variant="outline">📢 Ads</Badge>}
                  {result.verification.is_hiring_ugc && <Badge variant="outline">👥 Hiring UGC</Badge>}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button onClick={() => setShowFinder(true)} className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />Find Employees at This Company
                </Button>
                <Button onClick={() => setShowFinder(true)} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />Lead Finder Option
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeFinderDialog
        open={showFinder}
        onClose={() => setShowFinder(false)}
        initialWebsite={result?.website || ''}
        companyName={result?.companyName || ''}
      />
    </div>
  );
}
