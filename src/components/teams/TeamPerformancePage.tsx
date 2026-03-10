import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Users, Plus, Trophy, Mail, MessageSquare, Calendar, DollarSign, TrendingUp, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  member_email: string;
  member_name: string;
  role: string;
  emails_sent: number;
  replies_received: number;
  meetings_booked: number;
  deals_created: number;
  pipeline_generated: number;
  is_active: boolean;
}

export function TeamPerformancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ member_name: '', member_email: '', role: 'sdr' });

  const { data: members = [] } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any).from('team_members').select('*').eq('user_id', user.id).order('created_at');
      if (error) throw error;
      return (data || []) as TeamMember[];
    },
    enabled: !!user,
  });

  const addMember = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('team_members').insert({ ...form, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team member added' });
      setAddOpen(false);
      setForm({ member_name: '', member_email: '', role: 'sdr' });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members'] }); toast({ title: 'Member removed' }); },
  });

  const totalEmails = members.reduce((s, m) => s + m.emails_sent, 0);
  const totalReplies = members.reduce((s, m) => s + m.replies_received, 0);
  const totalMeetings = members.reduce((s, m) => s + m.meetings_booked, 0);
  const totalPipeline = members.reduce((s, m) => s + Number(m.pipeline_generated), 0);

  const barData = members.map(m => ({
    name: m.member_name.split(' ')[0],
    emails: m.emails_sent,
    replies: m.replies_received,
    meetings: m.meetings_booked,
  }));

  const radarData = members.map(m => ({
    name: m.member_name.split(' ')[0],
    Emails: Math.min((m.emails_sent / Math.max(totalEmails, 1)) * 100, 100),
    Replies: Math.min((m.replies_received / Math.max(totalReplies, 1)) * 100, 100),
    Meetings: Math.min((m.meetings_booked / Math.max(totalMeetings, 1)) * 100, 100),
    Pipeline: Math.min((Number(m.pipeline_generated) / Math.max(totalPipeline, 1)) * 100, 100),
  }));

  const replyRate = totalEmails > 0 ? ((totalReplies / totalEmails) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-foreground">Team Performance</h1><p className="text-muted-foreground mt-1">Track rep-level metrics and leaderboard</p></div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Member</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.member_name} onChange={e => setForm(f => ({ ...f, member_name: e.target.value }))} placeholder="John Smith" /></div>
              <div><Label>Email</Label><Input value={form.member_email} onChange={e => setForm(f => ({ ...f, member_email: e.target.value }))} placeholder="john@company.com" /></div>
              <div><Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="sdr">SDR</SelectItem><SelectItem value="ae">AE</SelectItem><SelectItem value="manager">Manager</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={() => addMember.mutate()} className="w-full">Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{members.length}</p><p className="text-xs text-muted-foreground">Team Size</p></div></div></CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><Mail className="w-8 h-8 text-blue-400" /><div><p className="text-2xl font-bold">{totalEmails.toLocaleString()}</p><p className="text-xs text-muted-foreground">Emails Sent</p></div></div></CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><MessageSquare className="w-8 h-8 text-green-400" /><div><p className="text-2xl font-bold">{replyRate}%</p><p className="text-xs text-muted-foreground">Reply Rate</p></div></div></CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><Calendar className="w-8 h-8 text-purple-400" /><div><p className="text-2xl font-bold">{totalMeetings}</p><p className="text-xs text-muted-foreground">Meetings Booked</p></div></div></CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-yellow-400" /><div><p className="text-2xl font-bold">${totalPipeline.toLocaleString()}</p><p className="text-xs text-muted-foreground">Pipeline</p></div></div></CardContent></Card>
      </div>

      {/* Charts */}
      {members.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-base">Activity Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" /><YAxis stroke="hsl(var(--muted-foreground))" /><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} /><Legend /><Bar dataKey="emails" fill="hsl(var(--primary))" /><Bar dataKey="replies" fill="#22c55e" /><Bar dataKey="meetings" fill="#a855f7" /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-base">Performance Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={[{ metric: 'Emails', ...Object.fromEntries(radarData.map(r => [r.name, r.Emails])) }, { metric: 'Replies', ...Object.fromEntries(radarData.map(r => [r.name, r.Replies])) }, { metric: 'Meetings', ...Object.fromEntries(radarData.map(r => [r.name, r.Meetings])) }, { metric: 'Pipeline', ...Object.fromEntries(radarData.map(r => [r.name, r.Pipeline])) }]}>
                  <PolarGrid stroke="hsl(var(--border))" /><PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" /><PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                  {radarData.map((r, i) => <Radar key={r.name} name={r.name} dataKey={r.name} stroke={['hsl(var(--primary))', '#22c55e', '#a855f7', '#f59e0b'][i % 4]} fill={['hsl(var(--primary))', '#22c55e', '#a855f7', '#f59e0b'][i % 4]} fillOpacity={0.15} />)}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Emails</TableHead><TableHead>Replies</TableHead><TableHead>Reply %</TableHead><TableHead>Meetings</TableHead><TableHead>Deals</TableHead><TableHead>Pipeline</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {[...members].sort((a, b) => b.meetings_booked - a.meetings_booked).map((m, i) => {
                const rr = m.emails_sent > 0 ? ((m.replies_received / m.emails_sent) * 100).toFixed(1) : '0';
                return (
                  <TableRow key={m.id}>
                    <TableCell><span className={i === 0 ? 'text-yellow-400 font-bold' : i === 1 ? 'text-gray-300 font-bold' : i === 2 ? 'text-amber-600 font-bold' : 'text-muted-foreground'}>#{i + 1}</span></TableCell>
                    <TableCell className="font-medium">{m.member_name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs uppercase">{m.role}</Badge></TableCell>
                    <TableCell>{m.emails_sent}</TableCell>
                    <TableCell>{m.replies_received}</TableCell>
                    <TableCell><span className={Number(rr) >= 10 ? 'text-green-400' : 'text-muted-foreground'}>{rr}%</span></TableCell>
                    <TableCell>{m.meetings_booked}</TableCell>
                    <TableCell>{m.deals_created}</TableCell>
                    <TableCell className="font-medium">${Number(m.pipeline_generated).toLocaleString()}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => deleteMember.mutate(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                );
              })}
              {members.length === 0 && <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">No team members. Add your first rep to start tracking.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
