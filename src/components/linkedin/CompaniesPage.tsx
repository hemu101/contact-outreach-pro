import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompanies } from '@/hooks/useCompanies';
import { Search, Plus, Building2, Trash2, Edit, Loader2, ExternalLink, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Food & Beverage', 'Manufacturing', 'Education', 'Real Estate', 'Marketing', 'Consulting', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];

export function CompaniesPage() {
  const { companies, isLoading, createCompany, updateCompany, deleteCompany } = useCompanies();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editCompany, setEditCompany] = useState<any>(null);
  const [form, setForm] = useState({ name: '', website: '', linkedin_url: '', industry: '', size: '', headquarters: '', description: '', phone: '', email: '' });

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase()) ||
    c.headquarters?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => setForm({ name: '', website: '', linkedin_url: '', industry: '', size: '', headquarters: '', description: '', phone: '', email: '' });

  const handleSave = () => {
    if (!form.name.trim()) return;
    const data = { ...form, name: form.name.trim() };
    if (editCompany) {
      updateCompany.mutate({ id: editCompany.id, ...data });
    } else {
      createCompany.mutate(data);
    }
    resetForm();
    setShowAdd(false);
    setEditCompany(null);
  };

  const openEdit = (company: any) => {
    setForm({
      name: company.name || '',
      website: company.website || '',
      linkedin_url: company.linkedin_url || '',
      industry: company.industry || '',
      size: company.size || '',
      headquarters: company.headquarters || '',
      description: company.description || '',
      phone: company.phone || '',
      email: company.email || '',
    });
    setEditCompany(company);
    setShowAdd(true);
  };

  const handleClose = () => {
    setShowAdd(false);
    setEditCompany(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Companies</h1>
        <p className="text-muted-foreground mt-1">Store and manage company information for your outreach</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{companies.length}</p>
            <p className="text-sm text-muted-foreground">Total Companies</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{new Set(companies.map(c => c.industry).filter(Boolean)).size}</p>
            <p className="text-sm text-muted-foreground">Industries</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{companies.filter(c => c.linkedin_url).length}</p>
            <p className="text-sm text-muted-foreground">With LinkedIn</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={showAdd} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditCompany(null); }}><Plus className="w-4 h-4 mr-2" />Add Company</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editCompany ? 'Edit Company' : 'Add Company'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Company Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Acme Corp" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://acme.com" />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/company/acme" />
              </div>
              <div>
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={v => setForm({ ...form, industry: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Company Size</Label>
                <Select value={form.size} onValueChange={v => setForm({ ...form, size: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Headquarters</Label>
                <Input value={form.headquarters} onChange={e => setForm({ ...form, headquarters: e.target.value })} placeholder="San Francisco, CA" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-0100" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="info@acme.com" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Company description..." rows={3} />
              </div>
              <div className="col-span-2">
                <Button onClick={handleSave} disabled={!form.name.trim()} className="w-full">
                  {editCompany ? 'Update Company' : 'Add Company'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No companies yet. Add your first company above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>HQ</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(company => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <p className="font-medium">{company.name}</p>
                      {company.email && <p className="text-xs text-muted-foreground">{company.email}</p>}
                    </TableCell>
                    <TableCell>{company.industry ? <Badge variant="outline">{company.industry}</Badge> : '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{company.size || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{company.headquarters || '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Globe className="w-3 h-3" /></Button>
                          </a>
                        )}
                        {company.linkedin_url && (
                          <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="w-3 h-3" /></Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(company)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCompany.mutate(company.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
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
