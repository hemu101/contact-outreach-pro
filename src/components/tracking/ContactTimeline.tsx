import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContactActivities } from '@/hooks/useContactActivities';
import { Loader2, Eye, MousePointerClick, Mail, Phone, FileText, Globe, MessageSquare, Calendar, Zap } from 'lucide-react';
import { format } from 'date-fns';

const ACTIVITY_ICONS: Record<string, any> = {
  page_view: Globe,
  email_open: Mail,
  email_click: MousePointerClick,
  form_submit: FileText,
  call: Phone,
  note: MessageSquare,
  meeting: Calendar,
  deal_change: Zap,
};

const ACTIVITY_COLORS: Record<string, string> = {
  page_view: 'bg-blue-500/10 text-blue-500',
  email_open: 'bg-green-500/10 text-green-500',
  email_click: 'bg-purple-500/10 text-purple-500',
  form_submit: 'bg-orange-500/10 text-orange-500',
  call: 'bg-cyan-500/10 text-cyan-500',
  note: 'bg-muted text-muted-foreground',
  meeting: 'bg-yellow-500/10 text-yellow-500',
  deal_change: 'bg-primary/10 text-primary',
};

interface ContactTimelineProps {
  contactId?: string;
  compact?: boolean;
}

export function ContactTimeline({ contactId, compact = false }: ContactTimelineProps) {
  const { data: activities = [], isLoading } = useContactActivities(contactId);

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Eye className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No activity recorded yet</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, typeof activities> = {};
  activities.forEach(a => {
    const day = format(new Date(a.created_at), 'yyyy-MM-dd');
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(a);
  });

  return (
    <ScrollArea className={compact ? 'max-h-[400px]' : 'max-h-[600px]'}>
      <div className="space-y-6 px-1">
        {Object.entries(grouped).map(([day, dayActivities]) => (
          <div key={day}>
            <p className="text-xs font-semibold text-muted-foreground mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-1">
              {format(new Date(day), 'EEEE, MMM d, yyyy')}
            </p>
            <div className="space-y-2 ml-4 border-l-2 border-border pl-4">
              {dayActivities.map(activity => {
                const Icon = ACTIVITY_ICONS[activity.activity_type] || Zap;
                const colorClass = ACTIVITY_COLORS[activity.activity_type] || 'bg-muted text-muted-foreground';
                return (
                  <div key={activity.id} className="flex items-start gap-3 relative">
                    <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-border" />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{activity.title || activity.activity_type}</span>
                        <Badge variant="outline" className="text-[10px]">{activity.source}</Badge>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.description}</p>
                      )}
                      {activity.page_url && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{activity.page_url}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(activity.created_at), 'h:mm a')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function ContactActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Eye className="w-7 h-7" /> Activity Tracking</h1>
        <p className="text-muted-foreground mt-1">HubSpot-style activity feed across all contacts</p>
      </div>
      <Card className="border-border">
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <ContactTimeline />
        </CardContent>
      </Card>
    </div>
  );
}
