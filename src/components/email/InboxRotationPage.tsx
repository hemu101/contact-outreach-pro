import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Plus, RefreshCw, Shield, Flame, AlertTriangle, CheckCircle2, Trash2, Settings2, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EmailAccount {
  id: string;
  email_address: string;
  display_name: string | null;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_password: string;
  daily_limit: number;
  sent_today: number;
  warmup_enabled: boolean;
  warmup_daily_target: number;
  warmup_current_volume: number;
  is_active: boolean;
  health_status: string;
  last_sent_at: string | null;
  last_error: string | null;
  rotation_weight: number;
}

export function InboxRotationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ email_address: '', display_name: '', smtp_host: '', smtp_port: '587', smtp_user: '', smtp_password: '', daily_limit: 50 });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['email-accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any).from('email_accounts').select('*').eq('user_id', user.id).order('created_at');
      if (error) throw error;
      return (data || []) as EmailAccount[];
    },
    enabled: !!user,
  });

  const addAccount = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await (supabase as any).from('email_accounts').insert({ ...form, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-accounts'] });
      toast({ title: 'Email account added' });
      setAddOpen(false);
      setForm({ email_address: '', display_name: '', smtp_host: '', smtp_port: '587', smtp_user: '', smtp_password: '', daily_limit: 50 });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const toggleAccount = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any).from('email_accounts').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-accounts'] }),
  });

  const toggleWarmup = useMutation({
    mutationFn: async ({ id, warmup_enabled }: { id: string; warmup_enabled: boolean }) => {
      const { error } = await supabase.from('email_accounts').update({ warmup_enabled, warmup_start_date: warmup_enabled ? new Date().toISOString().split('T')[0] : null }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['email-accounts'] }); toast({ title: 'Warmup updated' }); },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_accounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['email-accounts'] }); toast({ title: 'Account removed' }); },
  });

  const totalDaily = accounts.reduce((s, a) => s + (a.is_active ? a.daily_limit : 0), 0);
  const totalSent = accounts.reduce((s, a) => s + a.sent_today, 0);
  const healthyCount = accounts.filter(a => a.health_status === 'healthy' && a.is_active).length;
  const warmupCount = accounts.filter(a => a.warmup_enabled).length;

  const healthIcon = (status: string) => {
    if (status === 'healthy') return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inbox Rotation</h1>
          <p className="text-muted-foreground mt-1">Manage multiple SMTP accounts for optimal deliverability</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Account</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Email Account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email Address</Label><Input value={form.email_address} onChange={e => setForm(f => ({ ...f, email_address: e.target.value }))} placeholder="you@domain.com" /></div>
                <div><Label>Display Name</Label><Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} placeholder="John Smith" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>SMTP Host</Label><Input value={form.smtp_host} onChange={e => setForm(f => ({ ...f, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" /></div>
                <div><Label>SMTP Port</Label><Input value={form.smtp_port} onChange={e => setForm(f => ({ ...f, smtp_port: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>SMTP User</Label><Input value={form.smtp_user} onChange={e => setForm(f => ({ ...f, smtp_user: e.target.value }))} /></div>
                <div><Label>SMTP Password</Label><Input type="password" value={form.smtp_password} onChange={e => setForm(f => ({ ...f, smtp_password: e.target.value }))} /></div>
              </div>
              <div><Label>Daily Limit</Label><Input type="number" value={form.daily_limit} onChange={e => setForm(f => ({ ...f, daily_limit: Number(e.target.value) }))} /></div>
              <Button onClick={() => addAccount.mutate()} className="w-full" disabled={!form.email_address || !form.smtp_host}>Add Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><Mail className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{accounts.length}</p><p className="text-xs text-muted-foreground">Total Accounts</p></div></div></CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><Shield className="w-8 h-8 text-green-400" /><div><p className="text-2xl font-bold">{healthyCount}/{accounts.length}</p><p className="text-xs text-muted-foreground">Healthy</p></div></div></CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-400" /><div><p className="text-2xl font-bold">{totalSent}/{totalDaily}</p><p className="text-xs text-muted-foreground">Sent Today</p></div></div></CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><Flame className="w-8 h-8 text-orange-400" /><div><p className="text-2xl font-bold">{warmupCount}</p><p className="text-xs text-muted-foreground">Warming Up</p></div></div></CardContent></Card>
      </div>

      {/* Accounts Table */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" />Email Accounts</CardTitle><CardDescription>Accounts rotate automatically based on weight and daily limits</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>SMTP</TableHead>
                <TableHead>Daily Usage</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Warmup</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(acc => (
                <TableRow key={acc.id}>
                  <TableCell>{healthIcon(acc.health_status)}</TableCell>
                  <TableCell>
                    <div><p className="font-medium text-sm">{acc.email_address}</p>{acc.display_name && <p className="text-xs text-muted-foreground">{acc.display_name}</p>}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{acc.smtp_host}:{acc.smtp_port}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={(acc.sent_today / acc.daily_limit) * 100} className="h-2 w-20" />
                      <p className="text-xs text-muted-foreground">{acc.sent_today}/{acc.daily_limit}</p>
                    </div>
                  </TableCell>
                  <TableCell><Switch checked={acc.is_active} onCheckedChange={v => toggleAccount.mutate({ id: acc.id, is_active: v })} /></TableCell>
                  <TableCell><Switch checked={acc.warmup_enabled} onCheckedChange={v => toggleWarmup.mutate({ id: acc.id, warmup_enabled: v })} /></TableCell>
                  <TableCell><Badge variant="outline">{acc.rotation_weight}x</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => deleteAccount.mutate(acc.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No email accounts configured. Add your first SMTP account to start.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader><CardTitle className="text-lg">How Inbox Rotation Works</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/30"><p className="font-medium text-foreground mb-1">🔄 Round-Robin</p><p>Emails rotate across accounts based on weight. Higher weight = more emails from that account.</p></div>
            <div className="p-3 rounded-lg bg-muted/30"><p className="font-medium text-foreground mb-1">📊 Daily Limits</p><p>Each account respects its daily limit. When reached, it's skipped until the next day.</p></div>
            <div className="p-3 rounded-lg bg-muted/30"><p className="font-medium text-foreground mb-1">🔥 Auto Warmup</p><p>Enable warmup to gradually increase volume from 5/day, ramping up safely over weeks.</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
