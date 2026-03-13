import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, isToday, differenceInMinutes } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Globe, Users, Eye, MousePointer, Clock, TrendingUp, Monitor,
  Smartphone, Tablet, ArrowUpRight, MapPin, Activity, Zap,
  BarChart3, Layers, FileText, Search, RefreshCw, ExternalLink
} from 'lucide-react';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export function AdvancedAnalytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('realtime');

  const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 1;
  const startDate = subDays(new Date(), daysBack).toISOString();

  // Sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['analytics-sessions', user?.id, dateRange],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Events
  const { data: events = [] } = useQuery({
    queryKey: ['analytics-events', user?.id, dateRange],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('visitor_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Page analytics
  const { data: pageAnalytics = [] } = useQuery({
    queryKey: ['analytics-pages', user?.id, dateRange],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('page_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', subDays(new Date(), daysBack).toISOString().split('T')[0])
        .order('unique_visitors', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Social visitors
  const { data: socialVisitors = [] } = useQuery({
    queryKey: ['analytics-social', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('social_visitors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Computed metrics
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalPageViews = sessions.reduce((sum, s) => sum + (s.total_page_views || 0), 0);
    const identifiedVisitors = sessions.filter(s => s.is_identified).length;
    const avgEngagement = totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / totalSessions) : 0;
    const avgDuration = totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions) : 0;
    const totalClicks = sessions.reduce((sum, s) => sum + (s.total_clicks || 0), 0);
    const realtimeVisitors = sessions.filter(s => {
      if (!s.last_seen_at) return false;
      return differenceInMinutes(new Date(), new Date(s.last_seen_at)) < 5;
    }).length;

    // Device breakdown
    const devices: Record<string, number> = {};
    sessions.forEach(s => {
      const d = s.device_type || 'unknown';
      devices[d] = (devices[d] || 0) + 1;
    });

    // Browser breakdown
    const browsers: Record<string, number> = {};
    sessions.forEach(s => {
      const b = s.browser || 'unknown';
      browsers[b] = (browsers[b] || 0) + 1;
    });

    // Traffic sources
    const sources: Record<string, number> = {};
    sessions.forEach(s => {
      const src = s.utm_source || s.social_source || (s.referrer ? 'referral' : 'direct');
      sources[src] = (sources[src] || 0) + 1;
    });

    // Daily trend
    const dailyMap: Record<string, { views: number; visitors: number; clicks: number }> = {};
    sessions.forEach(s => {
      const day = s.created_at.split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { views: 0, visitors: 0, clicks: 0 };
      dailyMap[day].views += s.total_page_views || 0;
      dailyMap[day].visitors += 1;
      dailyMap[day].clicks += s.total_clicks || 0;
    });
    const dailyTrend = Object.entries(dailyMap).sort().map(([date, d]) => ({
      date: format(new Date(date), 'MMM dd'),
      ...d,
    }));

    // Event types
    const eventTypes: Record<string, number> = {};
    events.forEach(e => {
      eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1;
    });

    // Landing pages from page_analytics
    const landingPages = pageAnalytics.slice(0, 20);

    return {
      totalSessions, totalPageViews, identifiedVisitors, avgEngagement, avgDuration,
      totalClicks, realtimeVisitors, devices, browsers, sources, dailyTrend,
      eventTypes, landingPages,
    };
  }, [sessions, events, pageAnalytics]);

  const deviceData = Object.entries(metrics.devices).map(([name, value]) => ({ name, value }));
  const browserData = Object.entries(metrics.browsers).map(([name, value]) => ({ name, value }));
  const sourceData = Object.entries(metrics.sources).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const eventData = Object.entries(metrics.eventTypes).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const socialByPlatform = useMemo(() => {
    const map: Record<string, number> = {};
    socialVisitors.forEach(sv => {
      map[sv.platform || 'unknown'] = (map[sv.platform || 'unknown'] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [socialVisitors]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === 'mobile') return <Smartphone className="h-4 w-4" />;
    if (type === 'tablet') return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground">Google Analytics-level insights for your website & social traffic</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Realtime Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="h-5 w-5 text-primary" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-2xl font-bold text-foreground">{metrics.realtimeVisitors}</span>
            <span className="text-muted-foreground">users active in the last 5 minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Sessions', value: metrics.totalSessions, icon: Users },
          { label: 'Page Views', value: metrics.totalPageViews, icon: Eye },
          { label: 'Total Clicks', value: metrics.totalClicks, icon: MousePointer },
          { label: 'Identified', value: metrics.identifiedVisitors, icon: Zap },
          { label: 'Avg Duration', value: formatDuration(metrics.avgDuration), icon: Clock },
          { label: 'Engagement', value: `${metrics.avgEngagement}%`, icon: TrendingUp },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <kpi.icon className="h-4 w-4" />
                <span className="text-xs">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="realtime">Realtime</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="pages">Pages & Screens</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
        </TabsList>

        {/* Realtime */}
        <TabsContent value="realtime" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Visitors Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Devices</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {deviceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Users Table */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Active Visitors</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.slice(0, 20).map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {s.is_identified ? (
                              <Badge variant="outline" className="text-xs text-primary">{s.email || 'Identified'}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">{s.visitor_id?.slice(0, 12)}...</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell><DeviceIcon type={s.device_type || ''} /></TableCell>
                        <TableCell className="text-xs">{s.utm_source || s.social_source || 'Direct'}</TableCell>
                        <TableCell>{s.total_page_views || 0}</TableCell>
                        <TableCell className="text-xs">{formatDuration(s.duration_seconds || 0)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={s.engagement_score || 0} className="w-16 h-1.5" />
                            <span className="text-xs">{s.engagement_score || 0}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Acquisition */}
        <TabsContent value="acquisition" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">User Acquisition by Source</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Browsers</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={browserData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                      {browserData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Acquisition Table */}
          <Card>
            <CardHeader><CardTitle className="text-base">Traffic Channels Breakdown</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>% of Total</TableHead>
                    <TableHead>Identified Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceData.map(s => {
                    const channelSessions = sessions.filter(se => (se.utm_source || se.social_source || 'direct') === s.name);
                    const identifiedRate = channelSessions.length > 0 
                      ? Math.round(channelSessions.filter(se => se.is_identified).length / channelSessions.length * 100) 
                      : 0;
                    return (
                      <TableRow key={s.name}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.value}</TableCell>
                        <TableCell>{metrics.totalSessions > 0 ? ((s.value / metrics.totalSessions) * 100).toFixed(1) : 0}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={identifiedRate} className="w-16 h-1.5" />
                            <span className="text-xs">{identifiedRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement */}
        <TabsContent value="engagement" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Engagement Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Engagement Score Distribution</CardTitle></CardHeader>
              <CardContent>
                {(() => {
                  const buckets = [
                    { label: '0-20 (Low)', min: 0, max: 20 },
                    { label: '21-40', min: 21, max: 40 },
                    { label: '41-60 (Medium)', min: 41, max: 60 },
                    { label: '61-80', min: 61, max: 80 },
                    { label: '81-100 (High)', min: 81, max: 100 },
                  ];
                  const data = buckets.map(b => ({
                    name: b.label,
                    count: sessions.filter(s => (s.engagement_score || 0) >= b.min && (s.engagement_score || 0) <= b.max).length,
                  }));
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                        <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Events by Type</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={eventData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventData.map(e => (
                        <TableRow key={e.name}>
                          <TableCell className="font-medium">{e.name}</TableCell>
                          <TableCell>{e.value}</TableCell>
                          <TableCell>{events.length > 0 ? ((e.value / events.length) * 100).toFixed(1) : 0}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Events</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.slice(0, 50).map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs">{format(new Date(e.created_at), 'HH:mm:ss')}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{e.event_type}</Badge></TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{e.page_title || e.page_url}</TableCell>
                        <TableCell className="text-xs">{e.device_type || '-'}</TableCell>
                        <TableCell className="text-xs">{e.utm_source || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages & Screens */}
        <TabsContent value="pages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pages & Landing Pages</CardTitle>
              <CardDescription>Aggregated page-level analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page URL</TableHead>
                      <TableHead>Visitors</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Avg Duration</TableHead>
                      <TableHead>Avg Scroll</TableHead>
                      <TableHead>Bounce Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.landingPages.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="max-w-[250px] truncate font-medium">{p.page_url}</TableCell>
                        <TableCell>{p.unique_visitors || 0}</TableCell>
                        <TableCell>{p.total_views || 0}</TableCell>
                        <TableCell>{formatDuration(p.avg_time_on_page || 0)}</TableCell>
                        <TableCell>{p.avg_scroll_depth || 0}%</TableCell>
                        <TableCell>{p.bounce_rate || 0}%</TableCell>
                      </TableRow>
                    ))}
                    {metrics.landingPages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No page analytics data yet. Install the tracking script to start collecting.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources */}
        <TabsContent value="traffic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Traffic Source Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {sourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">UTM Campaign Performance</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Medium</TableHead>
                        <TableHead>Sessions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const campaigns: Record<string, { medium: string; count: number }> = {};
                        sessions.forEach(s => {
                          if (s.utm_campaign) {
                            const key = s.utm_campaign;
                            if (!campaigns[key]) campaigns[key] = { medium: s.utm_medium || '-', count: 0 };
                            campaigns[key].count++;
                          }
                        });
                        return Object.entries(campaigns).sort((a, b) => b[1].count - a[1].count).map(([name, data]) => (
                          <TableRow key={name}>
                            <TableCell className="font-medium">{name}</TableCell>
                            <TableCell>{data.medium}</TableCell>
                            <TableCell>{data.count}</TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Social Media Visitors</CardTitle></CardHeader>
              <CardContent>
                {socialByPlatform.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={socialByPlatform}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                      <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No social media visitors tracked yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Recent Social Visitors</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Last Interaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {socialVisitors.slice(0, 20).map((sv: any) => (
                        <TableRow key={sv.id}>
                          <TableCell><Badge variant="outline">{sv.platform}</Badge></TableCell>
                          <TableCell className="text-xs">{sv.source || '-'}</TableCell>
                          <TableCell className="text-xs">{sv.last_interaction_at ? format(new Date(sv.last_interaction_at), 'PPp') : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Visitors */}
        <TabsContent value="visitors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Visitor Sessions</CardTitle>
              <CardDescription>Detailed session records with engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Scroll</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Landing Page</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>First Seen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-mono">{s.email || s.visitor_id?.slice(0, 10)}</TableCell>
                        <TableCell>
                          {s.is_identified 
                            ? <Badge className="text-xs bg-primary/20 text-primary border-0">Identified</Badge>
                            : <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-xs">{s.device_type || '-'}</TableCell>
                        <TableCell className="text-xs">{s.browser || '-'}</TableCell>
                        <TableCell className="text-xs">{s.os || '-'}</TableCell>
                        <TableCell>{s.total_page_views || 0}</TableCell>
                        <TableCell>{s.total_clicks || 0}</TableCell>
                        <TableCell className="text-xs">{formatDuration(s.duration_seconds || 0)}</TableCell>
                        <TableCell>{s.avg_scroll_depth || 0}%</TableCell>
                        <TableCell>
                          <Progress value={s.engagement_score || 0} className="w-12 h-1.5" />
                        </TableCell>
                        <TableCell className="text-xs max-w-[150px] truncate">{s.landing_page || '-'}</TableCell>
                        <TableCell className="text-xs">{s.utm_source || s.social_source || 'direct'}</TableCell>
                        <TableCell className="text-xs">{format(new Date(s.created_at), 'MMM dd HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
