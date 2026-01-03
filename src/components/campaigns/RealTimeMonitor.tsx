import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Eye, MousePointer, XCircle, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RealtimeEvent {
  id: string;
  type: 'sent' | 'opened' | 'clicked' | 'failed';
  contactName: string;
  email: string;
  timestamp: Date;
}

interface RealTimeMonitorProps {
  campaignId: string;
}

export function RealTimeMonitor({ campaignId }: RealTimeMonitorProps) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({ sent: 0, opened: 0, clicked: 0, failed: 0 });

  useEffect(() => {
    // Fetch initial stats
    const fetchInitialStats = async () => {
      const { data } = await supabase
        .from('campaign_contacts')
        .select('status, opened_at, clicked_at')
        .eq('campaign_id', campaignId);

      if (data) {
        setStats({
          sent: data.filter(c => c.status === 'sent').length,
          opened: data.filter(c => c.opened_at).length,
          clicked: data.filter(c => c.clicked_at).length,
          failed: data.filter(c => c.status === 'failed').length,
        });
      }
    };

    fetchInitialStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`campaign-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_contacts',
          filter: `campaign_id=eq.${campaignId}`,
        },
        async (payload) => {
          console.log('Realtime event:', payload);
          
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          // Fetch contact details
          const { data: contact } = await supabase
            .from('contacts')
            .select('first_name, last_name, email')
            .eq('id', newData.contact_id)
            .single();

          const contactName = contact 
            ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown'
            : 'Unknown';

          // Determine event type
          let eventType: RealtimeEvent['type'] | null = null;
          
          if (newData.status === 'sent' && oldData?.status !== 'sent') {
            eventType = 'sent';
            setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
          } else if (newData.status === 'failed' && oldData?.status !== 'failed') {
            eventType = 'failed';
            setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
          } else if (newData.opened_at && !oldData?.opened_at) {
            eventType = 'opened';
            setStats(prev => ({ ...prev, opened: prev.opened + 1 }));
          } else if (newData.clicked_at && !oldData?.clicked_at) {
            eventType = 'clicked';
            setStats(prev => ({ ...prev, clicked: prev.clicked + 1 }));
          }

          if (eventType) {
            const event: RealtimeEvent = {
              id: `${newData.id}-${eventType}-${Date.now()}`,
              type: eventType,
              contactName,
              email: contact?.email || 'Unknown',
              timestamp: new Date(),
            };

            setEvents(prev => [event, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  const getEventIcon = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'sent':
        return <Mail className="w-4 h-4 text-success" />;
      case 'opened':
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 'clicked':
        return <MousePointer className="w-4 h-4 text-purple-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getEventBadge = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'sent':
        return <Badge className="bg-success/20 text-success border-0 text-xs">Sent</Badge>;
      case 'opened':
        return <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">Opened</Badge>;
      case 'clicked':
        return <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">Clicked</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Live Monitor</h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="text-success border-success/50">
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <WifiOff className="w-3 h-3 mr-1" />
              Connecting...
            </Badge>
          )}
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <p className="text-xl font-bold text-success">{stats.sent}</p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
        <div className="text-center p-3 bg-blue-500/10 rounded-lg">
          <p className="text-xl font-bold text-blue-400">{stats.opened}</p>
          <p className="text-xs text-muted-foreground">Opened</p>
        </div>
        <div className="text-center p-3 bg-purple-500/10 rounded-lg">
          <p className="text-xl font-bold text-purple-400">{stats.clicked}</p>
          <p className="text-xs text-muted-foreground">Clicked</p>
        </div>
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <p className="text-xl font-bold text-destructive">{stats.failed}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>

      {/* Event Stream */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Activity Stream</p>
        <ScrollArea className="h-64 border border-border rounded-lg">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <div className="text-center">
                <Wifi className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for activity...</p>
                <p className="text-xs mt-1">Events will appear here in real-time</p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg",
                    "bg-secondary/30 animate-in fade-in slide-in-from-top-2 duration-300"
                  )}
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {event.contactName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {event.email}
                    </p>
                  </div>
                  {getEventBadge(event.type)}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(event.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
