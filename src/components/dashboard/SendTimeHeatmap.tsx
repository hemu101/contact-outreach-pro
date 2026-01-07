import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Clock, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, getHours, getDay, parseISO } from 'date-fns';

interface HeatmapCell {
  day: number;
  hour: number;
  sends: number;
  opens: number;
  clicks: number;
  openRate: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function SendTimeHeatmap() {
  const { user } = useAuth();

  // Fetch campaign contacts with engagement data
  const { data: engagementData = [] } = useQuery({
    queryKey: ['send-time-analytics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('campaign_contacts')
        .select(`
          sent_at,
          opened_at,
          clicked_at,
          campaigns!inner(user_id)
        `)
        .eq('campaigns.user_id', user.id)
        .not('sent_at', 'is', null);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Process data into heatmap grid
  const heatmapData = useMemo(() => {
    const grid: HeatmapCell[][] = DAYS.map((_, dayIdx) =>
      HOURS.map(hour => ({
        day: dayIdx,
        hour,
        sends: 0,
        opens: 0,
        clicks: 0,
        openRate: 0,
      }))
    );

    engagementData.forEach(item => {
      if (!item.sent_at) return;
      const sentDate = parseISO(item.sent_at);
      const day = getDay(sentDate);
      const hour = getHours(sentDate);
      
      grid[day][hour].sends++;
      if (item.opened_at) grid[day][hour].opens++;
      if (item.clicked_at) grid[day][hour].clicks++;
    });

    // Calculate open rates
    for (const dayRow of grid) {
      for (const cell of dayRow) {
        cell.openRate = cell.sends > 0 ? (cell.opens / cell.sends) * 100 : 0;
      }
    }

    return grid;
  }, [engagementData]);

  // Find best performing time slots
  const topSlots = useMemo(() => {
    const allCells = heatmapData.flat().filter(c => c.sends >= 5);
    return allCells
      .sort((a, b) => b.openRate - a.openRate)
      .slice(0, 5);
  }, [heatmapData]);

  // Get max values for color scaling
  const maxOpenRate = useMemo(() => {
    return Math.max(...heatmapData.flat().map(c => c.openRate), 1);
  }, [heatmapData]);

  const maxSends = useMemo(() => {
    return Math.max(...heatmapData.flat().map(c => c.sends), 1);
  }, [heatmapData]);

  // Get color based on open rate
  const getCellColor = (cell: HeatmapCell) => {
    if (cell.sends === 0) return 'bg-secondary/30';
    
    const intensity = cell.openRate / maxOpenRate;
    
    if (intensity > 0.8) return 'bg-success';
    if (intensity > 0.6) return 'bg-success/70';
    if (intensity > 0.4) return 'bg-primary/70';
    if (intensity > 0.2) return 'bg-primary/40';
    return 'bg-muted';
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12a';
    if (hour === 12) return '12p';
    if (hour < 12) return `${hour}a`;
    return `${hour - 12}p`;
  };

  const totalSends = engagementData.length;
  const totalOpens = engagementData.filter(e => e.opened_at).length;
  const avgOpenRate = totalSends > 0 ? (totalOpens / totalSends) * 100 : 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Send Time Performance
        </CardTitle>
        <CardDescription>
          Best performing send times based on historical open rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <p className="text-2xl font-bold">{totalSends.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Emails Analyzed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">{avgOpenRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Avg Open Rate</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <p className="text-2xl font-bold text-primary">{topSlots.length > 0 ? topSlots[0].openRate.toFixed(0) : 0}%</p>
            <p className="text-xs text-muted-foreground">Peak Open Rate</p>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-1 pl-12">
              {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                <div 
                  key={hour} 
                  className="text-xs text-muted-foreground"
                  style={{ width: `${100 / 8}%` }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-12 text-xs text-muted-foreground pr-2 text-right shrink-0">
                  {day}
                </div>
                <div className="flex-1 flex gap-0.5">
                  {HOURS.map(hour => {
                    const cell = heatmapData[dayIdx][hour];
                    return (
                      <div
                        key={`${dayIdx}-${hour}`}
                        className={`h-6 flex-1 rounded-sm transition-all hover:scale-110 cursor-pointer ${getCellColor(cell)}`}
                        title={`${day} ${formatHour(hour)}: ${cell.sends} sent, ${cell.openRate.toFixed(1)}% open rate`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-secondary/30" />
            <div className="w-4 h-4 rounded bg-muted" />
            <div className="w-4 h-4 rounded bg-primary/40" />
            <div className="w-4 h-4 rounded bg-primary/70" />
            <div className="w-4 h-4 rounded bg-success/70" />
            <div className="w-4 h-4 rounded bg-success" />
          </div>
          <span>High Open Rate</span>
        </div>

        {/* Top Performing Slots */}
        {topSlots.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Best Performing Time Slots
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {topSlots.map((slot, idx) => (
                <div 
                  key={`${slot.day}-${slot.hour}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={idx === 0 ? 'default' : 'secondary'} className="w-6 h-6 p-0 flex items-center justify-center">
                      {idx + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {DAYS[slot.day]} {formatHour(slot.hour)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slot.sends} emails sent
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{slot.openRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">open rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {topSlots.length > 0 && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Scheduling Recommendation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your data, the best time to send emails is 
                  <span className="font-medium text-foreground"> {DAYS[topSlots[0].day]}s at {formatHour(topSlots[0].hour)}</span>. 
                  Consider scheduling campaigns during peak performance windows.
                </p>
              </div>
            </div>
          </div>
        )}

        {engagementData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No email data yet. Send campaigns to see performance insights.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
