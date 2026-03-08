import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import { useCompanyContacts, CompanyContact } from '@/hooks/useCompanyContacts';
import { Zap, AlertTriangle, Loader2, Target, Users, Merge, TrendingUp, BarChart3, Info, ExternalLink } from 'lucide-react';

const SCORE_CATEGORIES = [
  { key: 'email', label: 'Email', max: 15, color: 'hsl(var(--primary))' },
  { key: 'phone', label: 'Phone', max: 10, color: 'hsl(200 70% 50%)' },
  { key: 'linkedin', label: 'LinkedIn', max: 10, color: 'hsl(210 80% 55%)' },
  { key: 'seniority', label: 'Seniority', max: 25, color: 'hsl(280 60% 55%)' },
  { key: 'mql', label: 'MQL', max: 15, color: 'hsl(45 90% 50%)' },
  { key: 'sql_status', label: 'SQL', max: 20, color: 'hsl(140 60% 45%)' },
  { key: 'title', label: 'Title', max: 5, color: 'hsl(30 80% 55%)' },
];

export function LeadScoringPanel() {
  const { contacts, isLoading, deleteContact } = useCompanyContacts();
  const { scoreAll, findDuplicates } = useLeadScoring();
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CompanyContact | null>(null);

  const handleFindDuplicates = async () => {
    const result = await findDuplicates.mutateAsync();
    setDuplicates(result);
    setShowDuplicates(true);
  };

  const scoredContacts = [...contacts].sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0));
  const avgScore = contacts.length ? Math.round(contacts.reduce((s, c) => s + (c.lead_score ?? 0), 0) / contacts.length) : 0;
  const hotLeads = contacts.filter(c => (c.lead_score ?? 0) >= 70).length;
  const warmLeads = contacts.filter(c => (c.lead_score ?? 0) >= 40 && (c.lead_score ?? 0) < 70).length;
  const coldLeads = contacts.filter(c => (c.lead_score ?? 0) < 40 && (c.lead_score ?? 0) > 0).length;
  const unscoredLeads = contacts.filter(c => !c.lead_score).length;

  // MQL/SQL stats
  const mqlCount = contacts.filter(c => c.mql && c.mql !== '').length;
  const sqlCount = contacts.filter(c => c.sql_status && c.sql_status !== '').length;
  const mqlRate = contacts.length ? ((mqlCount / contacts.length) * 100).toFixed(1) : '0';
  const sqlRate = contacts.length ? ((sqlCount / contacts.length) * 100).toFixed(1) : '0';
  const conversionRate = mqlCount > 0 ? ((sqlCount / mqlCount) * 100).toFixed(1) : '0';

  // Score distribution
  const distribution = [
    { range: '90-100', count: contacts.filter(c => (c.lead_score ?? 0) >= 90).length, color: 'bg-green-500' },
    { range: '70-89', count: contacts.filter(c => (c.lead_score ?? 0) >= 70 && (c.lead_score ?? 0) < 90).length, color: 'bg-emerald-500' },
    { range: '50-69', count: contacts.filter(c => (c.lead_score ?? 0) >= 50 && (c.lead_score ?? 0) < 70).length, color: 'bg-yellow-500' },
    { range: '30-49', count: contacts.filter(c => (c.lead_score ?? 0) >= 30 && (c.lead_score ?? 0) < 50).length, color: 'bg-orange-500' },
    { range: '1-29', count: contacts.filter(c => (c.lead_score ?? 0) >= 1 && (c.lead_score ?? 0) < 30).length, color: 'bg-red-500' },
    { range: '0', count: unscoredLeads, color: 'bg-muted' },
  ];
  const maxDist = Math.max(...distribution.map(d => d.count), 1);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Hot';
    if (score >= 70) return 'Warm+';
    if (score >= 50) return 'Warm';
    if (score >= 30) return 'Cool';
    return 'Cold';
  };

  const getBreakdownPercent = (breakdown: Record<string, number> | null) => {
    if (!breakdown) return {};
    const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
    return Object.fromEntries(
      Object.entries(breakdown).map(([k, v]) => [k, total > 0 ? Math.round((v / total) * 100) : 0])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Target className="w-7 h-7" /> Lead Scoring & Intelligence</h1>
          <p className="text-muted-foreground mt-1">AI-powered lead qualification with engagement, MQL/SQL, and behavioral scoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFindDuplicates} disabled={findDuplicates.isPending}>
            {findDuplicates.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Merge className="w-4 h-4 mr-2" />}
            Find Duplicates
          </Button>
          <Button variant="gradient" onClick={() => scoreAll.mutate()} disabled={scoreAll.isPending}>
            {scoreAll.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Score All Contacts
          </Button>
        </div>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Contacts</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{hotLeads}</p>
            <p className="text-[10px] text-muted-foreground">Hot (70+)</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-500">{warmLeads}</p>
            <p className="text-[10px] text-muted-foreground">Warm (40-69)</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{coldLeads}</p>
            <p className="text-[10px] text-muted-foreground">Cold (&lt;40)</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{avgScore}</p>
            <p className="text-[10px] text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{mqlRate}%</p>
            <p className="text-[10px] text-muted-foreground">MQL Rate</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{sqlRate}%</p>
            <p className="text-[10px] text-muted-foreground">SQL Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Methodology + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scoring Methodology */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Scoring Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SCORE_CATEGORIES.map(cat => (
              <div key={cat.key} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{cat.label}</span>
                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(cat.max / 25) * 100}%`, backgroundColor: cat.color }} />
                </div>
                <span className="text-xs font-medium text-foreground w-12 text-right">+{cat.max} pts</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              <p>Max Score: 100 • Seniority weighted highest (C-Suite=25, Director/Mgr=15, Other=5)</p>
              <p className="mt-1">MQL → +15 • SQL → +20 • Conversion Rate: <span className="text-primary font-medium">{conversionRate}%</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {distribution.map(d => (
              <div key={d.range} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">{d.range}</span>
                <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                  <div className={`h-full rounded-full ${d.color} flex items-center justify-end pr-2`} style={{ width: `${Math.max((d.count / maxDist) * 100, 5)}%` }}>
                    {d.count > 0 && <span className="text-[10px] font-bold text-white">{d.count}</span>}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {contacts.length ? ((d.count / contacts.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Contacts Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Scored Contacts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Seniority</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead>MQL</TableHead>
                    <TableHead>SQL</TableHead>
                    <TableHead>IG Score</TableHead>
                    <TableHead>Lead Score</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Breakdown</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoredContacts.map(c => {
                    const breakdown = c.lead_score_breakdown as Record<string, number> | null;
                    const percentages = getBreakdownPercent(breakdown);
                    return (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-secondary/30" onClick={() => setSelectedContact(c)}>
                        <TableCell className="font-medium whitespace-nowrap">{c.first_name} {c.last_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.title || '—'}</TableCell>
                        <TableCell>{c.seniority ? <Badge variant="outline">{c.seniority}</Badge> : '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.email || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{c.work_direct_phone || c.mobile_phone || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{[c.city, c.state, c.country].filter(Boolean).join(', ') || '—'}</TableCell>
                        <TableCell>
                          {c.person_linkedin_url ? (
                            <a href={c.person_linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                              <ExternalLink className="w-3.5 h-3.5 text-primary" />
                            </a>
                          ) : '—'}
                        </TableCell>
                        <TableCell>{c.mql ? <Badge className="bg-yellow-500/10 text-yellow-600 text-[10px]">{c.mql}</Badge> : '—'}</TableCell>
                        <TableCell>{c.sql_status ? <Badge className="bg-green-500/10 text-green-600 text-[10px]">{c.sql_status}</Badge> : '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.ig_score || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${getScoreColor(c.lead_score ?? 0)}`}>{c.lead_score ?? 0}</span>
                            <Progress value={c.lead_score ?? 0} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${getScoreColor(c.lead_score ?? 0)}`}>
                            {getScoreLabel(c.lead_score ?? 0)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <div className="flex gap-1 flex-wrap">
                              {breakdown && Object.entries(breakdown).map(([k, v]) => (
                                <Tooltip key={k}>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-[10px] cursor-help">
                                      {k}: +{v} ({percentages[k]}%)
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{k} contributes {percentages[k]}% of total score</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={(v) => !v && setSelectedContact(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{selectedContact.first_name} {selectedContact.last_name}</span>
                  <Badge variant="outline" className={getScoreColor(selectedContact.lead_score ?? 0)}>
                    Score: {selectedContact.lead_score ?? 0}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] space-y-4">
                <Tabs defaultValue="score">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="score">Score Breakdown</TabsTrigger>
                    <TabsTrigger value="info">Contact Info</TabsTrigger>
                    <TabsTrigger value="social">Social & Links</TabsTrigger>
                  </TabsList>
                  <TabsContent value="score" className="space-y-4 mt-4">
                    {/* Score Visualization */}
                    <div className="space-y-3">
                      {SCORE_CATEGORIES.map(cat => {
                        const breakdown = selectedContact.lead_score_breakdown as Record<string, number> | null;
                        const val = breakdown?.[cat.key] ?? 0;
                        const pct = cat.max > 0 ? Math.round((val / cat.max) * 100) : 0;
                        return (
                          <div key={cat.key} className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground w-20">{cat.label}</span>
                            <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                            </div>
                            <span className="text-sm font-medium w-20 text-right">{val}/{cat.max} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">MQL Status</p>
                        <p className="font-medium text-foreground">{selectedContact.mql || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">SQL Status</p>
                        <p className="font-medium text-foreground">{selectedContact.sql_status || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">IG Score</p>
                        <p className="font-medium text-foreground">{selectedContact.ig_score || 'N/A'}</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="info" className="mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Title', selectedContact.title],
                        ['Seniority', selectedContact.seniority],
                        ['Department', selectedContact.departments],
                        ['Email', selectedContact.email],
                        ['Secondary Email', selectedContact.secondary_email],
                        ['Work Phone', selectedContact.work_direct_phone],
                        ['Mobile', selectedContact.mobile_phone],
                        ['Corporate Phone', selectedContact.corporate_phone],
                        ['City', selectedContact.city],
                        ['State', selectedContact.state],
                        ['Country', selectedContact.country],
                        ['Pipeline Stage', selectedContact.pipeline_stage],
                      ].map(([label, val]) => (
                        <div key={label as string}>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium text-foreground">{val || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="social" className="mt-4">
                    <div className="space-y-3">
                      {[
                        ['LinkedIn', selectedContact.person_linkedin_url],
                        ['Job Tracking Link', selectedContact.job_tracking_link],
                        ['LinkedIn Job Link', selectedContact.linkedin_job_link],
                      ].map(([label, url]) => (
                        <div key={label as string} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          {url ? (
                            <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                              Open <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : <span className="text-sm text-muted-foreground">—</span>}
                        </div>
                      ))}
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">Notes for SDR</p>
                        <p className="text-sm text-foreground">{selectedContact.notes_for_sdr || 'No notes'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes for Data</p>
                        <p className="text-sm text-foreground">{selectedContact.notes_for_data || 'No notes'}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Duplicates Dialog */}
      <Dialog open={showDuplicates} onOpenChange={setShowDuplicates}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" />Duplicate Contacts Found ({duplicates.length})</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {duplicates.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No duplicates found! Your data is clean.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact 1</TableHead>
                    <TableHead>Contact 2</TableHead>
                    <TableHead>Match Type</TableHead>
                    <TableHead>Match Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duplicates.map((d, i) => {
                    const c1 = contacts.find(c => c.id === d.contact_id);
                    const c2 = contacts.find(c => c.id === d.duplicate_of_id);
                    return (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{c1?.first_name} {c1?.last_name}</TableCell>
                        <TableCell className="text-sm">{c2?.first_name} {c2?.last_name}</TableCell>
                        <TableCell><Badge variant="outline">{d.match_type}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{d.match_value}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
