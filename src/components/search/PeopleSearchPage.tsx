import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Save, Download, UserPlus, Target, Zap, Globe, Linkedin, Mail, Phone, Building2, MapPin, Briefcase, TrendingUp, X } from 'lucide-react';
import { useCompanyContacts, CompanyContact } from '@/hooks/useCompanyContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  name: string;
  title: string;
  seniority: string;
  department: string;
  company: string;
  industry: string;
  city: string;
  state: string;
  country: string;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedin: boolean;
  minLeadScore: number;
  maxLeadScore: number;
  mql: string;
  sqlStatus: string;
  pipelineStage: string;
  tags: string;
}

const defaultFilters: SearchFilters = {
  name: '', title: '', seniority: '', department: '', company: '', industry: '',
  city: '', state: '', country: '', hasEmail: false, hasPhone: false, hasLinkedin: false,
  minLeadScore: 0, maxLeadScore: 100, mql: '', sqlStatus: '', pipelineStage: '', tags: '',
};

const seniorityOptions = ['C-Suite', 'VP', 'Director', 'Manager', 'Senior', 'Entry'];
const departmentOptions = ['Sales', 'Marketing', 'Engineering', 'Finance', 'HR', 'Operations', 'Product', 'Design'];

export function PeopleSearchPage() {
  const { contacts, isLoading } = useCompanyContacts();
  const { companies } = useCompanies();
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [selectedContact, setSelectedContact] = useState<CompanyContact | null>(null);

  const filteredContacts = contacts.filter(c => {
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    if (filters.name && !fullName.includes(filters.name.toLowerCase())) return false;
    if (filters.title && !(c.title || '').toLowerCase().includes(filters.title.toLowerCase())) return false;
    if (filters.seniority && c.seniority !== filters.seniority) return false;
    if (filters.department && !(c.departments || '').toLowerCase().includes(filters.department.toLowerCase())) return false;
    if (filters.city && !(c.city || '').toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.state && !(c.state || '').toLowerCase().includes(filters.state.toLowerCase())) return false;
    if (filters.country && !(c.country || '').toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.hasEmail && !c.email) return false;
    if (filters.hasPhone && !c.work_direct_phone && !c.mobile_phone) return false;
    if (filters.hasLinkedin && !c.person_linkedin_url) return false;
    if (filters.minLeadScore > 0 && (c.lead_score || 0) < filters.minLeadScore) return false;
    if (filters.maxLeadScore < 100 && (c.lead_score || 0) > filters.maxLeadScore) return false;
    if (filters.mql && c.mql !== filters.mql) return false;
    if (filters.sqlStatus && c.sql_status !== filters.sqlStatus) return false;
    if (filters.pipelineStage && c.pipeline_stage !== filters.pipelineStage) return false;
    if (filters.tags) {
      const searchTags = filters.tags.split(',').map(t => t.trim().toLowerCase());
      const contactTags = (c.tags || []).map(t => t.toLowerCase());
      if (!searchTags.some(st => contactTags.includes(st))) return false;
    }
    return true;
  });

  const activeFilterCount = Object.entries(filters).filter(([key, val]) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return key === 'minLeadScore' ? val > 0 : val < 100;
    return val !== '';
  }).length;

  const handleSaveSearch = async () => {
    if (!user || !searchName) return;
    const { error } = await supabase.from('saved_searches').insert({
      user_id: user.id, name: searchName, filters: filters as any,
      result_count: filteredContacts.length, last_run_at: new Date().toISOString(),
    });
    if (error) toast({ title: 'Failed to save search', variant: 'destructive' });
    else { toast({ title: 'Search saved!' }); setSaveDialogOpen(false); setSearchName(''); }
  };

  const handleExportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Title', 'Email', 'Company', 'Seniority', 'City', 'Country', 'Lead Score', 'MQL', 'SQL'];
    const rows = filteredContacts.map(c => [
      c.first_name, c.last_name, c.title, c.email, '', c.seniority, c.city, c.country, c.lead_score, c.mql, c.sql_status,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'people-search-results.csv'; a.click();
  };

  const toggleSelect = (id: string) => {
    setSelectedContacts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectAll = () => {
    if (selectedContacts.size === filteredContacts.length) setSelectedContacts(new Set());
    else setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">People Search</h1>
          <p className="text-muted-foreground mt-1">Apollo-style advanced lead search & filtering</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Save className="w-4 h-4 mr-2" />Save Search</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Save Search</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Search Name</Label><Input value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="e.g. VP Marketing in SaaS" /></div>
                <p className="text-sm text-muted-foreground">{activeFilterCount} filters applied · {filteredContacts.length} results</p>
                <Button onClick={handleSaveSearch} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search by name, title, email..." value={filters.name}
                onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} />
            </div>
            <Select value={filters.seniority} onValueChange={v => setFilters(f => ({ ...f, seniority: v === 'all' ? '' : v }))}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Seniority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {seniorityOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="w-40" placeholder="Job Title" value={filters.title}
              onChange={e => setFilters(f => ({ ...f, title: e.target.value }))} />
            <Button variant={showAdvanced ? 'default' : 'outline'} size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="w-4 h-4 mr-2" />Filters {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label className="text-xs">City</Label><Input placeholder="City" value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} /></div>
              <div><Label className="text-xs">State</Label><Input placeholder="State" value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))} /></div>
              <div><Label className="text-xs">Country</Label><Input placeholder="Country" value={filters.country} onChange={e => setFilters(f => ({ ...f, country: e.target.value }))} /></div>
              <div><Label className="text-xs">Department</Label>
                <Select value={filters.department} onValueChange={v => setFilters(f => ({ ...f, department: v === 'all' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All</SelectItem>{departmentOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">MQL Status</Label><Input placeholder="MQL" value={filters.mql} onChange={e => setFilters(f => ({ ...f, mql: e.target.value }))} /></div>
              <div><Label className="text-xs">SQL Status</Label><Input placeholder="SQL" value={filters.sqlStatus} onChange={e => setFilters(f => ({ ...f, sqlStatus: e.target.value }))} /></div>
              <div><Label className="text-xs">Pipeline Stage</Label><Input placeholder="Stage" value={filters.pipelineStage} onChange={e => setFilters(f => ({ ...f, pipelineStage: e.target.value }))} /></div>
              <div><Label className="text-xs">Tags (comma sep)</Label><Input placeholder="tag1, tag2" value={filters.tags} onChange={e => setFilters(f => ({ ...f, tags: e.target.value }))} /></div>
              <div><Label className="text-xs">Min Score</Label><Input type="number" value={filters.minLeadScore} onChange={e => setFilters(f => ({ ...f, minLeadScore: Number(e.target.value) }))} /></div>
              <div><Label className="text-xs">Max Score</Label><Input type="number" value={filters.maxLeadScore} onChange={e => setFilters(f => ({ ...f, maxLeadScore: Number(e.target.value) }))} /></div>
              <div className="flex items-end gap-2">
                <Button variant={filters.hasEmail ? 'default' : 'outline'} size="sm" onClick={() => setFilters(f => ({ ...f, hasEmail: !f.hasEmail }))}><Mail className="w-3 h-3 mr-1" />Has Email</Button>
              </div>
              <div className="flex items-end gap-2">
                <Button variant={filters.hasLinkedin ? 'default' : 'outline'} size="sm" onClick={() => setFilters(f => ({ ...f, hasLinkedin: !f.hasLinkedin }))}><Linkedin className="w-3 h-3 mr-1" />Has LinkedIn</Button>
              </div>
              <div className="col-span-full flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)}><X className="w-3 h-3 mr-1" />Clear All Filters</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{filteredContacts.length.toLocaleString()} results</span>
          {selectedContacts.size > 0 && (
            <Badge variant="secondary">{selectedContacts.size} selected</Badge>
          )}
        </div>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-400"><Target className="w-3 h-3" />Hot: {filteredContacts.filter(c => (c.lead_score || 0) >= 70).length}</div>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/10 text-yellow-400"><TrendingUp className="w-3 h-3" />Warm: {filteredContacts.filter(c => (c.lead_score || 0) >= 40 && (c.lead_score || 0) < 70).length}</div>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400"><Zap className="w-3 h-3" />Cold: {filteredContacts.filter(c => (c.lead_score || 0) < 40).length}</div>
        </div>
      </div>

      {/* Results Table */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><input type="checkbox" checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0} onChange={selectAll} className="rounded" /></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>MQL/SQL</TableHead>
                <TableHead>Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.slice(0, 100).map(contact => (
                <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedContact(contact)}>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedContacts.has(contact.id)} onChange={() => toggleSelect(contact.id)} className="rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{contact.first_name} {contact.last_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{contact.title || '—'}</TableCell>
                  <TableCell>{contact.seniority ? <Badge variant="outline" className="text-xs">{contact.seniority}</Badge> : '—'}</TableCell>
                  <TableCell className="text-sm">{contact.email || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{[contact.city, contact.state, contact.country].filter(Boolean).join(', ') || '—'}</TableCell>
                  <TableCell><span className={`font-bold ${getScoreColor(contact.lead_score || 0)}`}>{contact.lead_score || 0}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {contact.mql && <Badge className="text-[10px] bg-blue-500/20 text-blue-400">MQL</Badge>}
                      {contact.sql_status && <Badge className="text-[10px] bg-purple-500/20 text-purple-400">SQL</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{contact.pipeline_stage ? <Badge variant="outline" className="text-xs">{contact.pipeline_stage}</Badge> : '—'}</TableCell>
                </TableRow>
              ))}
              {filteredContacts.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">No contacts match your filters. Try adjusting your search criteria.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          {filteredContacts.length > 100 && (
            <div className="p-3 text-center text-sm text-muted-foreground border-t border-border">Showing 100 of {filteredContacts.length} results</div>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedContact.first_name} {selectedContact.last_name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selectedContact.title} {selectedContact.seniority ? `· ${selectedContact.seniority}` : ''}</p>
              </DialogHeader>
              <Tabs defaultValue="overview">
                <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="contact">Contact</TabsTrigger><TabsTrigger value="scoring">Scoring</TabsTrigger><TabsTrigger value="social">Social</TabsTrigger></TabsList>
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4 text-muted-foreground" /><span>{selectedContact.title || 'No title'}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-muted-foreground" /><span>{selectedContact.departments || 'No department'}</span></div>
                      <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{[selectedContact.city, selectedContact.state, selectedContact.country].filter(Boolean).join(', ') || 'No location'}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Lead Score:</span><span className={`text-2xl font-bold ${getScoreColor(selectedContact.lead_score || 0)}`}>{selectedContact.lead_score || 0}/100</span></div>
                      <div className="flex gap-2">{selectedContact.mql && <Badge className="bg-blue-500/20 text-blue-400">MQL: {selectedContact.mql}</Badge>}{selectedContact.sql_status && <Badge className="bg-purple-500/20 text-purple-400">SQL: {selectedContact.sql_status}</Badge>}</div>
                      {selectedContact.pipeline_stage && <Badge variant="outline">{selectedContact.pipeline_stage}</Badge>}
                    </div>
                  </div>
                  {selectedContact.tags && selectedContact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">{selectedContact.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
                  )}
                </TabsContent>
                <TabsContent value="contact" className="space-y-3 mt-4">
                  {[
                    { icon: Mail, label: 'Email', value: selectedContact.email },
                    { icon: Mail, label: 'Secondary Email', value: selectedContact.secondary_email },
                    { icon: Globe, label: 'Email (Website)', value: selectedContact.email_from_website },
                    { icon: Phone, label: 'Work Phone', value: selectedContact.work_direct_phone },
                    { icon: Phone, label: 'Mobile', value: selectedContact.mobile_phone },
                    { icon: Phone, label: 'Corporate', value: selectedContact.corporate_phone },
                    { icon: Phone, label: 'Home', value: selectedContact.home_phone },
                    { icon: Phone, label: 'Other', value: selectedContact.other_phone },
                  ].filter(item => item.value).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-sm">{item.value}</p></div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="scoring" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {selectedContact.lead_score_breakdown && Object.entries(selectedContact.lead_score_breakdown as Record<string, number>).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }} /></div>
                          <span className="text-sm font-mono w-8 text-right">+{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">IG Score</p><p className="text-lg font-bold">{selectedContact.ig_score || '—'}</p></Card>
                    <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">MQL</p><p className="text-lg font-bold">{selectedContact.mql || '—'}</p></Card>
                    <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">SQL</p><p className="text-lg font-bold">{selectedContact.sql_status || '—'}</p></Card>
                  </div>
                </TabsContent>
                <TabsContent value="social" className="space-y-3 mt-4">
                  {[
                    { icon: Linkedin, label: 'LinkedIn', value: selectedContact.person_linkedin_url },
                    { icon: Briefcase, label: 'LinkedIn Job', value: selectedContact.linkedin_job_link },
                  ].filter(item => item.value).map((item, i) => (
                    <a key={i} href={item.value!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors">
                      <item.icon className="w-4 h-4 text-primary" /><span className="text-sm">{item.value}</span>
                    </a>
                  ))}
                  {selectedContact.notes_for_sdr && (
                    <div className="p-3 rounded bg-muted/30"><p className="text-xs text-muted-foreground mb-1">SDR Notes</p><p className="text-sm">{selectedContact.notes_for_sdr}</p></div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
