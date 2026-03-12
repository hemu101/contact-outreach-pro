import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Code, Copy, CheckCircle, Globe, Eye, MousePointer, BarChart3, MessageCircle, Phone, Video, TrendingUp, Users, Clock, Monitor, Smartphone, Tablet, ArrowUpRight, MapPin, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export function TrackingScriptPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'syqawvakxxfaohcgrenn';

  const trackingScript = `<!-- OutreachFlow Advanced Tracking Script v2 -->
<script>
(function() {
  var OF_ACCOUNT = "${user?.id || 'YOUR_ACCOUNT_ID'}";
  var OF_ENDPOINT = "https://${projectId}.supabase.co/functions/v1/track-website-visitor";
  
  var vid = localStorage.getItem('of_vid');
  if (!vid) { vid = 'v_' + Math.random().toString(36).substr(2,9) + Date.now(); localStorage.setItem('of_vid', vid); }
  
  // Device detection
  var ua = navigator.userAgent;
  var device = /Mobile|Android/.test(ua) ? 'mobile' : /Tablet|iPad/.test(ua) ? 'tablet' : 'desktop';
  var browser = /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : /Edge/.test(ua) ? 'Edge' : 'Other';
  var os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : /Android/.test(ua) ? 'Android' : /iOS/.test(ua) ? 'iOS' : 'Other';
  
  // UTM extraction
  var params = new URLSearchParams(location.search);
  var utm = { source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign'), term: params.get('utm_term'), content: params.get('utm_content') };
  
  var pageStart = Date.now();
  var maxScroll = 0;
  var clickCount = 0;
  
  // Track scroll depth
  window.addEventListener('scroll', function() {
    var h = document.documentElement;
    var depth = Math.round((window.scrollY + window.innerHeight) / h.scrollHeight * 100);
    if (depth > maxScroll) maxScroll = depth;
  });
  
  // Track clicks
  document.addEventListener('click', function(e) {
    clickCount++;
    var el = e.target.closest('a, button, [data-track]');
    if (el) {
      track('click', {
        metadata: {
          element: el.tagName,
          text: (el.textContent || '').trim().slice(0, 100),
          href: el.href || null,
          selector: el.id ? '#' + el.id : el.className ? '.' + el.className.split(' ')[0] : el.tagName,
          x: e.clientX, y: e.clientY
        }
      });
    }
  });
  
  function track(type, data) {
    var payload = Object.assign({
      account_id: OF_ACCOUNT,
      visitor_id: vid,
      event_type: type,
      page_url: location.href,
      page_title: document.title,
      referrer: document.referrer,
      device_type: device,
      browser: browser,
      os: os,
      screen_resolution: screen.width + 'x' + screen.height,
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      scroll_depth: maxScroll,
      click_count: clickCount,
      time_on_page: Math.round((Date.now() - pageStart) / 1000)
    }, data || {});
    
    navigator.sendBeacon ? navigator.sendBeacon(OF_ENDPOINT, JSON.stringify(payload)) :
      fetch(OF_ENDPOINT, { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type':'application/json'}, keepalive: true });
  }
  
  // Auto-track page views
  track('page_view');
  
  // Track on unload (duration + scroll)
  window.addEventListener('beforeunload', function() {
    track('page_exit', { metadata: { duration: Math.round((Date.now() - pageStart) / 1000), scroll_depth: maxScroll, clicks: clickCount }});
  });
  
  // Expose global
  window.ofTrack = track;
  window.ofIdentify = function(email, data) { track('identify', Object.assign({ email: email }, data || {})); };
  
  // Track SPA navigation
  var pushState = history.pushState;
  history.pushState = function() { 
    track('page_exit', { metadata: { duration: Math.round((Date.now() - pageStart) / 1000), scroll_depth: maxScroll }});
    pushState.apply(history, arguments); 
    pageStart = Date.now(); maxScroll = 0; clickCount = 0;
    setTimeout(function(){ track('page_view'); }, 100); 
  };
  window.addEventListener('popstate', function(){ pageStart = Date.now(); maxScroll = 0; clickCount = 0; track('page_view'); });
  
  // Social media referrer detection
  var socialRef = document.referrer;
  if (/facebook|instagram|twitter|linkedin|tiktok|youtube|pinterest/i.test(socialRef)) {
    track('social_visit', { metadata: { social_platform: socialRef.match(/(facebook|instagram|twitter|linkedin|tiktok|youtube|pinterest)/i)[1], referrer: socialRef }});
  }
})();
</script>`;

  const sessionsQuery = useQuery({
    queryKey: ['tracking-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_seen_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const eventsQuery = useQuery({
    queryKey: ['visitor-events', user?.id, selectedSession],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('visitor_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);
      if (selectedSession) query = query.eq('session_id', selectedSession);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const pageAnalyticsQuery = useQuery({
    queryKey: ['page-analytics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('page_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const socialVisitorsQuery = useQuery({
    queryKey: ['social-visitors', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('social_visitors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const liveChatsQuery = useQuery({
    queryKey: ['live-chats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('live_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const callsQuery = useQuery({
    queryKey: ['communication-calls', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('communication_calls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sessions = sessionsQuery.data ?? [];
  const events = eventsQuery.data ?? [];
  const pageAnalytics = pageAnalyticsQuery.data ?? [];
  const socialVisitors = socialVisitorsQuery.data ?? [];
  const liveChats = liveChatsQuery.data ?? [];
  const calls = callsQuery.data ?? [];

  // Stats
  const totalVisitors = sessions.length;
  const identifiedVisitors = sessions.filter((s: any) => s.is_identified).length;
  const totalPageViews = sessions.reduce((sum: number, s: any) => sum + (s.total_page_views || 0), 0);
  const totalClicks = sessions.reduce((sum: number, s: any) => sum + (s.total_clicks || 0), 0);
  const avgEngagement = sessions.length > 0 ? (sessions.reduce((sum: number, s: any) => sum + (Number(s.engagement_score) || 0), 0) / sessions.length).toFixed(1) : '0';
  const mobileVisitors = sessions.filter((s: any) => s.device_type === 'mobile').length;
  const desktopVisitors = sessions.filter((s: any) => s.device_type === 'desktop').length;

  const deviceIcon = (type: string) => {
    if (type === 'mobile') return <Smartphone className="w-3 h-3" />;
    if (type === 'tablet') return <Tablet className="w-3 h-3" />;
    return <Monitor className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Globe className="w-7 h-7" /> Website & Social Tracking</h1>
        <p className="text-muted-foreground mt-1">Track visitors, clicks, page views, social interactions, live chat & calls — all in one CRM hub</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Visitors', value: totalVisitors, icon: Users, color: 'text-blue-500' },
          { label: 'Identified', value: identifiedVisitors, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Page Views', value: totalPageViews, icon: Eye, color: 'text-purple-500' },
          { label: 'Clicks', value: totalClicks, icon: MousePointer, color: 'text-orange-500' },
          { label: 'Avg Score', value: avgEngagement, icon: TrendingUp, color: 'text-cyan-500' },
          { label: 'Mobile', value: mobileVisitors, icon: Smartphone, color: 'text-pink-500' },
          { label: 'Desktop', value: desktopVisitors, icon: Monitor, color: 'text-indigo-500' },
        ].map(stat => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="visitors">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="visitors"><Eye className="w-3 h-3 mr-1" />Visitors ({sessions.length})</TabsTrigger>
          <TabsTrigger value="events"><MousePointer className="w-3 h-3 mr-1" />Events ({events.length})</TabsTrigger>
          <TabsTrigger value="pages"><BarChart3 className="w-3 h-3 mr-1" />Page Analytics</TabsTrigger>
          <TabsTrigger value="social"><Activity className="w-3 h-3 mr-1" />Social ({socialVisitors.length})</TabsTrigger>
          <TabsTrigger value="chat"><MessageCircle className="w-3 h-3 mr-1" />Live Chat ({liveChats.length})</TabsTrigger>
          <TabsTrigger value="calls"><Phone className="w-3 h-3 mr-1" />Calls ({calls.length})</TabsTrigger>
          <TabsTrigger value="setup"><Code className="w-3 h-3 mr-1" />Setup</TabsTrigger>
        </TabsList>

        {/* Visitors Tab */}
        <TabsContent value="visitors">
          <Card className="border-border">
            <CardContent className="p-0">
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No visitors tracked yet. Install the tracking script to start.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Seen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((s: any) => (
                        <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSession(s.id === selectedSession ? null : s.id)}>
                          <TableCell>
                            <div>
                              <span className="text-sm font-medium">{s.email || s.visitor_id?.slice(0, 12)}</span>
                              {s.ip_address && <p className="text-[10px] text-muted-foreground">{s.ip_address}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {deviceIcon(s.device_type || 'desktop')}
                              <span className="text-xs text-muted-foreground">{s.browser || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {s.country && <MapPin className="w-3 h-3" />}
                              {s.city ? `${s.city}, ${s.country}` : s.country || '—'}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="secondary">{s.total_page_views || 0}</Badge></TableCell>
                          <TableCell><Badge variant="outline">{s.total_clicks || 0}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {s.duration_seconds ? `${Math.round(s.duration_seconds / 60)}m` : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Progress value={Number(s.engagement_score) || 0} className="w-12 h-1.5" />
                              <span className="text-[10px] text-muted-foreground">{Number(s.engagement_score)?.toFixed(0) || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {s.utm_source ? <Badge variant="secondary" className="text-[10px]">{s.utm_source}</Badge> : 
                               s.social_source ? <Badge className="bg-pink-500/10 text-pink-500 text-[10px]">{s.social_source}</Badge> :
                               <span className="text-muted-foreground">Direct</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {s.is_identified ? 
                              <Badge className="bg-green-500/10 text-green-500 text-[10px]">Identified</Badge> : 
                              <Badge variant="outline" className="text-[10px]">Anonymous</Badge>
                            }
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {s.last_seen_at ? format(new Date(s.last_seen_at), 'MMM d, HH:mm') : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="w-5 h-5" /> Visitor Events
                {selectedSession && <Badge variant="secondary" className="text-xs">Filtered by session</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MousePointer className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No events recorded yet.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Element</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Scroll</TableHead>
                        <TableHead>UTM</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((e: any) => (
                        <TableRow key={e.id}>
                          <TableCell>
                            <Badge variant={e.event_type === 'click' ? 'default' : 'secondary'} className="text-[10px]">
                              {e.event_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.page_url || '—'}</TableCell>
                          <TableCell className="text-xs">{e.element_text?.slice(0, 30) || '—'}</TableCell>
                          <TableCell>{e.device_type && deviceIcon(e.device_type)}</TableCell>
                          <TableCell className="text-xs">{e.scroll_depth ? `${e.scroll_depth}%` : '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{e.utm_source || '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {e.created_at ? format(new Date(e.created_at), 'HH:mm:ss') : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Analytics Tab */}
        <TabsContent value="pages">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Page Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pageAnalytics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No page analytics data yet. Data aggregates over time.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Unique</TableHead>
                        <TableHead>Avg Time</TableHead>
                        <TableHead>Bounce %</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>Scroll Avg</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageAnalytics.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs font-medium max-w-[250px] truncate">{p.page_title || p.page_url}</TableCell>
                          <TableCell><Badge variant="secondary">{p.total_views}</Badge></TableCell>
                          <TableCell className="text-sm">{p.unique_visitors}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.avg_time_on_page}s</TableCell>
                          <TableCell>
                            <Progress value={Number(p.bounce_rate) || 0} className="w-12 h-1.5" />
                          </TableCell>
                          <TableCell className="text-sm">{p.total_clicks}</TableCell>
                          <TableCell className="text-xs">{p.scroll_depth_avg}%</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Visitors Tab */}
        <TabsContent value="social">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5" /> Social Media Visitors</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {socialVisitors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No social media visitor data yet. Visitors from social platforms are auto-detected.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Followers</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>DM Status</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Last Interaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {socialVisitors.map((sv: any) => (
                        <TableRow key={sv.id}>
                          <TableCell><Badge className="text-[10px] capitalize">{sv.platform}</Badge></TableCell>
                          <TableCell className="text-sm font-medium">@{sv.username || '—'}</TableCell>
                          <TableCell className="text-sm">{sv.follower_count?.toLocaleString() || '—'}</TableCell>
                          <TableCell className="text-sm">{sv.engagement_rate ? `${sv.engagement_rate}%` : '—'}</TableCell>
                          <TableCell>
                            <Badge variant={sv.dm_status === 'replied' ? 'default' : sv.dm_status === 'sent' ? 'secondary' : 'outline'} className="text-[10px]">
                              {sv.dm_status || 'none'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{sv.source || 'organic'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {sv.last_interaction_at ? format(new Date(sv.last_interaction_at), 'MMM d, HH:mm') : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Chat Tab */}
        <TabsContent value="chat">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Live Chat Sessions</CardTitle>
              <p className="text-sm text-muted-foreground">Manage conversations from website visitors, WhatsApp, Messenger & Instagram</p>
            </CardHeader>
            <CardContent className="p-0">
              {liveChats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No live chat sessions yet. Enable the chat widget on your website to start receiving conversations.</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-medium text-foreground">Supported Channels:</p>
                    <div className="flex justify-center gap-2">
                      <Badge variant="secondary">Website Widget</Badge>
                      <Badge variant="secondary">WhatsApp</Badge>
                      <Badge variant="secondary">Messenger</Badge>
                      <Badge variant="secondary">Instagram DMs</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liveChats.map((chat: any) => (
                        <TableRow key={chat.id}>
                          <TableCell>
                            <span className="text-sm font-medium">{chat.visitor_name || chat.visitor_email || 'Anonymous'}</span>
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{chat.channel}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={chat.status === 'active' ? 'default' : chat.status === 'resolved' ? 'secondary' : 'outline'} className="text-[10px]">
                              {chat.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={chat.priority === 'urgent' ? 'destructive' : 'outline'} className="text-[10px]">
                              {chat.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{chat.rating ? `${chat.rating}/5` : '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {chat.started_at ? format(new Date(chat.started_at), 'MMM d, HH:mm') : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {chat.ended_at && chat.started_at ? `${Math.round((new Date(chat.ended_at).getTime() - new Date(chat.started_at).getTime()) / 60000)}m` : 'Ongoing'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calls Tab */}
        <TabsContent value="calls">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Phone className="w-5 h-5" /> Audio & Video Calls</CardTitle>
              <p className="text-sm text-muted-foreground">Track and manage all communication calls with contacts</p>
            </CardHeader>
            <CardContent className="p-0">
              {calls.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No calls recorded yet.</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Badge variant="secondary">Audio Calls</Badge>
                    <Badge variant="secondary">Video Calls</Badge>
                    <Badge variant="secondary">Call Recording</Badge>
                    <Badge variant="secondary">Auto Transcription</Badge>
                  </div>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Recording</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calls.map((call: any) => (
                        <TableRow key={call.id}>
                          <TableCell>
                            {call.call_type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : <Phone className="w-4 h-4 text-green-500" />}
                          </TableCell>
                          <TableCell>
                            <Badge variant={call.direction === 'inbound' ? 'secondary' : 'outline'} className="text-[10px]">
                              {call.direction === 'inbound' ? '↙ In' : '↗ Out'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={call.status === 'connected' ? 'default' : call.status === 'ended' ? 'secondary' : 'destructive'} className="text-[10px]">
                              {call.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{call.duration_seconds ? `${Math.round(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : '—'}</TableCell>
                          <TableCell>{call.recording_url ? <Badge variant="secondary" className="text-[10px]">Available</Badge> : '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {call.created_at ? format(new Date(call.created_at), 'MMM d, HH:mm') : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Tracking Script v2</CardTitle>
              <p className="text-sm text-muted-foreground">Copy and paste before &lt;/body&gt;. Tracks page views, clicks, scroll depth, device info, UTMs, social referrers, and SPA navigation.</p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap border border-border max-h-[400px] overflow-y-auto">
                  {trackingScript}
                </pre>
                <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={handleCopy}>
                  {copied ? <><CheckCircle className="w-3 h-3 mr-1" />Copied</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Custom Events & API</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Use these JavaScript functions for custom tracking:</p>
              <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono border border-border space-y-2">
                <p className="text-muted-foreground">// Identify a visitor (converts anonymous → known lead)</p>
                <p className="text-primary">ofIdentify('user@example.com', {'{'} name: 'John Doe' {'}'});</p>
                <p className="mt-2 text-muted-foreground">// Track custom events</p>
                <p className="text-primary">ofTrack('form_submit', {'{'} metadata: {'{'} form: 'contact' {'}'} {'}'});</p>
                <p className="text-primary">ofTrack('video_play', {'{'} metadata: {'{'} video_id: 'intro' {'}'} {'}'});</p>
                <p className="text-primary">ofTrack('download', {'{'} metadata: {'{'} file: 'whitepaper.pdf' {'}'} {'}'});</p>
                <p className="mt-2 text-muted-foreground">// Social tracking is automatic from referrer detection</p>
                <p className="text-muted-foreground">// UTM parameters are auto-captured</p>
                <p className="text-muted-foreground">// Click tracking on links/buttons is automatic</p>
                <p className="text-muted-foreground">// Scroll depth & time-on-page captured on exit</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Chat Widget Setup</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Add the live chat widget to your website for real-time conversations:</p>
              <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono border border-border space-y-2">
                <p className="text-muted-foreground">// After the tracking script, add:</p>
                <p className="text-primary">ofTrack('chat_init', {'{'} metadata: {'{'} widget: true {'}'} {'}'});</p>
                <p className="mt-2 text-muted-foreground">// The chat widget connects via the live_chats table</p>
                <p className="text-muted-foreground">// Messages are stored in chat_messages</p>
                <p className="text-muted-foreground">// Supports: text, images, files, audio, video</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
