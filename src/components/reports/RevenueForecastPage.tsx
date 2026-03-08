import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePipeline } from '@/hooks/usePipeline';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useCompanyContacts } from '@/hooks/useCompanyContacts';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, addMonths, startOfMonth } from 'date-fns';

const COLORS = ['hsl(var(--primary))', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

export function RevenueForecastPage() {
  const { deals, stages } = usePipeline();
  const { campaigns } = useCampaigns();
  const { contacts } = useCompanyContacts();

  // Pipeline metrics
  const totalPipelineValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const weightedValue = deals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);
  const avgDealSize = deals.length ? totalPipelineValue / deals.length : 0;
  const wonDeals = deals.filter(d => stages.find(s => s.id === d.stage_id)?.name === 'Won');
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);

  // Stage distribution
  const stageData = stages.map(s => ({
    name: s.name,
    deals: deals.filter(d => d.stage_id === s.id).length,
    value: deals.filter(d => d.stage_id === s.id).reduce((sum, d) => sum + (d.value || 0), 0),
    color: s.color,
  }));

  // Monthly forecast (next 6 months)
  const monthlyForecast = Array.from({ length: 6 }, (_, i) => {
    const month = addMonths(startOfMonth(new Date()), i);
    const monthDeals = deals.filter(d => {
      if (!d.expected_close_date) return false;
      const closeDate = new Date(d.expected_close_date);
      return closeDate.getMonth() === month.getMonth() && closeDate.getFullYear() === month.getFullYear();
    });
    return {
      month: format(month, 'MMM yyyy'),
      projected: monthDeals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0),
      total: monthDeals.reduce((s, d) => s + (d.value || 0), 0),
      count: monthDeals.length,
    };
  });

  // Win rate by stage
  const conversionData = stages.filter(s => s.name !== 'Lost').map(s => ({
    name: s.name,
    count: deals.filter(d => d.stage_id === s.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="w-7 h-7" /> Revenue Forecast</h1>
        <p className="text-muted-foreground mt-1">Pipeline analytics and revenue projections</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Total Pipeline</span></div>
            <p className="text-2xl font-bold text-foreground">${totalPipelineValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Target className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Weighted Forecast</span></div>
            <p className="text-2xl font-bold text-foreground">${weightedValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Avg Deal Size</span></div>
            <p className="text-2xl font-bold text-foreground">${avgDealSize.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Won Revenue</span></div>
            <p className="text-2xl font-bold text-foreground">${wonValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Forecast */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-lg">Monthly Forecast</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyForecast}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="projected" fill="hsl(var(--primary))" name="Weighted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="hsl(var(--primary) / 0.3)" name="Total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-lg">Pipeline by Stage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stageData.filter(s => s.value > 0)} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: $${value.toLocaleString()}`}>
                  {stageData.map((s, i) => <Cell key={i} fill={s.color || COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Conversion */}
      <Card className="border-border">
        <CardHeader><CardTitle className="text-lg">Pipeline Funnel</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 justify-center h-[200px]">
            {conversionData.map((stage, i) => {
              const maxCount = Math.max(...conversionData.map(s => s.count), 1);
              const height = Math.max((stage.count / maxCount) * 180, 20);
              return (
                <div key={stage.name} className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold">{stage.count}</span>
                  <div className="w-20 rounded-t-lg transition-all" style={{ height, backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground">{stage.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
