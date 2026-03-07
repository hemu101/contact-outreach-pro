import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanies } from '@/hooks/useCompanies';
import { Search, Plus, Building2, Trash2, Edit, Loader2, ExternalLink, Globe, Upload, Download, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CompanyFormDialog } from './CompanyFormDialog';
import { CompanyContactsTab } from './CompanyContactsTab';

const ALL_COMPANY_FIELDS = [
  'name', 'company_name_for_emails', 'website', 'linkedin_url', 'company_linkedin_url',
  'industry', 'size', 'headquarters', 'description', 'short_description', 'phone',
  'company_phone', 'phone_from_website', 'email', 'instagram_url', 'facebook_url',
  'twitter_url', 'pinterest_url', 'company_city', 'company_state', 'company_country',
  'company_address', 'technologies', 'keywords', 'annual_revenue', 'total_funding',
  'latest_funding', 'latest_funding_amount', 'subsidiary_of', 'number_of_retail_locations',
  'extracted_from', 'website_status', 'd2c_presence', 'e_commerce_presence',
  'social_media_presence', 'ig_username', 'ig_bio', 'ig_followers_count',
  'total_post_in_3_months', 'average_er', 'total_collaborations', 'ugc_example',
  'worked_with_creators', 'hashtags', 'mentions', 'segmentation', 'firmographic_score',
  'engagement_score', 'ad_library_proof', 'founded',
];

export function CompaniesPage() {
  const { companies, isLoading, createCompany, updateCompany, deleteCompany } = useCompanies();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCompany, setEditCompany] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase()) ||
    c.headquarters?.toLowerCase().includes(search.toLowerCase()) ||
    (c as any).company_city?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => setForm({});

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { toast({ title: 'CSV must have a header row and data', variant: 'destructive' }); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, '').replace(/\s+/g, '_'));
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || lines[i].split(',').map(c => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          const mapped = ALL_COMPANY_FIELDS.find(f => f === h || h.includes(f));
          if (mapped && cols[idx]) row[mapped] = cols[idx];
          if ((h === 'company' || h === 'company_name') && !row.name) row.name = cols[idx] || '';
        });
        if (!row.name) continue;
        createCompany.mutate(row as any);
        imported++;
      }
      toast({ title: `Importing ${imported} companies` });
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCSVExport = () => {
    const headers = ALL_COMPANY_FIELDS;
    const rows = companies.map(c => headers.map(h => `"${((c as any)[h] || '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `companies_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${companies.length} companies` });
  };

  const handleSave = () => {
    if (!form.name?.trim()) return;
    if (editCompany) {
      updateCompany.mutate({ id: editCompany.id, ...form });
    } else {
      createCompany.mutate(form as any);
    }
    resetForm();
    setShowForm(false);
    setEditCompany(null);
  };

  const openEdit = (company: any) => {
    const f: Record<string, string> = {};
    ALL_COMPANY_FIELDS.forEach(key => { f[key] = company[key] || ''; });
    setForm(f);
    setEditCompany(company);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Companies</h1>
        <p className="text-muted-foreground mt-1">Store and manage company information and contacts for your outreach</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{companies.filter(c => c.website).length}</p>
            <p className="text-sm text-muted-foreground">With Website</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies"><Building2 className="w-4 h-4 mr-2" />Companies</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="w-4 h-4 mr-2" />Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleCSVImport} />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Import CSV</Button>
            <Button variant="outline" onClick={handleCSVExport} disabled={companies.length === 0}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            <Button onClick={() => { resetForm(); setEditCompany(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Company</Button>
          </div>

          {/* Table */}
          <Card className="border-border">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
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
                      <TableHead>Location</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Links</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(company => (
                      <TableRow key={company.id} className="cursor-pointer" onClick={() => setSelectedCompanyId(company.id)}>
                        <TableCell>
                          <p className="font-medium">{company.name}</p>
                          {company.email && <p className="text-xs text-muted-foreground">{company.email}</p>}
                        </TableCell>
                        <TableCell>{company.industry ? <Badge variant="outline">{company.industry}</Badge> : '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{company.size || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{company.headquarters || (company as any).company_city || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{company.annual_revenue || '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
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
                        <TableCell onClick={e => e.stopPropagation()}>
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
        </TabsContent>

        <TabsContent value="contacts">
          <CompanyContactsTab companyId={selectedCompanyId} />
        </TabsContent>
      </Tabs>

      <CompanyFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditCompany(null); resetForm(); }}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        isEdit={!!editCompany}
      />
    </div>
  );
}
