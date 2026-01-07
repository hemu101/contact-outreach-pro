import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Mail, MessageCircle, TrendingUp, Eye, MousePointer, Users, 
  Send, Inbox, Clock, Activity, Globe 
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePageTracking } from '@/hooks/usePageTracking';
import { SendTimeHeatmap } from './SendTimeHeatmap';
import type { Tables } from '@/integrations/supabase/types';

type Campaign = Tables<'campaigns'>;

interface UnifiedAnalyticsProps {
  campaigns: Campaign[];
}

export function UnifiedAnalytics({ campaigns }: UnifiedAnalyticsProps) {
  usePageTracking('unified-analytics');
  const { user } = useAuth();

  // Fetch DM campaigns
  const { data: dmCampaigns = [] } = useQuery({
    queryKey: ['dm-campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('dm_campaigns')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch creators for DM stats
  const { data: creators = [] } = useQuery({
    queryKey: ['creators-count', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('creators')
        .select('id, platform')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch inbox stats
  const { data: inboxStats } = useQuery({
    queryKey: ['inbox-stats', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, unread: 0, replies: 0 };
      const { data, error } = await supabase
        .from('email_inbox')
        .select('id, is_read, campaign_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return {
        total: data.length,
        unread: data.filter(e => !e.is_read).length,
        replies: data.filter(e => e.campaign_id).length,
      };
    },
    enabled: !!user,
  });

  // Fetch page view analytics
  const { data: pageViews = [] } = useQuery({
    queryKey: ['page-views', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('page_views')
        .select('page_name, created_at')
        .eq('user_id', user.id)
        .gte('created_at', subDays(new Date(), 30).toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate email metrics
  const emailMetrics = useMemo(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.click_count || 0), 0);
    return {
      totalSent,
      totalOpens,
      totalClicks,
      openRate: totalSent > 0 ? (totalOpens / totalSent) * 100 : 0,
      clickRate: totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0,
    };
  }, [campaigns]);

  // Calculate DM metrics
  const dmMetrics = useMemo(() => {
    const totalSent = dmCampaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    const totalReplies = dmCampaigns.reduce((sum, c) => sum + (c.reply_count || 0), 0);
    return {
      totalCreators: creators.length,
      totalSent,
      totalReplies,
      replyRate: totalSent > 0 ? (totalReplies / totalSent) * 100 : 0,
      instagramCount: creators.filter(c => c.platform === 'instagram').length,
      tiktokCount: creators.filter(c => c.platform === 'tiktok').length,
    };
  }, [dmCampaigns, creators]);

  // Time series for all activities
  const activityTrend = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return {
        date: format(date, 'MMM d'),
        dateKey: format(date, 'yyyy-MM-dd'),
        emails: 0,
        opens: 0,
        dms: 0,
        pageViews: 0,
      };
    });

    campaigns.forEach(campaign => {
      const campaignDate = format(startOfDay(new Date(campaign.created_at)), 'yyyy-MM-dd');
      const dayData = last14Days.find(d => d.dateKey === campaignDate);
      if (dayData) {
        dayData.emails += campaign.sent_count || 0;
        dayData.opens += campaign.open_count || 0;
      }
    });

    dmCampaigns.forEach(campaign => {
      const campaignDate = format(startOfDay(new Date(campaign.created_at)), 'yyyy-MM-dd');
      const dayData = last14Days.find(d => d.dateKey === campaignDate);
      if (dayData) {
        dayData.dms += campaign.sent_count || 0;
      }
    });

    pageViews.forEach(view => {
      const viewDate = format(startOfDay(new Date(view.created_at)), 'yyyy-MM-dd');
      const dayData = last14Days.find(d => d.dateKey === viewDate);
      if (dayData) {
        dayData.pageViews += 1;
      }
    });

    return last14Days;
  }, [campaigns, dmCampaigns, pageViews]);

  // Channel breakdown for pie chart
  const channelBreakdown = useMemo(() => [
    { name: 'Email', value: emailMetrics.totalSent, color: 'hsl(var(--primary))' },
    { name: 'Instagram DM', value: dmMetrics.instagramCount, color: 'hsl(345 80% 60%)' },
    { name: 'TikTok DM', value: dmMetrics.tiktokCount, color: 'hsl(180 70% 50%)' },
  ].filter(d => d.value > 0), [emailMetrics, dmMetrics]);

  // Page usage breakdown
  const pageUsage = useMemo(() => {
    const counts: Record<string, number> = {};
    pageViews.forEach(view => {
      counts[view.page_name] = (counts[view.page_name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [pageViews]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Unified Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Complete view of email, DM, and platform performance
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard icon={Send} label="Emails Sent" value={emailMetrics.totalSent} color="primary" />
        <MetricCard icon={Eye} label="Opens" value={emailMetrics.totalOpens} color="success" />
        <MetricCard icon={MousePointer} label="Clicks" value={emailMetrics.totalClicks} color="warning" />
        <MetricCard icon={MessageCircle} label="DMs Sent" value={dmMetrics.totalSent} color="accent" />
        <MetricCard icon={Inbox} label="Inbox Replies" value={inboxStats?.replies || 0} color="info" />
        <MetricCard icon={Users} label="Creators" value={dmMetrics.totalCreators} color="secondary" />
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RateCard 
          title="Email Open Rate" 
          rate={emailMetrics.openRate} 
          benchmark={25} 
          icon={Mail}
        />
        <RateCard 
          title="Click-Through Rate" 
          rate={emailMetrics.clickRate} 
          benchmark={3} 
          icon={MousePointer}
        />
        <RateCard 
          title="DM Reply Rate" 
          rate={dmMetrics.replyRate} 
          benchmark={10} 
          icon={MessageCircle}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Activity Trend (14 days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityTrend}>
              <defs>
                <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOpensUnified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
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
              <Area type="monotone" dataKey="emails" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEmails)" name="Emails" />
              <Area type="monotone" dataKey="opens" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorOpensUnified)" name="Opens" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Distribution */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Channel Distribution
          </h3>
          {channelBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={channelBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {channelBreakdown.map((entry, index) => (
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
                {channelBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No channel data yet
            </div>
          )}
        </div>
      </div>

      {/* Send Time Heatmap */}
      <SendTimeHeatmap />

      {/* Page Usage */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Feature Usage (Last 30 days)
        </h3>
        {pageUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pageUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Views" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Navigate through the app to see usage data
          </div>
        )}
      </div>

      {/* Campaign Summary Table */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Campaign Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Sent</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Engagement</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 5).map((campaign) => (
                <tr key={campaign.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="py-3 px-4 font-medium text-foreground">{campaign.name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      <Mail className="w-3 h-3" /> Email
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{campaign.sent_count || 0}</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{campaign.open_count || 0} opens</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {((campaign.open_count || 0) / Math.max(campaign.sent_count || 1, 1) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={campaign.status || 'draft'} />
                  </td>
                </tr>
              ))}
              {dmCampaigns.slice(0, 3).map((campaign) => (
                <tr key={campaign.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="py-3 px-4 font-medium text-foreground">{campaign.name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-pink-500/10 text-pink-500">
                      <MessageCircle className="w-3 h-3" /> {campaign.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{campaign.sent_count || 0}</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{campaign.reply_count || 0} replies</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {((campaign.reply_count || 0) / Math.max(campaign.sent_count || 1, 1) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={campaign.status || 'draft'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}/10`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function RateCard({ title, rate, benchmark, icon: Icon }: {
  title: string;
  rate: number;
  benchmark: number;
  icon: React.ElementType;
}) {
  const isAboveBenchmark = rate >= benchmark;
  
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <TrendingUp className={`w-4 h-4 ${isAboveBenchmark ? 'text-success' : 'text-warning'}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{rate.toFixed(1)}%</span>
        <span className={`text-sm ${isAboveBenchmark ? 'text-success' : 'text-warning'}`}>
          {isAboveBenchmark ? '↑' : '↓'} vs {benchmark}% benchmark
        </span>
      </div>
      <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${isAboveBenchmark ? 'bg-success' : 'bg-warning'}`}
          style={{ width: `${Math.min(rate / benchmark * 50, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    scheduled: 'bg-warning/10 text-warning',
    running: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
    failed: 'bg-destructive/10 text-destructive',
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
      {status}
    </span>
  );
}
