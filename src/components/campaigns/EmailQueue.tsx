import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Globe2, 
  Mail, 
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimezoneGroup {
  timezone: string;
  contactCount: number;
  scheduledTime: string;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  sent: number;
  failed: number;
}

interface QueueItem {
  id: string;
  contactName: string;
  email: string;
  timezone: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}

interface EmailQueueProps {
  campaignId: string;
  useRecipientTimezone: boolean;
  optimalSendHour: number;
  onComplete?: () => void;
}

export function EmailQueue({ campaignId, useRecipientTimezone, optimalSendHour, onComplete }: EmailQueueProps) {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timezoneGroups, setTimezoneGroups] = useState<TimezoneGroup[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });

  // Load initial queue data
  useEffect(() => {
    const loadQueueData = async () => {
      const { data: contacts } = await supabase
        .from('campaign_contacts')
        .select(`
          id, status, sent_at, error_message,
          contacts(id, first_name, last_name, email, timezone)
        `)
        .eq('campaign_id', campaignId);

      if (contacts) {
        // Group by timezone if using recipient timezone
        const groups: Record<string, TimezoneGroup> = {};
        const items: QueueItem[] = [];

        contacts.forEach((cc: any) => {
          const contact = cc.contacts;
          const timezone = contact?.timezone || 'UTC';
          
          items.push({
            id: cc.id,
            contactName: `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim() || 'Unknown',
            email: contact?.email || '',
            timezone,
            status: cc.status as 'pending' | 'sending' | 'sent' | 'failed',
            sentAt: cc.sent_at ? new Date(cc.sent_at) : undefined,
            error: cc.error_message,
          });

          if (!groups[timezone]) {
            groups[timezone] = {
              timezone,
              contactCount: 0,
              scheduledTime: calculateScheduledTime(timezone, optimalSendHour),
              status: 'pending',
              sent: 0,
              failed: 0,
            };
          }
          groups[timezone].contactCount++;
          if (cc.status === 'sent') groups[timezone].sent++;
          if (cc.status === 'failed') groups[timezone].failed++;
        });

        // Update group statuses
        Object.values(groups).forEach(group => {
          if (group.sent + group.failed === group.contactCount) {
            group.status = group.failed > 0 ? 'failed' : 'completed';
          } else if (group.sent > 0 || group.failed > 0) {
            group.status = 'sending';
          }
        });

        setTimezoneGroups(Object.values(groups).sort((a, b) => a.timezone.localeCompare(b.timezone)));
        setQueueItems(items);
        setStats({
          total: items.length,
          sent: items.filter(i => i.status === 'sent').length,
          failed: items.filter(i => i.status === 'failed').length,
          pending: items.filter(i => i.status === 'pending').length,
        });
      }
    };

    loadQueueData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`queue-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_contacts',
          filter: `campaign_id=eq.${campaignId}`,
        },
        async (payload) => {
          const newData = payload.new as any;
          
          setQueueItems(prev => prev.map(item => {
            if (item.id === newData.id) {
              return {
                ...item,
                status: newData.status,
                sentAt: newData.sent_at ? new Date(newData.sent_at) : undefined,
                error: newData.error_message,
              };
            }
            return item;
          }));

          // Update stats
          setStats(prev => {
            const oldItem = queueItems.find(i => i.id === newData.id);
            if (!oldItem) return prev;
            
            let newStats = { ...prev };
            if (oldItem.status === 'pending' && newData.status === 'sent') {
              newStats.pending--;
              newStats.sent++;
            } else if (oldItem.status === 'pending' && newData.status === 'failed') {
              newStats.pending--;
              newStats.failed++;
            }
            return newStats;
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, optimalSendHour]);

  const calculateScheduledTime = (timezone: string, hour: number): string => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
        hour12: true,
      };
      const localTime = new Intl.DateTimeFormat('en-US', options).format(now);
      return `${hour}:00 local time (currently ${localTime})`;
    } catch {
      return `${hour}:00`;
    }
  };

  const startQueue = async () => {
    setIsRunning(true);
    setIsPaused(false);
    
    try {
      const { error } = await supabase.functions.invoke('send-campaign-emails', {
        body: { campaignId },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Queue start error:', error);
    }
  };

  const pauseQueue = () => {
    setIsPaused(true);
    // In a real implementation, you'd signal the edge function to pause
  };

  const resumeQueue = () => {
    setIsPaused(false);
    startQueue();
  };

  const progress = stats.total > 0 ? ((stats.sent + stats.failed) / stats.total) * 100 : 0;
  const isComplete = stats.pending === 0 && stats.total > 0;

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Queue
            </CardTitle>
            <CardDescription>
              {useRecipientTimezone 
                ? `Sending at ${optimalSendHour}:00 in each recipient's timezone`
                : 'Sending immediately to all contacts'}
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">
              {stats.sent + stats.failed} / {stats.total}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-success" />
              {stats.sent} sent
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              {stats.failed} failed
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {stats.pending} pending
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isRunning && !isComplete ? (
            <Button onClick={startQueue} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Queue
            </Button>
          ) : isComplete ? (
            <Button variant="outline" className="flex-1" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </Button>
          ) : isPaused ? (
            <Button onClick={resumeQueue} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button onClick={pauseQueue} variant="outline" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
        </div>

        {/* Timezone Groups */}
        {useRecipientTimezone && timezoneGroups.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-primary" />
              Timezone Batches
            </h4>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {timezoneGroups.map((group) => (
                  <div
                    key={group.timezone}
                    className={cn(
                      "p-3 rounded-lg border",
                      group.status === 'completed' && "bg-success/5 border-success/30",
                      group.status === 'sending' && "bg-primary/5 border-primary/30",
                      group.status === 'failed' && "bg-destructive/5 border-destructive/30",
                      group.status === 'pending' && "bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{group.timezone}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.contactCount} contacts • {group.scheduledTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {group.status === 'sending' && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                        {group.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                        {group.status === 'failed' && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {group.sent}/{group.contactCount}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(group.sent / group.contactCount) * 100} 
                      className="h-1 mt-2" 
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          <ScrollArea className="h-40">
            <div className="space-y-1">
              {queueItems
                .filter(item => item.status !== 'pending')
                .sort((a, b) => (b.sentAt?.getTime() || 0) - (a.sentAt?.getTime() || 0))
                .slice(0, 20)
                .map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded text-sm",
                      item.status === 'sent' && "bg-success/5",
                      item.status === 'failed' && "bg-destructive/5"
                    )}
                  >
                    {item.status === 'sent' ? (
                      <CheckCircle className="w-3 h-3 text-success shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 text-destructive shrink-0" />
                    )}
                    <span className="flex-1 truncate">{item.contactName}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {item.email}
                    </span>
                    {item.sentAt && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(item.sentAt, 'HH:mm:ss')}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
