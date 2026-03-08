import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  FunnelChart, Funnel, LabelList, ScatterChart, Scatter, ZAxis,
  ComposedChart
} from 'recharts';
import { 
  Mail, MessageCircle, TrendingUp, Eye, MousePointer, Users, 
  Send, Inbox, Clock, Activity, Globe, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePageTracking } from '@/hooks/usePageTracking';
import { SendTimeHeatmap } from './SendTimeHeatmap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

type Campaign = Tables<'campaigns'>;

interface UnifiedAnalyticsProps {
  campaigns: Campaign[];
}

const CHART_COLORS = [
  'hsl(var(--primary))', 'hsl(345 80% 60%)', 'hsl(180 70% 50%)', 
  'hsl(45 90% 55%)', 'hsl(280 60% 55%)', 'hsl(140 60% 45%)',
  'hsl(30 80% 55%)', 'hsl(210 80% 55%)'
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

export function UnifiedAnalytics({ campaigns }: UnifiedAnalyticsProps) {
  usePageTracking('unified-analytics');
  const { user } = useAuth();

  const { data: dmCampaigns = [] } = useQuery({
    queryKey: ['dm-campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('dm_campaigns').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: creators = [] } = useQuery({
    queryKey: ['creators-count', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('creators').select('id, platform').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: inboxStats } = useQuery({
    queryKey: ['inbox-stats', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, unread: 0, replies: 0 };
      const { data, error } = await supabase.from('email_inbox').select('id, is_read, campaign_id').eq('user_id', user.id);
      if (error) throw error;
      return { total: data.length, unread: data.filter(e => !e.is_read).length, replies: data.filter(e => e.campaign_id).length };
    },
    enabled: !!user,
  });

  const { data: pageViews = [] } = useQuery({
    queryKey: ['page-views', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('page_views').select('page_name, created_at').eq('user_id', user.id).gte('created_at', subDays(new Date(), 30).toISOString()).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: companyContacts = [] } = useQuery({
    queryKey: ['analytics-contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('company_contacts').select('lead_score, seniority, mql, sql_status, city, country, pipeline_stage').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const emailMetrics = useMemo(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.click_count || 0), 0);
    return { totalSent, totalOpens, totalClicks, openRate: totalSent > 0 ? (totalOpens / totalSent) * 100 : 0, clickRate: totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0 };
  }, [campaigns]);

  const dmMetrics = useMemo(() => {
    const totalSent = dmCampaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    const totalReplies = dmCampaigns.reduce((sum, c) => sum + (c.reply_count || 0), 0);
    return { totalCreators: creators.length, totalSent, totalReplies, replyRate: totalSent > 0 ? (totalReplies / totalSent) * 100 : 0, instagramCount: creators.filter(c => c.platform === 'instagram').length, tiktokCount: creators.filter(c => c.platform === 'tiktok').length };
  }, [dmCampaigns, creators]);

  const activityTrend = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return { date: format(date, 'MMM d'), dateKey: format(date, 'yyyy-MM-dd'), emails: 0, opens: 0, clicks: 0, dms: 0, pageViews: 0 };
    });
    campaigns.forEach(campaign => {
      const dayData = last14Days.find(d => d.dateKey === format(startOfDay(new Date(campaign.created_at)), 'yyyy-MM-dd'));
      if (dayData) { dayData.emails += campaign.sent_count || 0; dayData.opens += campaign.open_count || 0; dayData.clicks += campaign.click_count || 0; }
    });
    dmCampaigns.forEach(campaign => {
      const dayData = last14Days.find(d => d.dateKey === format(startOfDay(new Date(campaign.created_at)), 'yyyy-MM-dd'));
      if (dayData) dayData.dms += campaign.sent_count || 0;
    });
    pageViews.forEach(view => {
      const dayData = last14Days.find(d => d.dateKey === format(startOfDay(new Date(view.created_at)), 'yyyy-MM-dd'));
      if (dayData) dayData.pageViews += 1;
    });
    return last14Days;
  }, [campaigns, dmCampaigns, pageViews]);

  const channelBreakdown = useMemo(() => [
    { name: 'Email', value: emailMetrics.totalSent, color: CHART_COLORS[0] },
    { name: 'Instagram DM', value: dmMetrics.instagramCount, color: CHART_COLORS[1] },
    { name: 'TikTok DM', value: dmMetrics.tiktokCount, color: CHART_COLORS[2] },
  ].filter(d => d.value > 0), [emailMetrics, dmMetrics]);

  const pageUsage = useMemo(() => {
    const counts: Record<string, number> = {};
    pageViews.forEach(view => { counts[view.page_name] = (counts[view.page_name] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [pageViews]);

  // Lead score distribution for charts
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: '90-100', min: 90, max: 100, count: 0 },
      { range: '70-89', min: 70, max: 89, count: 0 },
      { range: '50-69', min: 50, max: 69, count: 0 },
      { range: '30-49', min: 30, max: 49, count: 0 },
      { range: '1-29', min: 1, max: 29, count: 0 },
      { range: 'Unscored', min: 0, max: 0, count: 0 },
    ];
    companyContacts.forEach(c => {
      const s = c.lead_score ?? 0;
      if (s === 0) buckets[5].count++;
      else if (s >= 90) buckets[0].count++;
      else if (s >= 70) buckets[1].count++;
      else if (s >= 50) buckets[2].count++;
      else if (s >= 30) buckets[3].count++;
      else buckets[4].count++;
    });
    return buckets;
  }, [companyContacts]);

  // Seniority breakdown
  const seniorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    companyContacts.forEach(c => { if (c.seniority) counts[c.seniority] = (counts[c.seniority] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [companyContacts]);

  // Country breakdown
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    companyContacts.forEach(c => { if (c.country) counts[c.country] = (counts[c.country] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [companyContacts]);

  // Pipeline funnel
  const pipelineFunnel = useMemo(() => {
    const counts: Record<string, number> = {};
    companyContacts.forEach(c => { const stage = c.pipeline_stage || 'Unassigned'; counts[stage] = (counts[stage] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: CHART_COLORS[Object.keys(counts).indexOf(name) % CHART_COLORS.length] })).sort((a, b) => b.value - a.value);
  }, [companyContacts]);

  // Radar data for engagement channels
  const radarData = useMemo(() => [
    { subject: 'Email Sent', A: emailMetrics.totalSent, fullMark: Math.max(emailMetrics.totalSent, 100) },
    { subject: 'Opens', A: emailMetrics.totalOpens, fullMark: Math.max(emailMetrics.totalSent, 100) },
    { subject: 'Clicks', A: emailMetrics.totalClicks, fullMark: Math.max(emailMetrics.totalSent, 100) },
    { subject: 'DMs Sent', A: dmMetrics.totalSent, fullMark: Math.max(emailMetrics.totalSent, 100) },
    { subject: 'Replies', A: dmMetrics.totalReplies, fullMark: Math.max(emailMetrics.totalSent, 100) },
    { subject: 'Inbox', A: inboxStats?.total || 0, fullMark: Math.max(emailMetrics.totalSent, 100) },
  ], [emailMetrics, dmMetrics, inboxStats]);

  // MQL/SQL funnel
  const mqlSqlFunnel = useMemo(() => {
    const total = companyContacts.length;
    const mql = companyContacts.filter(c => c.mql).length;
    const sql = companyContacts.filter(c => c.sql_status).length;
    return [
      { name: 'Total Contacts', value: total, fill: CHART_COLORS[0] },
      { name: 'MQL', value: mql, fill: CHART_COLORS[3] },
      { name: 'SQL', value: sql, fill: CHART_COLORS[5] },
    ];
  }, [companyContacts]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Unified Analytics</h2>
        <p className="text-muted-foreground mt-1">Complete view across all channels, contacts, and pipeline</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard icon={Send} label="Emails Sent" value={emailMetrics.totalSent} />
        <MetricCard icon={Eye} label="Opens" value={emailMetrics.totalOpens} />
        <MetricCard icon={MousePointer} label="Clicks" value={emailMetrics.totalClicks} />
        <MetricCard icon={MessageCircle} label="DMs Sent" value={dmMetrics.totalSent} />
        <MetricCard icon={Inbox} label="Inbox Replies" value={inboxStats?.replies || 0} />
        <MetricCard icon={Users} label="Contacts" value={companyContacts.length} />
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RateCard title="Email Open Rate" rate={emailMetrics.openRate} benchmark={25} icon={Mail} />
        <RateCard title="Click-Through Rate" rate={emailMetrics.clickRate} benchmark={3} icon={MousePointer} />
        <RateCard title="DM Reply Rate" rate={dmMetrics.replyRate} benchmark={10} icon={MessageCircle} />
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends"><Activity className="w-4 h-4 mr-1" />Trends</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="w-4 h-4 mr-1" />Contacts</TabsTrigger>
          <TabsTrigger value="channels"><Globe className="w-4 h-4 mr-1" />Channels</TabsTrigger>
          <TabsTrigger value="pipeline"><BarChart3 className="w-4 h-4 mr-1" />Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Trend - Area */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Activity Trend (14 days)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={activityTrend}>
                    <defs>
                      <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="emails" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEmails)" name="Emails" />
                    <Area type="monotone" dataKey="opens" stroke="hsl(140 60% 45%)" fill="hsl(140 60% 45%)" fillOpacity={0.1} name="Opens" />
                    <Area type="monotone" dataKey="clicks" stroke="hsl(45 90% 55%)" fill="hsl(45 90% 55%)" fillOpacity={0.1} name="Clicks" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Composed Chart - Line + Bar */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Emails vs DMs vs Page Views</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={activityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="emails" fill="hsl(var(--primary))" name="Emails" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="dms" fill="hsl(345 80% 60%)" name="DMs" radius={[2, 2, 0, 0]} />
                    <Line type="monotone" dataKey="pageViews" stroke="hsl(45 90% 55%)" name="Page Views" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <SendTimeHeatmap />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Score Distribution - Bar */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Lead Score Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Contacts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seniority Breakdown - Pie */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Seniority Breakdown</CardTitle></CardHeader>
              <CardContent>
                {seniorityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={seniorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {seniorityData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground">No seniority data</div>}
              </CardContent>
            </Card>

            {/* Country Distribution - Horizontal Bar */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Contacts by Country</CardTitle></CardHeader>
              <CardContent>
                {countryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={countryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={80} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Contacts" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground">No country data</div>}
              </CardContent>
            </Card>

            {/* MQL → SQL Funnel */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">MQL → SQL Funnel</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mqlSqlFunnel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                      {mqlSqlFunnel.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Distribution - Pie */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Channel Distribution</CardTitle></CardHeader>
              <CardContent>
                {channelBreakdown.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={channelBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                          {channelBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                      {channelBreakdown.map(item => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground">No channel data</div>}
              </CardContent>
            </Card>

            {/* Engagement Radar */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Engagement Radar</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <PolarRadiusAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar name="Activity" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Feature Usage (30 days)</CardTitle></CardHeader>
            <CardContent>
              {pageUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pageUsage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={120} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[200px] flex items-center justify-center text-muted-foreground">Navigate through the app to see usage data</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Stages */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pipeline Stage Distribution</CardTitle></CardHeader>
              <CardContent>
                {pipelineFunnel.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pipelineFunnel} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pipelineFunnel.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground">No pipeline data</div>}
              </CardContent>
            </Card>

            {/* Campaign Performance Line */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Campaign Performance Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={activityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="emails" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Emails" />
                    <Line type="monotone" dataKey="opens" stroke="hsl(140 60% 45%)" strokeWidth={2} dot={false} name="Opens" />
                    <Line type="monotone" dataKey="clicks" stroke="hsl(45 90% 55%)" strokeWidth={2} dot={false} name="Clicks" />
                    <Line type="monotone" dataKey="dms" stroke="hsl(345 80% 60%)" strokeWidth={2} dot={false} name="DMs" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Summary Table */}
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Campaign Performance</CardTitle></CardHeader>
        <CardContent className="p-0">
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
                {campaigns.slice(0, 5).map(campaign => (
                  <tr key={campaign.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-3 px-4 font-medium text-foreground">{campaign.name}</td>
                    <td className="py-3 px-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"><Mail className="w-3 h-3" /> Email</span></td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{campaign.sent_count || 0}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{campaign.open_count || 0} opens</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{((campaign.open_count || 0) / Math.max(campaign.sent_count || 1, 1) * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right"><StatusBadge status={campaign.status || 'draft'} /></td>
                  </tr>
                ))}
                {dmCampaigns.slice(0, 3).map(campaign => (
                  <tr key={campaign.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-3 px-4 font-medium text-foreground">{campaign.name}</td>
                    <td className="py-3 px-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-pink-500/10 text-pink-500"><MessageCircle className="w-3 h-3" /> {campaign.platform}</span></td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{campaign.sent_count || 0}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{campaign.reply_count || 0} replies</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{((campaign.reply_count || 0) / Math.max(campaign.sent_count || 1, 1) * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right"><StatusBadge status={campaign.status || 'draft'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Icon className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RateCard({ title, rate, benchmark, icon: Icon }: { title: string; rate: number; benchmark: number; icon: React.ElementType }) {
  const isAboveBenchmark = rate >= benchmark;
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Icon className="w-5 h-5 text-primary" /><span className="font-medium text-foreground">{title}</span></div>
          <TrendingUp className={`w-4 h-4 ${isAboveBenchmark ? 'text-green-500' : 'text-yellow-500'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{rate.toFixed(1)}%</span>
          <span className={`text-sm ${isAboveBenchmark ? 'text-green-500' : 'text-yellow-500'}`}>
            {isAboveBenchmark ? '↑' : '↓'} vs {benchmark}% benchmark
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = { completed: 'bg-green-500/10 text-green-500', running: 'bg-blue-500/10 text-blue-500', scheduled: 'bg-yellow-500/10 text-yellow-500', draft: 'bg-muted text-muted-foreground' };
  return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${variants[status] || variants.draft}`}>{status}</span>;
}
