import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Flame, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calendar,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';

interface WarmupSchedule {
  id: string;
  domain: string;
  current_daily_limit: number;
  target_daily_limit: number;
  increment_per_day: number;
  warmup_start_date: string;
  status: string;
  emails_sent_today: number;
  last_send_date: string | null;
  created_at: string;
}

export function EmailWarmup() {
  const [schedules, setSchedules] = useState<WarmupSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [targetLimit, setTargetLimit] = useState(500);
  const [incrementPerDay, setIncrementPerDay] = useState(10);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_warmup_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading warmup schedules',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    if (!user || !newDomain) return;

    setCreating(true);
    try {
      const { error } = await supabase.from('email_warmup_schedules').insert({
        user_id: user.id,
        domain: newDomain,
        target_daily_limit: targetLimit,
        increment_per_day: incrementPerDay,
        current_daily_limit: 10,
        status: 'active',
      });

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'warmup_created',
        entity_type: 'email_warmup_schedules',
        metadata: { domain: newDomain, target_limit: targetLimit },
      });

      toast({
        title: 'Warmup schedule created',
        description: `Starting warmup for ${newDomain}`,
      });

      setNewDomain('');
      fetchSchedules();
    } catch (error: any) {
      toast({
        title: 'Error creating schedule',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleSchedule = async (schedule: WarmupSchedule) => {
    const newStatus = schedule.status === 'active' ? 'paused' : 'active';
    
    await supabase
      .from('email_warmup_schedules')
      .update({ status: newStatus })
      .eq('id', schedule.id);

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user?.id,
      action_type: `warmup_${newStatus}`,
      entity_type: 'email_warmup_schedules',
      entity_id: schedule.id,
    });

    fetchSchedules();
  };

  const deleteSchedule = async (id: string) => {
    await supabase
      .from('email_warmup_schedules')
      .delete()
      .eq('id', id);

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user?.id,
      action_type: 'warmup_deleted',
      entity_type: 'email_warmup_schedules',
      entity_id: id,
    });

    toast({
      title: 'Warmup schedule deleted',
    });
    fetchSchedules();
  };

  const getProgress = (schedule: WarmupSchedule) => {
    return Math.min(100, (schedule.current_daily_limit / schedule.target_daily_limit) * 100);
  };

  const getDaysRemaining = (schedule: WarmupSchedule) => {
    const remaining = schedule.target_daily_limit - schedule.current_daily_limit;
    return Math.ceil(remaining / schedule.increment_per_day);
  };

  const getDaysActive = (schedule: WarmupSchedule) => {
    return differenceInDays(new Date(), new Date(schedule.warmup_start_date));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <CardTitle>Email Warmup</CardTitle>
          </div>
          <CardDescription>
            Gradually increase your sending volume to build domain reputation and improve deliverability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="target">Target Daily Limit</Label>
              <Input
                id="target"
                type="number"
                value={targetLimit}
                onChange={(e) => setTargetLimit(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="increment">Increment/Day</Label>
              <Input
                id="increment"
                type="number"
                value={incrementPerDay}
                onChange={(e) => setIncrementPerDay(parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={createSchedule} disabled={creating || !newDomain}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Domain
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Flame className="h-8 w-8 mb-2" />
            <p>No warmup schedules yet</p>
            <p className="text-sm">Add a domain above to start warming up</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {schedule.domain}
                    </CardTitle>
                    <CardDescription>
                      Started {format(new Date(schedule.warmup_start_date), 'PP')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                      {schedule.status === 'active' ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" /> Active</>
                      ) : (
                        <><AlertCircle className="mr-1 h-3 w-3" /> Paused</>
                      )}
                    </Badge>
                    <Switch
                      checked={schedule.status === 'active'}
                      onCheckedChange={() => toggleSchedule(schedule)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to target</span>
                      <span className="font-medium">
                        {schedule.current_daily_limit} / {schedule.target_daily_limit} emails/day
                      </span>
                    </div>
                    <Progress value={getProgress(schedule)} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-muted rounded-lg p-3">
                      <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-semibold">{schedule.emails_sent_today}</p>
                      <p className="text-xs text-muted-foreground">Sent Today</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <Calendar className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-lg font-semibold">{getDaysActive(schedule)}</p>
                      <p className="text-xs text-muted-foreground">Days Active</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                      <p className="text-lg font-semibold">{getDaysRemaining(schedule)}</p>
                      <p className="text-xs text-muted-foreground">Days Left</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteSchedule(schedule.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
