import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCustomReports } from '@/hooks/useCustomReports';
import { Plus, Trash2, BarChart3, PieChart, LineChart, Table as TableIcon, Pin, Calendar, Filter, Download, Share2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';
import { useCompanyContacts } from '@/hooks/useCompanyContacts';
import { usePipeline } from '@/hooks/usePipeline';

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'table', label: 'Table', icon: TableIcon },
];

const DATA_SOURCES = [
  { value: 'contacts', label: 'Company Contacts' },
  { value: 'deals', label: 'Deals' },
  { value: 'companies', label: 'Companies' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'activities', label: 'Activities' },
];

const DIMENSION_FIELDS: Record<string, { value: string; label: string }[]> = {
  contacts: [
    { value: 'seniority', label: 'Seniority' },
    { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' },
    { value: 'departments', label: 'Department' },
    { value: 'mql', label: 'MQL Status' },
    { value: 'sql_status', label: 'SQL Status' },
    { value: 'pipeline_stage', label: 'Pipeline Stage' },
    { value: 'tags', label: 'Tags' },
  ],
  deals: [
    { value: 'stage', label: 'Pipeline Stage' },
    { value: 'currency', label: 'Currency' },
  ],
  companies: [
    { value: 'industry', label: 'Industry' },
    { value: 'size', label: 'Company Size' },
    { value: 'company_country', label: 'Country' },
    { value: 'founded', label: 'Founded Year' },
  ],
  campaigns: [
    { value: 'status', label: 'Status' },
  ],
  activities: [
    { value: 'activity_type', label: 'Activity Type' },
    { value: 'source', label: 'Source' },
  ],
};

const METRICS = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
];

const COLORS = ['hsl(var(--primary))', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export function ReportBuilderPage() {
  const { reports, createReport, deleteReport } = useCustomReports();
  const { contacts } = useCompanyContacts();
  const { deals, stages } = usePipeline();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [form, setForm] = useState<Record<string, any>>({ 
    report_type: 'bar', data_source: 'contacts', metric: 'count',
    name: '', description: '', dimension: '', date_range: 'all',
    filter_field: '', filter_value: '',
  });

  const handleCreate = () => {
    if (!form.name?.trim()) return;
    createReport.mutate({
      name: form.name,
      report_type: form.report_type,
      data_source: form.data_source,
      dimensions: [{ 
        field: form.dimension, 
        metric: form.metric,
        date_range: form.date_range,
        filter_field: form.filter_field,
        filter_value: form.filter_value,
      }],
      description: form.description || null,
    });
    setForm({ report_type: 'bar', data_source: 'contacts', metric: 'count', name: '', description: '', dimension: '', date_range: 'all', filter_field: '', filter_value: '' });
    setShowCreate(false);
  };

  const generateChartData = (report: any) => {
    const dim = report.dimensions?.[0]?.field;
    if (!dim) return [];
    if (report.data_source === 'contacts') {
      const counts: Record<string, number> = {};
      contacts.forEach(c => { const val = (c as any)[dim] || 'Unknown'; counts[val] = (counts[val] || 0) + 1; });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 15);
    }
    if (report.data_source === 'deals' && dim === 'stage') {
      return stages.map(s => ({ name: s.name, value: deals.filter(d => d.stage_id === s.id).length }));
    }
    return [];
  };

  const renderChart = (report: any) => {
    const data = generateChartData(report);
    if (!data.length) return <p className="text-sm text-muted-foreground text-center py-8">No data available</p>;
    if (report.report_type === 'bar') {
      return (<ResponsiveContainer width="100%" height={250}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>);
    }
    if (report.report_type === 'pie') {
      return (<ResponsiveContainer width="100%" height={250}><RePieChart><Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></RePieChart></ResponsiveContainer>);
    }
    if (report.report_type === 'line') {
      return (<ResponsiveContainer width="100%" height={250}><ReLineChart data={data}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} /></ReLineChart></ResponsiveContainer>);
    }
    return (<div className="space-y-1">{data.map(d => (<div key={d.name} className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/30"><span className="text-sm">{d.name}</span><Badge variant="secondary">{d.value}</Badge></div>))}</div>);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-7 h-7" /> Report Builder</h1>
          <p className="text-muted-foreground mt-1">Create advanced custom reports with filters and multiple data sources</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button variant="gradient"><Plus className="w-4 h-4 mr-2" />New Report</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Report</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Report Name *</Label><Input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Contacts by Seniority" /></div>
              <div><Label>Description</Label><Textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="What does this report show?" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Chart Type</Label>
                  <Select value={form.report_type} onValueChange={v => setForm({...form, report_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CHART_TYPES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Data Source</Label>
                  <Select value={form.data_source} onValueChange={v => setForm({...form, data_source: v, dimension: ''})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DATA_SOURCES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Group By</Label>
                  <Select value={form.dimension || ''} onValueChange={v => setForm({...form, dimension: v})}>
                    <SelectTrigger><SelectValue placeholder="Select field..." /></SelectTrigger>
                    <SelectContent>{(DIMENSION_FIELDS[form.data_source] || []).map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Metric</Label>
                  <Select value={form.metric} onValueChange={v => setForm({...form, metric: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{METRICS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Date Range</Label>
                <Select value={form.date_range} onValueChange={v => setForm({...form, date_range: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Filter Field (optional)</Label>
                  <Select value={form.filter_field || ''} onValueChange={v => setForm({...form, filter_field: v})}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {(DIMENSION_FIELDS[form.data_source] || []).map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Filter Value</Label><Input value={form.filter_value || ''} onChange={e => setForm({...form, filter_value: e.target.value})} placeholder="e.g. C-Suite" /></div>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!form.name?.trim() || !form.dimension}>Create Report</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reports.length === 0 ? (
        <Card className="border-border"><CardContent className="py-12 text-center text-muted-foreground"><BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No custom reports yet. Create your first report to visualize your data.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map(report => (
            <Card key={report.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    {report.description && <CardDescription className="text-xs mt-1">{report.description}</CardDescription>}
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[10px]">{report.data_source}</Badge>
                    <Badge variant="outline" className="text-[10px]">{report.report_type}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDeleteConfirm({ open: true, id: report.id, name: report.name })}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>{renderChart(report)}</CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        title="Delete Report?"
        description={`Are you sure you want to delete "${deleteConfirm.name}"?`}
        confirmLabel="Yes, delete"
        onConfirm={() => { deleteReport.mutate(deleteConfirm.id); setDeleteConfirm({ open: false, id: '', name: '' }); }}
      />
    </div>
  );
}
