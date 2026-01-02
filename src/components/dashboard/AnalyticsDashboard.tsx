import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Mail, MousePointer, Eye, Users, Target, ArrowUpRight, ArrowDownRight, FlaskConical } from 'lucide-react';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Campaign = Tables<'campaigns'>;

interface AnalyticsDashboardProps {
  campaigns: Campaign[];
}

export function AnalyticsDashboard({ campaigns }: AnalyticsDashboardProps) {
  // Aggregate metrics
  const analytics = useMemo(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.click_count || 0), 0);
    const totalContacts = campaigns.reduce((sum, c) => sum + (c.total_contacts || 0), 0);

    const openRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const clickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;
    const deliveryRate = totalContacts > 0 ? (totalSent / totalContacts) * 100 : 0;

    // Calculate trends (compare last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = campaigns.filter(c => {
      const created = new Date(c.created_at);
      return created >= subDays(now, 7);
    });
    const prev7Days = campaigns.filter(c => {
      const created = new Date(c.created_at);
      return created >= subDays(now, 14) && created < subDays(now, 7);
    });

    const last7OpenRate = last7Days.reduce((sum, c) => sum + (c.open_count || 0), 0) / 
      Math.max(last7Days.reduce((sum, c) => sum + (c.sent_count || 0), 0), 1) * 100;
    const prev7OpenRate = prev7Days.reduce((sum, c) => sum + (c.open_count || 0), 0) / 
      Math.max(prev7Days.reduce((sum, c) => sum + (c.sent_count || 0), 0), 1) * 100;
    
    const openRateTrend = last7OpenRate - prev7OpenRate;

    return {
      totalSent,
      totalOpens,
      totalClicks,
      totalContacts,
      openRate,
      clickRate,
      deliveryRate,
      openRateTrend,
    };
  }, [campaigns]);

  // Time series data for trends
  const trendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'MMM d'),
        dateKey: format(date, 'yyyy-MM-dd'),
        sent: 0,
        opens: 0,
        clicks: 0,
      };
    });

    campaigns.forEach(campaign => {
      const campaignDate = format(startOfDay(new Date(campaign.created_at)), 'yyyy-MM-dd');
      const dayData = last30Days.find(d => d.dateKey === campaignDate);
      if (dayData) {
        dayData.sent += campaign.sent_count || 0;
        dayData.opens += campaign.open_count || 0;
        dayData.clicks += campaign.click_count || 0;
      }
    });

    return last30Days;
  }, [campaigns]);

  // A/B testing data
  const abTestData = useMemo(() => {
    const abCampaigns = campaigns.filter(c => c.ab_testing_enabled);
    if (abCampaigns.length === 0) return null;

    const variantAOpens = abCampaigns.reduce((sum, c) => sum + (c.variant_a_opens || 0), 0);
    const variantBOpens = abCampaigns.reduce((sum, c) => sum + (c.variant_b_opens || 0), 0);
    const variantASent = abCampaigns.reduce((sum, c) => sum + (c.variant_a_sent || 0), 0);
    const variantBSent = abCampaigns.reduce((sum, c) => sum + (c.variant_b_sent || 0), 0);
    const variantAClicks = abCampaigns.reduce((sum, c) => sum + (c.variant_a_clicks || 0), 0);
    const variantBClicks = abCampaigns.reduce((sum, c) => sum + (c.variant_b_clicks || 0), 0);

    return [
      {
        name: 'Variant A',
        openRate: variantASent > 0 ? (variantAOpens / variantASent) * 100 : 0,
        clickRate: variantAOpens > 0 ? (variantAClicks / variantAOpens) * 100 : 0,
        sent: variantASent,
        color: 'hsl(var(--primary))',
      },
      {
        name: 'Variant B',
        openRate: variantBSent > 0 ? (variantBOpens / variantBSent) * 100 : 0,
        clickRate: variantBOpens > 0 ? (variantBClicks / variantBOpens) * 100 : 0,
        sent: variantBSent,
        color: 'hsl(var(--accent))',
      },
    ];
  }, [campaigns]);

  // Engagement breakdown
  const engagementData = useMemo(() => [
    { name: 'Opened', value: analytics.totalOpens, color: 'hsl(var(--success))' },
    { name: 'Clicked', value: analytics.totalClicks, color: 'hsl(var(--primary))' },
    { name: 'Not Opened', value: Math.max(0, analytics.totalSent - analytics.totalOpens), color: 'hsl(var(--muted))' },
  ].filter(d => d.value > 0), [analytics]);

  // Campaign performance comparison
  const campaignComparison = useMemo(() => {
    return campaigns
      .filter(c => c.status === 'completed' || (c.sent_count || 0) > 0)
      .slice(0, 8)
      .map(c => ({
        name: c.name.length > 10 ? c.name.slice(0, 10) + '...' : c.name,
        openRate: (c.sent_count || 0) > 0 ? ((c.open_count || 0) / (c.sent_count || 1)) * 100 : 0,
        clickRate: (c.open_count || 0) > 0 ? ((c.click_count || 0) / (c.open_count || 1)) * 100 : 0,
      }));
  }, [campaigns]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-1">Track email campaign performance and deliverability trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sent"
          value={analytics.totalSent.toLocaleString()}
          subtitle="Emails delivered"
          icon={Mail}
          color="primary"
        />
        <MetricCard
          title="Open Rate"
          value={`${analytics.openRate.toFixed(1)}%`}
          subtitle={`${analytics.totalOpens.toLocaleString()} opens`}
          icon={Eye}
          color="success"
          trend={analytics.openRateTrend}
        />
        <MetricCard
          title="Click Rate"
          value={`${analytics.clickRate.toFixed(1)}%`}
          subtitle={`${analytics.totalClicks.toLocaleString()} clicks`}
          icon={MousePointer}
          color="warning"
        />
        <MetricCard
          title="Delivery Rate"
          value={`${analytics.deliveryRate.toFixed(1)}%`}
          subtitle={`${analytics.totalContacts.toLocaleString()} contacts`}
          icon={Target}
          color="accent"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Rate Trend */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Open & Click Trends (30 days)</h3>
          {trendData.some(d => d.sent > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="opens" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorOpens)" name="Opens" />
                <Area type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorClicks)" name="Clicks" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No trend data yet. Launch campaigns to see trends.
            </div>
          )}
        </div>

        {/* Engagement Breakdown */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Breakdown</h3>
          {engagementData.length > 0 && analytics.totalSent > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
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
              <div className="flex justify-center gap-6 mt-2">
                {engagementData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Send emails to see engagement data.
            </div>
          )}
        </div>
      </div>

      {/* Campaign Comparison & A/B Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance Comparison */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Campaign Performance</h3>
          {campaignComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={campaignComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="openRate" fill="hsl(var(--success))" name="Open Rate" radius={[0, 4, 4, 0]} />
                <Bar dataKey="clickRate" fill="hsl(var(--primary))" name="Click Rate" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No campaign data yet.
            </div>
          )}
        </div>

        {/* A/B Testing Results */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">A/B Testing Results</h3>
          </div>
          {abTestData ? (
            <div className="space-y-4">
              {abTestData.map((variant, idx) => (
                <div key={variant.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: `${variant.color}20`, color: variant.color }}
                      >
                        {idx === 0 ? 'A' : 'B'}
                      </span>
                      <span className="font-medium text-foreground">{variant.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{variant.sent} sent</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-8">
                    <div>
                      <p className="text-xs text-muted-foreground">Open Rate</p>
                      <p className="text-lg font-semibold text-foreground">{variant.openRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Click Rate</p>
                      <p className="text-lg font-semibold text-foreground">{variant.clickRate.toFixed(1)}%</p>
                    </div>
                  </div>
                  {idx === 0 && <div className="border-b border-border my-2" />}
                </div>
              ))}
              
              {/* Winner indicator */}
              {abTestData[0].openRate !== abTestData[1].openRate && (
                <div className="bg-success/10 rounded-lg p-3 mt-4">
                  <p className="text-sm text-success font-medium">
                    🏆 {abTestData[0].openRate > abTestData[1].openRate ? 'Variant A' : 'Variant B'} is winning 
                    with a {Math.abs(abTestData[0].openRate - abTestData[1].openRate).toFixed(1)}% higher open rate
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No A/B tests yet</p>
                <p className="text-sm">Enable A/B testing in campaign builder</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Campaigns Table */}
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
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">A/B Test</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
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
                        {campaign.ab_testing_enabled ? (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <FlaskConical className="w-3 h-3" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
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
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof TrendingUp;
  color: 'primary' | 'success' | 'warning' | 'accent';
  trend?: number;
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
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={`flex items-center text-sm ${trend > 0 ? 'text-success' : 'text-destructive'}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
