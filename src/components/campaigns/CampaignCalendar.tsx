import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Users, Mail, MessageCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Campaign = Tables<'campaigns'>;

interface CampaignCalendarProps {
  campaigns: Campaign[];
  onViewCampaign: (id: string) => void;
}

export function CampaignCalendar({ campaigns, onViewCampaign }: CampaignCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const campaignsByDate = useMemo(() => {
    const map = new Map<string, Campaign[]>();
    campaigns.forEach(campaign => {
      if (campaign.scheduled_at) {
        const dateKey = format(new Date(campaign.scheduled_at), 'yyyy-MM-dd');
        const existing = map.get(dateKey) || [];
        map.set(dateKey, [...existing, campaign]);
      }
    });
    return map;
  }, [campaigns]);

  const selectedDateCampaigns = selectedDate 
    ? campaignsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'running': return 'bg-primary/20 text-primary border-primary/30';
      case 'scheduled': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Campaign Calendar
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-foreground min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="ml-2" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayCampaigns = campaignsByDate.get(dateKey) || [];
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "min-h-[100px] p-2 rounded-lg border transition-all text-left",
                isCurrentMonth ? "bg-card" : "bg-muted/30",
                isToday && "border-primary",
                isSelected && "ring-2 ring-primary",
                !isSelected && !isToday && "border-border hover:border-primary/50"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                isToday && "text-primary font-bold",
                !isCurrentMonth && "text-muted-foreground"
              )}>
                {format(day, 'd')}
              </span>
              
              <div className="mt-1 space-y-1">
                {dayCampaigns.slice(0, 2).map(campaign => (
                  <div
                    key={campaign.id}
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded truncate border",
                      getStatusColor(campaign.status)
                    )}
                  >
                    {campaign.name}
                  </div>
                ))}
                {dayCampaigns.length > 2 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayCampaigns.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-4">
            Campaigns on {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          {selectedDateCampaigns.length === 0 ? (
            <p className="text-muted-foreground text-sm">No campaigns scheduled for this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedDateCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  onClick={() => onViewCampaign(campaign.id)}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{campaign.name}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {campaign.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(campaign.scheduled_at), 'h:mm a')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {campaign.total_contacts || 0} contacts
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {campaign.sent_count || 0} sent
                        </span>
                      </div>
                    </div>
                    <Badge className={cn("capitalize", getStatusColor(campaign.status))}>
                      {campaign.status || 'draft'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
