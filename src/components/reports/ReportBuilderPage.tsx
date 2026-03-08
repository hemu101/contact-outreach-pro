import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomReports } from '@/hooks/useCustomReports';
import { Plus, Trash2, BarChart3, PieChart, LineChart, Table as TableIcon, Pin } from 'lucide-react';
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
];

const DIMENSION_FIELDS: Record<string, { value: string; label: string }[]> = {
  contacts: [
    { value: 'seniority', label: 'Seniority' },
    { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' },
    { value: 'departments', label: 'Department' },
    { value: 'mql', label: 'MQL Status' },
    { value: 'sql_status', label: 'SQL Status' },
  ],
  deals: [
    { value: 'stage', label: 'Pipeline Stage' },
    { value: 'currency', label: 'Currency' },
  ],
  companies: [
    { value: 'industry', label: 'Industry' },
    { value: 'size', label: 'Company Size' },
    { value: 'company_country', label: 'Country' },
  ],
};

const COLORS = ['hsl(var(--primary))', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export function ReportBuilderPage() {
  const { reports, createReport, deleteReport } = useCustomReports();
  const { contacts } = useCompanyContacts();
  const { deals, stages } = usePipeline();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({ report_type: 'bar', data_source: 'contacts' });

  const handleCreate = () => {
    if (!form.name?.trim()) return;
    createReport.mutate({
      name: form.name,
      report_type: form.report_type,
      data_source: form.data_source,
      dimensions: [{ field: form.dimension }],
      description: form.description || null,
    });
    setForm({ report_type: 'bar', data_source: 'contacts' });
    setShowCreate(false);
  };

  const generateChartData = (report: any) => {
    const dim = report.dimensions?.[0]?.field;
    if (!dim) return [];

    if (report.data_source === 'contacts') {
      const counts: Record<string, number> = {};
      contacts.forEach(c => {
        const val = (c as any)[dim] || 'Unknown';
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
    }
    if (report.data_source === 'deals') {
      if (dim === 'stage') {
        return stages.map(s => ({
          name: s.name,
          value: deals.filter(d => d.stage_id === s.id).length,
        }));
      }
    }
    return [];
  };

  const renderChart = (report: any) => {
    const data = generateChartData(report);
    if (!data.length) return <p className="text-sm text-muted-foreground text-center py-8">No data available</p>;

    if (report.report_type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (report.report_type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <RePieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
      );
    }
    if (report.report_type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
          </ReLineChart>
        </ResponsiveContainer>
      );
    }
    return (
      <div className="space-y-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/30">
            <span className="text-sm">{d.name}</span>
            <Badge variant="secondary">{d.value}</Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-7 h-7" /> Report Builder</h1>
          <p className="text-muted-foreground mt-1">Create custom reports with your data</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button variant="gradient"><Plus className="w-4 h-4 mr-2" />New Report</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Report</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Report Name *</Label><Input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Contacts by Seniority" /></div>
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
              <div><Label>Group By</Label>
                <Select value={form.dimension || ''} onValueChange={v => setForm({...form, dimension: v})}>
                  <SelectTrigger><SelectValue placeholder="Select field..." /></SelectTrigger>
                  <SelectContent>{(DIMENSION_FIELDS[form.data_source] || []).map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!form.name?.trim() || !form.dimension}>Create Report</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reports.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No custom reports yet. Create your first report to visualize your data.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {reports.map(report => (
            <Card key={report.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{report.name}</CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[10px]">{report.data_source}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteReport.mutate(report.id)}>
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
    </div>
  );
}
