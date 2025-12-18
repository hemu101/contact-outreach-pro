import { Mail, MessageCircle, Phone, CheckCircle, XCircle } from 'lucide-react';
import { ActivityLog } from '@/types/contact';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

const iconMap = {
  email: Mail,
  instagram: MessageCircle,
  tiktok: MessageCircle,
  voicemail: Phone,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No activity yet</p>
        ) : (
          activities.map((activity) => {
            const Icon = iconMap[activity.type];
            return (
              <div 
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  activity.status === 'success' ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    activity.status === 'success' ? "text-success" : "text-destructive"
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {activity.contactName}
                    </span>
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{activity.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
