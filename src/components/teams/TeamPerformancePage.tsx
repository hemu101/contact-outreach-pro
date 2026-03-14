import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Plus, Trophy, Mail, MessageSquare, Calendar, DollarSign, TrendingUp, Trash2, Send, UserPlus, Star, Target, Clock, Award } from 'lucide-react';
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
  phone?: string;
  department?: string;
  title?: string;
  notes?: string;
  avatar_url?: string;
  joined_at?: string;
}

const CHART_COLORS = ['hsl(var(--primary))', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

export function TeamPerformancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('overview');
  const [form, setForm] = useState({
    member_name: '', member_email: '', role: 'sdr',
    phone: '', department: '', title: '', notes: '',
  });

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
      const { error } = await (supabase as any).from('team_members').insert({ 
        ...form, user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team member added', description: `${form.member_name} has been added to the team` });
      setAddOpen(false);
      setForm({ member_name: '', member_email: '', role: 'sdr', phone: '', department: '', title: '', notes: '' });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members'] }); toast({ title: 'Member removed' }); },
  });

  const totalEmails = members.reduce((s, m) => s + m.emails_sent, 0);
  const totalReplies = members.reduce((s, m) => s + m.replies_received, 0);
  const totalMeetings = members.reduce((s, m) => s + m.meetings_booked, 0);
  const totalDeals = members.reduce((s, m) => s + m.deals_created, 0);
  const totalPipeline = members.reduce((s, m) => s + Number(m.pipeline_generated), 0);
  const replyRate = totalEmails > 0 ? ((totalReplies / totalEmails) * 100).toFixed(1) : '0';
  const meetingRate = totalReplies > 0 ? ((totalMeetings / totalReplies) * 100).toFixed(1) : '0';
  const avgPipelinePerRep = members.length > 0 ? Math.round(totalPipeline / members.length) : 0;

  const barData = members.map(m => ({
    name: m.member_name.split(' ')[0],
    emails: m.emails_sent, replies: m.replies_received, meetings: m.meetings_booked,
  }));

  const radarData = members.map(m => ({
    name: m.member_name.split(' ')[0],
    Emails: Math.min((m.emails_sent / Math.max(totalEmails, 1)) * 100, 100),
    Replies: Math.min((m.replies_received / Math.max(totalReplies, 1)) * 100, 100),
    Meetings: Math.min((m.meetings_booked / Math.max(totalMeetings, 1)) * 100, 100),
    Pipeline: Math.min((Number(m.pipeline_generated) / Math.max(totalPipeline, 1)) * 100, 100),
  }));

  const roleDistribution = (() => {
    const roles: Record<string, number> = {};
    members.forEach(m => { roles[m.role] = (roles[m.role] || 0) + 1; });
    return Object.entries(roles).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  })();

  const performanceScores = members.map(m => {
    const emailScore = Math.min((m.emails_sent / 100) * 25, 25);
    const replyScore = m.emails_sent > 0 ? Math.min((m.replies_received / m.emails_sent) * 100, 25) : 0;
    const meetingScore = Math.min((m.meetings_booked / 10) * 25, 25);
    const pipelineScore = Math.min((Number(m.pipeline_generated) / 50000) * 25, 25);
    return { ...m, score: Math.round(emailScore + replyScore + meetingScore + pipelineScore) };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Performance</h1>
          <p className="text-muted-foreground mt-1">Track rep-level metrics, leaderboard & team analytics</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><UserPlus className="w-4 h-4 mr-2" />Add Team Member</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input value={form.member_name} onChange={e => setForm(f => ({ ...f, member_name: e.target.value }))} placeholder="John Smith" /></div>
                <div><Label>Email *</Label><Input value={form.member_email} onChange={e => setForm(f => ({ ...f, member_email: e.target.value }))} placeholder="john@company.com" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sdr">SDR</SelectItem>
                      <SelectItem value="ae">Account Executive</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="bdr">BDR</SelectItem>
                      <SelectItem value="csm">CSM</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1234567890" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Sales" /></div>
                <div><Label>Job Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Senior SDR" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes about this team member..." rows={2} /></div>
              <Button onClick={() => addMember.mutate()} className="w-full" disabled={!form.member_name || !form.member_email}>
                <UserPlus className="w-4 h-4 mr-2" />Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Team Size', value: members.length, icon: Users, color: 'text-primary' },
          { label: 'Emails Sent', value: totalEmails.toLocaleString(), icon: Mail, color: 'text-blue-400' },
          { label: 'Replies', value: totalReplies, icon: MessageSquare, color: 'text-green-400' },
          { label: 'Reply Rate', value: `${replyRate}%`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Meetings', value: totalMeetings, icon: Calendar, color: 'text-purple-400' },
          { label: 'Meeting Rate', value: `${meetingRate}%`, icon: Target, color: 'text-cyan-400' },
          { label: 'Deals', value: totalDeals, icon: Award, color: 'text-yellow-400' },
          { label: 'Pipeline', value: `$${totalPipeline.toLocaleString()}`, icon: DollarSign, color: 'text-amber-400' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/50 bg-card/80">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeAnalyticsTab} onValueChange={setActiveAnalyticsTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Scores</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {members.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-base">Activity Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" /><YAxis stroke="hsl(var(--muted-foreground))" /><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} /><Legend /><Bar dataKey="emails" fill="hsl(var(--primary))" /><Bar dataKey="replies" fill="#22c55e" /><Bar dataKey="meetings" fill="#a855f7" /></BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-base">Role Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                        {roleDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No team members yet. Add your first rep to see analytics.</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceScores.map((m, i) => (
              <Card key={m.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-gray-300/20 text-gray-400' : i === 2 ? 'bg-amber-600/20 text-amber-600' : 'bg-secondary text-muted-foreground'}`}>
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{m.member_name}</p>
                        <Badge variant="outline" className="text-[10px]">{m.role.toUpperCase()}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{m.score}</p>
                      <p className="text-[10px] text-muted-foreground">/ 100</p>
                    </div>
                  </div>
                  <Progress value={m.score} className="h-2 mb-3" />
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>📧 {m.emails_sent} emails</div>
                    <div>💬 {m.replies_received} replies</div>
                    <div>📅 {m.meetings_booked} meetings</div>
                    <div>💰 ${Number(m.pipeline_generated).toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />Leaderboard</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead><TableHead>Name</TableHead><TableHead>Role</TableHead>
                    <TableHead>Emails</TableHead><TableHead>Replies</TableHead><TableHead>Reply %</TableHead>
                    <TableHead>Meetings</TableHead><TableHead>Deals</TableHead><TableHead>Pipeline</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
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
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ open: true, id: m.id, name: m.member_name })}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {members.length === 0 && <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">No team members yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        title="Remove Team Member?"
        description={`Are you sure you want to remove ${deleteConfirm.name} from the team?`}
        confirmLabel="Yes, remove"
        onConfirm={() => { deleteMember.mutate(deleteConfirm.id); setDeleteConfirm({ open: false, id: '', name: '' }); }}
      />
    </div>
  );
}
