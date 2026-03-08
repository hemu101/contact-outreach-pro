import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompanyContacts } from '@/hooks/useCompanyContacts';
import { Search, Plus, Trash2, Edit, Loader2, Users, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SENIORITY_OPTIONS = ['C-Suite', 'VP', 'Director', 'Manager', 'Senior', 'Entry', 'Intern', 'Other'];

const FIELD_GROUPS = {
  basic: [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name' },
    { key: 'title', label: 'Job Title' },
    { key: 'seniority', label: 'Seniority', type: 'select', options: SENIORITY_OPTIONS },
    { key: 'departments', label: 'Departments' },
  ],
  contact: [
    { key: 'email', label: 'Email' },
    { key: 'secondary_email', label: 'Secondary Email' },
    { key: 'email_from_website', label: 'Email from Website' },
    { key: 'work_direct_phone', label: 'Work Direct Phone' },
    { key: 'mobile_phone', label: 'Mobile Phone' },
    { key: 'home_phone', label: 'Home Phone' },
    { key: 'corporate_phone', label: 'Corporate Phone' },
    { key: 'other_phone', label: 'Other Phone' },
  ],
  location: [
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
  ],
  social: [
    { key: 'person_linkedin_url', label: 'LinkedIn URL' },
    { key: 'job_tracking_link', label: 'Job Tracking Link' },
    { key: 'linkedin_job_link', label: 'LinkedIn Job Link' },
  ],
  job: [
    { key: 'hiring_job_title', label: 'Hiring Job Title' },
    { key: 'job_location', label: 'Job Location' },
    { key: 'linkedin_job_title', label: 'LinkedIn Job Title' },
    { key: 'job_basedon', label: 'Job Based On' },
    { key: 'salary_estimated', label: 'Salary (Estimated)' },
  ],
  scoring: [
    { key: 'mql', label: 'MQL' },
    { key: 'sql_status', label: 'SQL Status' },
    { key: 'ig_score', label: 'IG Score' },
    { key: 'pipeline_stage', label: 'Pipeline Stage' },
    { key: 'date_of_filtration', label: 'Date of Filtration' },
    { key: 'notes_for_sdr', label: 'Notes for SDR', type: 'textarea', full: true },
    { key: 'notes_for_data', label: 'Notes for Data', type: 'textarea', full: true },
  ],
};

const ALL_FIELDS = Object.values(FIELD_GROUPS).flat();

export function CompanyContactsTab({ companyId }: { companyId?: string }) {
  const { contacts, isLoading, createContact, updateContact, deleteContact } = useCompanyContacts(companyId);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editContact, setEditContact] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const filtered = contacts.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email} ${c.title} ${c.seniority} ${c.city} ${c.country}`.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => setForm({});
  const set = (key: string, val: string) => setForm({ ...form, [key]: val });

  const handleSave = () => {
    if (!form.first_name?.trim()) return;
    if (editContact) {
      updateContact.mutate({ id: editContact.id, ...form });
    } else {
      createContact.mutate({ ...form, company_id: companyId || null } as any);
    }
    resetForm();
    setShowAdd(false);
    setEditContact(null);
  };

  const openEdit = (contact: any) => {
    const f: Record<string, string> = {};
    ALL_FIELDS.forEach(({ key }) => { f[key] = contact[key] || ''; });
    setForm(f);
    setEditContact(contact);
    setShowAdd(true);
  };

  const renderField = (field: any) => {
    if (field.type === 'select') {
      return (
        <div key={field.key} className={field.full ? 'col-span-2' : ''}>
          <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
          <Select value={form[field.key] || ''} onValueChange={v => set(field.key, v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{field.options.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      );
    }
    if (field.type === 'textarea') {
      return (
        <div key={field.key} className={field.full ? 'col-span-2' : ''}>
          <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
          <Textarea value={form[field.key] || ''} onChange={e => set(field.key, e.target.value)} rows={2} className="text-sm" />
        </div>
      );
    }
    return (
      <div key={field.key} className={field.full ? 'col-span-2' : ''}>
        <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
        <Input value={form[field.key] || ''} onChange={e => set(field.key, e.target.value)} placeholder={field.label} className="h-8 text-sm" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={showAdd} onOpenChange={(v) => { if (!v) { setShowAdd(false); setEditContact(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditContact(null); setShowAdd(true); }}><Plus className="w-4 h-4 mr-2" />Add Contact</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh]">
            <DialogHeader><DialogTitle>{editContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle></DialogHeader>
            <Tabs defaultValue="basic">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="job">Job Info</TabsTrigger>
                <TabsTrigger value="scoring">Scoring</TabsTrigger>
              </TabsList>
              <ScrollArea className="max-h-[55vh] mt-4 pr-4">
                <TabsContent value="basic" className="grid grid-cols-2 gap-3 mt-0">
                  {FIELD_GROUPS.basic.map(renderField)}
                </TabsContent>
                <TabsContent value="contact" className="grid grid-cols-2 gap-3 mt-0">
                  {FIELD_GROUPS.contact.map(renderField)}
                </TabsContent>
                <TabsContent value="location" className="grid grid-cols-2 gap-3 mt-0">
                  {FIELD_GROUPS.location.map(renderField)}
                </TabsContent>
                <TabsContent value="social" className="grid grid-cols-2 gap-3 mt-0">
                  {FIELD_GROUPS.social.map(renderField)}
                </TabsContent>
                <TabsContent value="job" className="grid grid-cols-2 gap-3 mt-0">
                  {FIELD_GROUPS.job.map(renderField)}
                </TabsContent>
                <TabsContent value="scoring" className="grid grid-cols-2 gap-3 mt-0">
                  {FIELD_GROUPS.scoring.map(renderField)}
                </TabsContent>
              </ScrollArea>
            </Tabs>
            <Button onClick={handleSave} disabled={!form.first_name?.trim()} className="w-full mt-2">
              {editContact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No contacts yet.</p>
            </div>
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
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead>MQL</TableHead>
                    <TableHead>SQL</TableHead>
                    <TableHead>IG Score</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <span className="font-medium whitespace-nowrap">{c.first_name} {c.last_name}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{c.title || '—'}</TableCell>
                      <TableCell>{c.seniority ? <Badge variant="outline" className="text-xs">{c.seniority}</Badge> : '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.email || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{c.work_direct_phone || c.mobile_phone || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.city || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.state || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.country || '—'}</TableCell>
                      <TableCell>
                        {c.person_linkedin_url ? (
                          <a href={c.person_linkedin_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 text-primary" />
                          </a>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{c.mql ? <Badge variant="secondary" className="text-xs">{c.mql}</Badge> : '—'}</TableCell>
                      <TableCell>{c.sql_status ? <Badge variant="secondary" className="text-xs">{c.sql_status}</Badge> : '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.ig_score || '—'}</TableCell>
                      <TableCell>{c.pipeline_stage ? <Badge variant="outline" className="text-xs">{c.pipeline_stage}</Badge> : '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Edit className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteContact.mutate(c.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
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
    </div>
  );
}
