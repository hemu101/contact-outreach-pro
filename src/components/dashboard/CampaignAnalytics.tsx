import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Mail, MousePointer, Eye, Users, Target } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Campaign = Tables<'campaigns'>;

interface CampaignAnalyticsProps {
  campaigns: Campaign[];
}

export function CampaignAnalytics({ campaigns }: CampaignAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.click_count || 0), 0);
    const totalContacts = campaigns.reduce((sum, c) => sum + (c.total_contacts || 0), 0);

    const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0';
    const clickRate = totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : '0';
    const deliveryRate = totalContacts > 0 ? ((totalSent / totalContacts) * 100).toFixed(1) : '0';

    return {
      totalSent,
      totalOpens,
      totalClicks,
      totalContacts,
      openRate,
      clickRate,
      deliveryRate,
    };
  }, [campaigns]);

  const chartData = useMemo(() => {
    return campaigns
      .filter(c => c.status === 'completed' || c.sent_count! > 0)
      .slice(0, 6)
      .map(c => ({
        name: c.name.length > 12 ? c.name.slice(0, 12) + '...' : c.name,
        sent: c.sent_count || 0,
        opens: c.open_count || 0,
        clicks: c.click_count || 0,
      }));
  }, [campaigns]);

  const pieData = useMemo(() => [
    { name: 'Opened', value: analytics.totalOpens, color: 'hsl(var(--success))' },
    { name: 'Clicked', value: analytics.totalClicks, color: 'hsl(var(--primary))' },
    { name: 'Not Opened', value: Math.max(0, analytics.totalSent - analytics.totalOpens), color: 'hsl(var(--muted))' },
  ].filter(d => d.value > 0), [analytics]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Campaign Analytics</h2>
        <p className="text-muted-foreground mt-1">Track your email campaign performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sent"
          value={analytics.totalSent}
          subtitle="Emails delivered"
          icon={Mail}
          color="primary"
        />
        <MetricCard
          title="Open Rate"
          value={`${analytics.openRate}%`}
          subtitle={`${analytics.totalOpens} opens`}
          icon={Eye}
          color="success"
        />
        <MetricCard
          title="Click Rate"
          value={`${analytics.clickRate}%`}
          subtitle={`${analytics.totalClicks} clicks`}
          icon={MousePointer}
          color="warning"
        />
        <MetricCard
          title="Delivery Rate"
          value={`${analytics.deliveryRate}%`}
          subtitle={`${analytics.totalContacts} contacts`}
          icon={Target}
          color="accent"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Campaign Performance</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="sent" fill="hsl(var(--primary))" name="Sent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opens" fill="hsl(var(--success))" name="Opens" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" fill="hsl(var(--warning))" name="Clicks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No campaign data yet. Launch a campaign to see analytics.
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Breakdown</h3>
          {pieData.length > 0 && analytics.totalSent > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Send emails to see engagement data.
            </div>
          )}
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Sent</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Opens</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Clicks</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Open Rate</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No campaigns yet. Create your first campaign to get started.
                  </td>
                </tr>
              ) : (
                campaigns.slice(0, 10).map((campaign) => {
                  const openRate = (campaign.sent_count || 0) > 0
                    ? (((campaign.open_count || 0) / (campaign.sent_count || 1)) * 100).toFixed(1)
                    : '0';
                  return (
                    <tr key={campaign.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-3 px-4 font-medium text-foreground">{campaign.name}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{campaign.sent_count || 0}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{campaign.open_count || 0}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{campaign.click_count || 0}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{openRate}%</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          campaign.status === 'completed' ? 'bg-success/10 text-success' :
                          campaign.status === 'running' ? 'bg-primary/10 text-primary' :
                          campaign.status === 'scheduled' ? 'bg-warning/10 text-warning' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: typeof TrendingUp;
  color: 'primary' | 'success' | 'warning' | 'accent';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent',
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}