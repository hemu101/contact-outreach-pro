import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Code, Copy, CheckCircle, Globe, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export function TrackingScriptPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'syqawvakxxfaohcgrenn';

  const trackingScript = `<!-- OutreachFlow Tracking Script -->
<script>
(function() {
  var OF_ACCOUNT = "${user?.id || 'YOUR_ACCOUNT_ID'}";
  var OF_ENDPOINT = "https://${projectId}.supabase.co/functions/v1/track-website-visitor";
  
  var vid = localStorage.getItem('of_vid');
  if (!vid) { vid = 'v_' + Math.random().toString(36).substr(2,9) + Date.now(); localStorage.setItem('of_vid', vid); }
  
  function track(type, data) {
    var payload = Object.assign({
      account_id: OF_ACCOUNT,
      visitor_id: vid,
      event_type: type,
      page_url: location.href,
      page_title: document.title,
      referrer: document.referrer
    }, data || {});
    
    navigator.sendBeacon ? navigator.sendBeacon(OF_ENDPOINT, JSON.stringify(payload)) :
      fetch(OF_ENDPOINT, { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type':'application/json'}, keepalive: true });
  }
  
  // Auto-track page views
  track('page_view');
  
  // Expose global for custom events
  window.ofTrack = track;
  window.ofIdentify = function(email) { track('identify', { email: email }); };
  
  // Track SPA navigation
  var pushState = history.pushState;
  history.pushState = function() { pushState.apply(history, arguments); setTimeout(function(){ track('page_view'); }, 100); };
  window.addEventListener('popstate', function(){ track('page_view'); });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Globe className="w-7 h-7" /> Website Tracking</h1>
        <p className="text-muted-foreground mt-1">Embed a script on your website to track visitor activity and identify leads</p>
      </div>

      <Tabs defaultValue="setup">
        <TabsList>
          <TabsTrigger value="setup"><Code className="w-4 h-4 mr-1" />Setup</TabsTrigger>
          <TabsTrigger value="visitors"><Eye className="w-4 h-4 mr-1" />Visitors ({sessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Tracking Script</CardTitle>
              <p className="text-sm text-muted-foreground">Copy and paste this script before the closing &lt;/body&gt; tag on your website.</p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap border border-border">
                  {trackingScript}
                </pre>
                <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={handleCopy}>
                  {copied ? <><CheckCircle className="w-3 h-3 mr-1" />Copied</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Custom Events</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Use these JavaScript functions to track custom events:</p>
              <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono border border-border space-y-2">
                <p>// Identify a visitor by email (converts anonymous to known)</p>
                <p className="text-primary">ofIdentify('user@example.com');</p>
                <p className="mt-2">// Track a custom event</p>
                <p className="text-primary">ofTrack('form_submit', {'{'} form_name: 'contact' {'}'});</p>
                <p className="mt-2">// Track a button click</p>
                <p className="text-primary">ofTrack('click', {'{'} element: 'pricing_cta' {'}'});</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors">
          <Card className="border-border">
            <CardContent className="p-0">
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No visitors tracked yet. Install the tracking script to get started.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Landing Page</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead>Identified</TableHead>
                        <TableHead>Last Seen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div>
                              <span className="text-sm font-medium">{s.email || s.visitor_id?.slice(0, 12)}</span>
                              {s.ip_address && <p className="text-[10px] text-muted-foreground">{s.ip_address}</p>}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="secondary">{s.total_page_views}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{s.landing_page || '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">{s.referrer || 'Direct'}</TableCell>
                          <TableCell>{s.is_identified ? <Badge className="bg-green-500/10 text-green-500 text-xs">Yes</Badge> : <Badge variant="outline" className="text-xs">Anonymous</Badge>}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{s.last_seen_at ? format(new Date(s.last_seen_at), 'MMM d, HH:mm') : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
