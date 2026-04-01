import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanyContacts } from '@/hooks/useCompanyContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, RefreshCw, Search, Mail, CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface EmailCandidate {
  email: string;
  pattern: string;
  confidence: number;
  domain: string;
}

interface FinderResult {
  success: boolean;
  domain: string;
  mx_valid: boolean;
  mx_records: string[];
  is_catch_all: boolean;
  best_email: string;
  best_confidence: number;
  candidates: EmailCandidate[];
  total_patterns: number;
}

export function EnrichmentPage() {
  const { contacts } = useCompanyContacts();
  const { companies } = useCompanies();
  const { user } = useAuth();
  const { toast } = useToast();

  const [finderFirstName, setFinderFirstName] = useState('');
  const [finderLastName, setFinderLastName] = useState('');
  const [finderDomain, setFinderDomain] = useState('');
  const [finderCompany, setFinderCompany] = useState('');
  const [finderLoading, setFinderLoading] = useState(false);
  const [finderResult, setFinderResult] = useState<FinderResult | null>(null);
  const [bulkEnriching, setBulkEnriching] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [enrichmentLogs, setEnrichmentLogs] = useState<any[]>([]);

  const totalContacts = contacts.length;
  const withEmail = contacts.filter(c => c.email).length;
  const withPhone = contacts.filter(c => c.work_direct_phone || c.mobile_phone).length;
  const withLinkedIn = contacts.filter(c => c.person_linkedin_url).length;
  const withTitle = contacts.filter(c => c.title).length;
  const withCompany = contacts.filter(c => c.company_id).length;
  const coverage = (count: number) => totalContacts ? Math.round((count / totalContacts) * 100) : 0;

  const missingFields = contacts.map(c => {
    const missing: string[] = [];
    if (!c.email) missing.push('email');
    if (!c.work_direct_phone && !c.mobile_phone) missing.push('phone');
    if (!c.person_linkedin_url) missing.push('linkedin');
    if (!c.title) missing.push('title');
    if (!c.seniority) missing.push('seniority');
    return { ...c, missing, completeness: Math.round(((5 - missing.length) / 5) * 100) };
  }).sort((a, b) => a.completeness - b.completeness);

  const handleFindEmail = async () => {
    if (!finderFirstName || !finderLastName || (!finderDomain && !finderCompany)) {
      toast({ title: 'Please fill in name and domain/company', variant: 'destructive' });
      return;
    }
    setFinderLoading(true);
    setFinderResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/find-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          first_name: finderFirstName,
          last_name: finderLastName,
          domain: finderDomain || undefined,
          company_name: finderCompany || undefined,
          contact_id: selectedContactId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFinderResult(data);
      toast({ title: `Found ${data.candidates?.length || 0} email candidates` });
    } catch (err: any) {
      toast({ title: 'Email finder failed', description: err.message, variant: 'destructive' });
    } finally {
      setFinderLoading(false);
    }
  };

  const handleBulkEnrich = async () => {
    const contactsWithoutEmail = contacts.filter(c => !c.email && c.first_name && c.last_name);
    if (!contactsWithoutEmail.length) {
      toast({ title: 'All contacts already have emails' });
      return;
    }
    setBulkEnriching(true);
    setBulkProgress(0);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      let enriched = 0;

      for (let i = 0; i < Math.min(contactsWithoutEmail.length, 50); i++) {
        const c = contactsWithoutEmail[i];
        try {
          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/find-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              first_name: c.first_name,
              last_name: c.last_name,
              contact_id: c.id,
              company_name: '',
            }),
          });
          const data = await res.json();
          if (data.best_email && data.best_confidence >= 50) {
            enriched++;
          }
        } catch { /* skip */ }
        setBulkProgress(Math.round(((i + 1) / Math.min(contactsWithoutEmail.length, 50)) * 100));
        await new Promise(r => setTimeout(r, 500));
      }

      toast({ title: `Bulk enrichment complete`, description: `${enriched} emails found from ${Math.min(contactsWithoutEmail.length, 50)} contacts` });
    } catch (err: any) {
      toast({ title: 'Bulk enrichment failed', description: err.message, variant: 'destructive' });
    } finally {
      setBulkEnriching(false);
      setBulkProgress(0);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (score >= 40) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Sparkles className="w-7 h-7" /> Contact Enrichment</h1>
          <p className="text-muted-foreground mt-1">Email finder, pattern prediction & data enrichment engine</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkEnrich} disabled={bulkEnriching}>
            {bulkEnriching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            {bulkEnriching ? `Enriching... ${bulkProgress}%` : 'Bulk Enrich (50)'}
          </Button>
        </div>
      </div>

      {bulkEnriching && (
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Bulk enrichment in progress...</p>
                <Progress value={bulkProgress} className="mt-2" />
              </div>
              <span className="text-sm font-bold">{bulkProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="finder">
        <TabsList>
          <TabsTrigger value="finder"><Search className="w-4 h-4 mr-1" />Email Finder</TabsTrigger>
          <TabsTrigger value="coverage"><Sparkles className="w-4 h-4 mr-1" />Coverage</TabsTrigger>
          <TabsTrigger value="incomplete"><RefreshCw className="w-4 h-4 mr-1" />Needs Enrichment</TabsTrigger>
        </TabsList>

        {/* Email Finder Tab */}
        <TabsContent value="finder" className="space-y-4 mt-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Mail className="w-5 h-5" /> Email Pattern Finder</CardTitle>
              <p className="text-sm text-muted-foreground">Enter a person's name and company domain to predict their email using common patterns + MX verification</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">First Name *</Label>
                  <Input value={finderFirstName} onChange={e => setFinderFirstName(e.target.value)} placeholder="John" />
                </div>
                <div>
                  <Label className="text-xs">Last Name *</Label>
                  <Input value={finderLastName} onChange={e => setFinderLastName(e.target.value)} placeholder="Smith" />
                </div>
                <div>
                  <Label className="text-xs">Domain</Label>
                  <Input value={finderDomain} onChange={e => setFinderDomain(e.target.value)} placeholder="tesla.com" />
                </div>
                <div>
                  <Label className="text-xs">Company Name</Label>
                  <Input value={finderCompany} onChange={e => setFinderCompany(e.target.value)} placeholder="Tesla" />
                </div>
              </div>
              <Button onClick={handleFindEmail} disabled={finderLoading} className="w-full">
                {finderLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                {finderLoading ? 'Searching...' : 'Find Email'}
              </Button>
            </CardContent>
          </Card>

          {finderResult && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Results for {finderResult.domain}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant={finderResult.mx_valid ? 'default' : 'destructive'} className="text-xs">
                    {finderResult.mx_valid ? '✓ MX Valid' : '✗ No MX'}
                  </Badge>
                  {finderResult.is_catch_all && <Badge variant="secondary" className="text-xs">Catch-All Domain</Badge>}
                  {finderResult.mx_records.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      MX: {finderResult.mx_records[0]?.split(' ').pop() || 'unknown'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Best Result */}
                {finderResult.best_email && (
                  <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Best Match</p>
                        <p className="text-lg font-bold text-primary">{finderResult.best_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className={`text-2xl font-bold ${getConfidenceColor(finderResult.best_confidence)}`}>
                          {finderResult.best_confidence}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Candidates */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finderResult.candidates.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-sm">{c.email}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{c.pattern}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{
                                width: `${c.confidence}%`,
                                backgroundColor: c.confidence >= 70 ? 'hsl(var(--primary))' : c.confidence >= 40 ? '#f59e0b' : '#ef4444',
                              }} />
                            </div>
                            <span className={`text-sm font-bold ${getConfidenceColor(c.confidence)}`}>{c.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getConfidenceIcon(c.confidence)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-3 text-xs text-muted-foreground">
                  <p>📧 <strong>How it works:</strong> Generates emails using {finderResult.total_patterns} common patterns (first.last, flast, first_last, etc.), checks MX records via DNS, and cross-references verified patterns from your existing contacts at this domain.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-4 mt-4">
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: 'Email', count: withEmail, icon: '📧' },
              { label: 'Phone', count: withPhone, icon: '📱' },
              { label: 'LinkedIn', count: withLinkedIn, icon: '🔗' },
              { label: 'Job Title', count: withTitle, icon: '💼' },
              { label: 'Company', count: withCompany, icon: '🏢' },
              { label: 'Total', count: totalContacts, icon: '👥' },
            ].map(stat => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-3 text-center">
                  <span className="text-lg">{stat.icon}</span>
                  <p className="text-xl font-bold mt-1">{coverage(stat.count)}%</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label} ({stat.count}/{totalContacts})</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Data Completeness Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Email Address', pct: coverage(withEmail) },
                  { label: 'Phone Number', pct: coverage(withPhone) },
                  { label: 'LinkedIn Profile', pct: coverage(withLinkedIn) },
                  { label: 'Job Title', pct: coverage(withTitle) },
                  { label: 'Company Link', pct: coverage(withCompany) },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-sm w-32">{item.label}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.pct >= 70 ? 'hsl(var(--primary))' : item.pct >= 40 ? '#f59e0b' : '#ef4444',
                      }} />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Needs Enrichment Tab */}
        <TabsContent value="incomplete" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Contacts Needing Enrichment</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Completeness</TableHead>
                      <TableHead>Missing Fields</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missingFields.filter(c => c.missing.length > 0).slice(0, 50).map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-sm">{c.first_name} {c.last_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${c.completeness}%`,
                                backgroundColor: c.completeness >= 70 ? 'hsl(var(--primary))' : c.completeness >= 40 ? '#f59e0b' : '#ef4444',
                              }} />
                            </div>
                            <span className="text-xs">{c.completeness}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {c.missing.map(f => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.missing.includes('email') && c.first_name && c.last_name && (
                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => {
                              setFinderFirstName(c.first_name || '');
                              setFinderLastName(c.last_name || '');
                              setSelectedContactId(c.id);
                              setFinderDomain('');
                              setFinderCompany('');
                            }}>
                              <Mail className="w-3 h-3 mr-1" />Find Email
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
