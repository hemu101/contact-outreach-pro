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

const SENIORITY_OPTIONS = ['C-Suite', 'VP', 'Director', 'Manager', 'Senior', 'Entry', 'Intern', 'Other'];

export function CompanyContactsTab({ companyId }: { companyId?: string }) {
  const { contacts, isLoading, createContact, updateContact, deleteContact } = useCompanyContacts(companyId);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editContact, setEditContact] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const FIELDS = [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name' },
    { key: 'title', label: 'Job Title' },
    { key: 'seniority', label: 'Seniority' },
    { key: 'departments', label: 'Departments' },
    { key: 'email', label: 'Email' },
    { key: 'secondary_email', label: 'Secondary Email' },
    { key: 'work_direct_phone', label: 'Work Phone' },
    { key: 'mobile_phone', label: 'Mobile Phone' },
    { key: 'person_linkedin_url', label: 'LinkedIn URL' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'mql', label: 'MQL' },
    { key: 'sql_status', label: 'SQL Status' },
    { key: 'notes_for_sdr', label: 'Notes for SDR' },
  ];

  const filtered = contacts.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email} ${c.title}`.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => setForm({});

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
    FIELDS.forEach(({ key }) => { f[key] = contact[key] || ''; });
    setForm(f);
    setEditContact(contact);
    setShowAdd(true);
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
          <DialogContent className="max-w-lg max-h-[80vh]">
            <DialogHeader><DialogTitle>{editContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map(({ key, label, required }) => (
                  <div key={key} className={key === 'notes_for_sdr' ? 'col-span-2' : ''}>
                    <Label className="text-xs">{label}{required && ' *'}</Label>
                    <Input
                      value={form[key] || ''}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      placeholder={label}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <Button onClick={handleSave} disabled={!form.first_name?.trim()} className="w-full">
                    {editContact ? 'Update' : 'Add Contact'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.first_name} {c.last_name}</span>
                        {c.person_linkedin_url && (
                          <a href={c.person_linkedin_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.title || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.email || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.work_direct_phone || c.mobile_phone || '—'}</TableCell>
                    <TableCell>{c.seniority ? <Badge variant="outline" className="text-xs">{c.seniority}</Badge> : '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{[c.city, c.country].filter(Boolean).join(', ') || '—'}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
