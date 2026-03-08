import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompanyContacts } from '@/hooks/useCompanyContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { Loader2, Sparkles, Globe, Linkedin, Building2, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export function EnrichmentPage() {
  const { contacts } = useCompanyContacts();
  const { companies } = useCompanies();
  const { toast } = useToast();

  // Calculate enrichment coverage
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

  const handleEnrich = () => {
    toast({ title: 'Enrichment Engine', description: 'Connect an enrichment API (Clearbit, Apollo, etc.) in Settings to enable auto-enrichment.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Sparkles className="w-7 h-7" /> Contact Enrichment</h1>
          <p className="text-muted-foreground mt-1">Auto-enrich contacts with company data, social profiles, and job info</p>
        </div>
        <Button variant="gradient" onClick={handleEnrich}><RefreshCw className="w-4 h-4 mr-2" />Enrich All</Button>
      </div>

      {/* Coverage Stats */}
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

      {/* Coverage Bar */}
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
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.pct >= 70 ? 'hsl(var(--primary))' : item.pct >= 40 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contacts needing enrichment */}
      <Card className="border-border">
        <CardHeader><CardTitle className="text-lg">Contacts Needing Enrichment</CardTitle></CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Completeness</TableHead>
                  <TableHead>Missing Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missingFields.filter(c => c.missing.length > 0).slice(0, 30).map(c => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
