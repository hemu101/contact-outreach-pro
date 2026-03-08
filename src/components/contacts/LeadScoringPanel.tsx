import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import { useCompanyContacts, CompanyContact } from '@/hooks/useCompanyContacts';
import { Zap, AlertTriangle, Loader2, Target, Users, Merge } from 'lucide-react';

export function LeadScoringPanel() {
  const { contacts, isLoading, deleteContact } = useCompanyContacts();
  const { scoreAll, findDuplicates } = useLeadScoring();
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const handleFindDuplicates = async () => {
    const result = await findDuplicates.mutateAsync();
    setDuplicates(result);
    setShowDuplicates(true);
  };

  const scoredContacts = [...contacts].sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0));
  const avgScore = contacts.length ? Math.round(contacts.reduce((s, c) => s + (c.lead_score ?? 0), 0) / contacts.length) : 0;
  const hotLeads = contacts.filter(c => (c.lead_score ?? 0) >= 70).length;
  const warmLeads = contacts.filter(c => (c.lead_score ?? 0) >= 40 && (c.lead_score ?? 0) < 70).length;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Target className="w-7 h-7" /> Lead Scoring & Duplicates</h1>
          <p className="text-muted-foreground mt-1">AI-powered lead qualification and data hygiene</p>
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
            <p className="text-xs text-muted-foreground">Total Contacts</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{hotLeads}</p>
            <p className="text-xs text-muted-foreground">Hot Leads (70+)</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{warmLeads}</p>
            <p className="text-xs text-muted-foreground">Warm Leads (40-69)</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{avgScore}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Contacts */}
      <Card className="border-border">
        <CardHeader><CardTitle className="text-lg">Top Scored Contacts</CardTitle></CardHeader>
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
                    <TableHead>Score</TableHead>
                    <TableHead>Breakdown</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoredContacts.slice(0, 20).map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.title || '—'}</TableCell>
                      <TableCell>{c.seniority ? <Badge variant="outline">{c.seniority}</Badge> : '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.email || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(c.lead_score ?? 0)}`}>{c.lead_score ?? 0}</span>
                          <Progress value={c.lead_score ?? 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {c.lead_score_breakdown && typeof c.lead_score_breakdown === 'object' && 
                            Object.entries(c.lead_score_breakdown as Record<string, number>).map(([k, v]) => (
                              <Badge key={k} variant="secondary" className="text-[10px]">{k}: +{v}</Badge>
                            ))
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

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
