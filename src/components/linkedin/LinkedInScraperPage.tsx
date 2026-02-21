import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLinkedinLeads } from '@/hooks/useLinkedinLeads';
import { Search, Eye, Download, Loader2, UserCheck, UserX, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LinkedInScraperPage() {
  const { leads, isLoading, updateLead } = useLinkedinLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewLead, setViewLead] = useState<any>(null);

  const scraped = leads.filter(l => l.scraped_at || l.first_name || l.headline);
  const unscraped = leads.filter(l => !l.scraped_at && !l.first_name && !l.headline);

  const filtered = leads.filter(l => {
    const matchSearch = (l.linkedin_url?.toLowerCase().includes(search.toLowerCase())) ||
      (l.first_name?.toLowerCase().includes(search.toLowerCase())) ||
      (l.last_name?.toLowerCase().includes(search.toLowerCase())) ||
      (l.company_name?.toLowerCase().includes(search.toLowerCase())) ||
      (l.headline?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || l.working_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportJSON = () => {
    const data = filtered.map(l => ({
      linkedin_url: l.linkedin_url,
      first_name: l.first_name,
      last_name: l.last_name,
      headline: l.headline,
      company_name: l.company_name,
      location: l.location,
      about: l.about,
      working_status: l.working_status,
      experience: l.experience,
      skills: l.skills,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin_leads.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['LinkedIn URL', 'First Name', 'Last Name', 'Headline', 'Company', 'Location', 'Status'];
    const rows = filtered.map(l => [
      l.linkedin_url, l.first_name || '', l.last_name || '', l.headline || '',
      l.company_name || '', l.location || '', l.working_status || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin_leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusIcon = (status: string | null) => {
    switch (status) {
      case 'True': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'False': return <UserX className="w-4 h-4 text-destructive" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">LinkedIn Scraper</h1>
        <p className="text-muted-foreground mt-1">View scraped LinkedIn lead data and export results</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{leads.length}</p>
            <p className="text-sm text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{scraped.length}</p>
            <p className="text-sm text-muted-foreground">Scraped</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{unscraped.length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{leads.filter(l => l.working_status === 'ERROR').length}</p>
            <p className="text-sm text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex gap-2">
          {['all', 'True', 'False', 'UNPROCESSED', 'ERROR'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : s}
            </Button>
          ))}
        </div>

        <Button variant="outline" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" />CSV</Button>
        <Button variant="outline" onClick={handleExportJSON}><Download className="w-4 h-4 mr-2" />JSON</Button>
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No leads found. Import links from the Link Finder page first.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Headline</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scraped</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(lead => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewLead(lead)}>
                    <TableCell>{statusIcon(lead.working_status)}</TableCell>
                    <TableCell className="font-medium">{[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{lead.headline || '—'}</TableCell>
                    <TableCell>{lead.company_name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.location || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={lead.scraped_at ? 'default' : 'secondary'}>
                        {lead.scraped_at ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setViewLead(lead); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!viewLead} onOpenChange={() => setViewLead(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{[viewLead?.first_name, viewLead?.last_name].filter(Boolean).join(' ') || 'Lead Details'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {viewLead && (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                  <TabsTrigger value="experience" className="flex-1">Experience</TabsTrigger>
                  <TabsTrigger value="raw" className="flex-1">Raw Data</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{[viewLead.first_name, viewLead.last_name].filter(Boolean).join(' ') || '—'}</p></div>
                    <div><p className="text-sm text-muted-foreground">Headline</p><p className="font-medium">{viewLead.headline || '—'}</p></div>
                    <div><p className="text-sm text-muted-foreground">Company</p><p className="font-medium">{viewLead.company_name || '—'}</p></div>
                    <div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{viewLead.location || '—'}</p></div>
                    <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={viewLead.working_status === 'True' ? 'default' : 'secondary'}>{viewLead.working_status}</Badge></div>
                    <div><p className="text-sm text-muted-foreground">LinkedIn</p><a href={viewLead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">{viewLead.linkedin_url}</a></div>
                  </div>
                  {viewLead.about && (
                    <div>
                      <Separator className="my-3" />
                      <p className="text-sm text-muted-foreground mb-1">About</p>
                      <p className="text-sm">{viewLead.about}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="experience" className="mt-4">
                  {Array.isArray(viewLead.experience) && viewLead.experience.length > 0 ? (
                    <div className="space-y-3">
                      {viewLead.experience.map((exp: any, i: number) => (
                        <Card key={i} className="border-border">
                          <CardContent className="p-4">
                            <p className="font-medium">{exp.title || exp.role || 'Position'}</p>
                            <p className="text-sm text-muted-foreground">{exp.company || '—'}</p>
                            <p className="text-xs text-muted-foreground">{exp.duration || exp.dates || '—'}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No experience data available</p>
                  )}
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[400px]">
                    {JSON.stringify(viewLead.scraped_data || viewLead, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
