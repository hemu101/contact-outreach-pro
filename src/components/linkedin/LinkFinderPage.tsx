import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLinkedinLeads } from '@/hooks/useLinkedinLeads';
import { Search, Plus, Upload, ExternalLink, Trash2, Link2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function LinkFinderPage() {
  const { leads, isLoading, createLead, createManyLeads, deleteLead } = useLinkedinLeads();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');

  const filtered = leads.filter(l =>
    (l.linkedin_url?.toLowerCase().includes(search.toLowerCase())) ||
    (l.company_name?.toLowerCase().includes(search.toLowerCase())) ||
    (l.first_name?.toLowerCase().includes(search.toLowerCase())) ||
    (l.last_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    createLead.mutate({ linkedin_url: newUrl.trim(), company_name: newCompany.trim() || undefined });
    setNewUrl('');
    setNewCompany('');
    setShowAdd(false);
  };

  const handleBulkImport = () => {
    const lines = bulkUrls.split('\n').filter(l => l.trim());
    const parsed = lines.map(line => {
      const parts = line.split(',');
      return {
        linkedin_url: parts[0]?.trim() || '',
        company_name: parts[1]?.trim() || undefined,
      };
    }).filter(l => l.linkedin_url);
    if (parsed.length > 0) {
      createManyLeads.mutate(parsed);
      setBulkUrls('');
      setShowBulk(false);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1).filter(l => l.trim());
      const parsed = lines.map(line => {
        const parts = line.split(',');
        return {
          linkedin_url: parts[0]?.trim() || '',
          company_name: parts[1]?.trim() || undefined,
        };
      }).filter(l => l.linkedin_url && l.linkedin_url.includes('linkedin'));
      if (parsed.length > 0) {
        createManyLeads.mutate(parsed);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case 'True': return 'default';
      case 'False': return 'destructive';
      case 'UNPROCESSED': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Link Finder</h1>
        <p className="text-muted-foreground mt-1">Find and manage LinkedIn profile links for lead generation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{leads.length}</p>
            <p className="text-sm text-muted-foreground">Total Links</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{leads.filter(l => l.working_status === 'True').length}</p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{leads.filter(l => l.working_status === 'UNPROCESSED').length}</p>
            <p className="text-sm text-muted-foreground">Unprocessed</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{leads.filter(l => l.working_status === 'False').length}</p>
            <p className="text-sm text-muted-foreground">Not Found</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search links..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Link</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add LinkedIn Link</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>LinkedIn URL *</Label>
                <Input placeholder="https://linkedin.com/in/username" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input placeholder="Company name to verify" value={newCompany} onChange={e => setNewCompany(e.target.value)} />
              </div>
              <Button onClick={handleAdd} disabled={!newUrl.trim() || createLead.isPending} className="w-full">
                {createLead.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showBulk} onOpenChange={setShowBulk}>
          <DialogTrigger asChild>
            <Button variant="outline"><Link2 className="w-4 h-4 mr-2" />Bulk Paste</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Bulk Import Links</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">One per line: <code>linkedin_url, company_name</code></p>
              <Textarea rows={8} placeholder="https://linkedin.com/in/user1, Acme Corp&#10;https://linkedin.com/in/user2, Widget Co" value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} />
              <Button onClick={handleBulkImport} disabled={createManyLeads.isPending} className="w-full">Import</Button>
            </div>
          </DialogContent>
        </Dialog>

        <label>
          <Button variant="outline" asChild><span><Upload className="w-4 h-4 mr-2" />Upload CSV</span></Button>
          <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
        </label>
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
              <Link2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No links found. Add your first LinkedIn link above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LinkedIn URL</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell className="max-w-[250px]">
                      <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 truncate">
                        {lead.linkedin_url.replace('http://www.linkedin.com/in/', '').replace('https://www.linkedin.com/in/', '')}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>{[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell>{lead.company_name || '—'}</TableCell>
                    <TableCell><Badge variant={statusColor(lead.working_status)}>{lead.working_status || 'UNPROCESSED'}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteLead.mutate(lead.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
