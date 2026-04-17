import { useEffect, useState } from 'react';
import { User, Users, LogOut, Settings as SettingsIcon, Shield, Mail, Plus, Trash2, Loader2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  job_title: string | null;
  company: string | null;
  timezone: string | null;
  bio: string | null;
}

interface TeamMember {
  id: string;
  member_email: string;
  member_name: string | null;
  role: string;
  status: string;
  permissions: any;
  invited_at: string;
  joined_at: string | null;
}

export function ProfileMenu() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const initials = (profile?.full_name || user?.email || 'U')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    setProfile((data as any) ?? { id: user.id, email: user.email });
  };

  const loadTeam = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('owner_id', user.id)
      .order('invited_at', { ascending: false });
    setTeam((data ?? []) as TeamMember[]);
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (showTeam) loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTeam]);

  const saveProfile = async () => {
    if (!user || !profile) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      phone: profile.phone,
      job_title: profile.job_title,
      company: profile.company,
      timezone: profile.timezone,
      bio: profile.bio,
    });
    setSavingProfile(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Profile updated' });
    }
  };

  const inviteMember = async () => {
    if (!user || !newEmail.trim()) return;
    setInviting(true);
    const { error } = await supabase.from('team_members').insert({
      owner_id: user.id,
      member_email: newEmail.trim(),
      member_name: newName.trim() || null,
      role: newRole,
      status: 'invited',
      permissions: rolePermissions(newRole),
      invitation_token: crypto.randomUUID(),
    });
    setInviting(false);
    if (error) {
      toast({ title: 'Invite failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Invitation sent', description: `Invited ${newEmail}` });
      setNewEmail('');
      setNewName('');
      loadTeam();
    }
  };

  const removeMember = async (id: string) => {
    await supabase.from('team_members').delete().eq('id', id);
    toast({ title: 'Member removed' });
    loadTeam();
  };

  const updateRole = async (id: string, role: string) => {
    await supabase.from('team_members').update({ role, permissions: rolePermissions(role) }).eq('id', id);
    loadTeam();
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2" aria-label="Profile">
            <Avatar className="w-6 h-6">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0">
          <div className="p-3 border-b flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              {isAdmin && (
                <Badge variant="secondary" className="mt-1 text-[10px] h-4">
                  <Shield className="w-2.5 h-2.5 mr-1" /> Admin
                </Badge>
              )}
            </div>
          </div>
          <div className="p-2">
            <button
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left text-sm"
              onClick={() => {
                setOpen(false);
                setShowProfile(true);
              }}
            >
              <User className="w-4 h-4 text-primary" />
              <span>👤 Profile Settings</span>
            </button>
            <button
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left text-sm"
              onClick={() => {
                setOpen(false);
                setShowTeam(true);
              }}
            >
              <Users className="w-4 h-4 text-primary" />
              <span>👥 Team Members</span>
            </button>
            <button
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left text-sm"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
            >
              <LogOut className="w-4 h-4 text-destructive" />
              <span>🚪 Sign Out</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Profile Settings Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>👤 Profile Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Personal Info</TabsTrigger>
              <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Full Name</Label>
                  <Input value={profile?.full_name ?? ''} onChange={(e) => setProfile((p) => ({ ...p!, full_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={profile?.phone ?? ''} onChange={(e) => setProfile((p) => ({ ...p!, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Job Title</Label>
                  <Input value={profile?.job_title ?? ''} onChange={(e) => setProfile((p) => ({ ...p!, job_title: e.target.value }))} />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={profile?.company ?? ''} onChange={(e) => setProfile((p) => ({ ...p!, company: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <Label>Avatar URL</Label>
                  <Input value={profile?.avatar_url ?? ''} onChange={(e) => setProfile((p) => ({ ...p!, avatar_url: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <Label>Timezone</Label>
                  <Input value={profile?.timezone ?? ''} onChange={(e) => setProfile((p) => ({ ...p!, timezone: e.target.value }))} placeholder="e.g. America/New_York" />
                </div>
                <div className="col-span-2">
                  <Label>Bio</Label>
                  <Textarea value={profile?.bio ?? ''} onChange={(e) => setProfile((p) => ({ ...p!, bio: e.target.value }))} rows={3} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="account" className="space-y-3 mt-4">
              <div>
                <Label>Email</Label>
                <Input value={user?.email ?? ''} disabled />
                <p className="text-xs text-muted-foreground mt-1">Contact support to change your email.</p>
              </div>
              <div>
                <Label>User ID</Label>
                <Input value={user?.id ?? ''} disabled className="font-mono text-xs" />
              </div>
              {isAdmin && (
                <div className="rounded-md border bg-accent/30 p-3 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" /> You have admin access — you can edit docs and manage all data.
                </div>
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowProfile(false)}>Close</Button>
            <Button onClick={saveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Members Dialog */}
      <Dialog open={showTeam} onOpenChange={setShowTeam}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>👥 Team Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-3 bg-accent/20">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Invite a team member
              </p>
              <div className="grid grid-cols-12 gap-2">
                <Input className="col-span-5" placeholder="email@company.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                <Input className="col-span-3" placeholder="Name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="col-span-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="col-span-2" onClick={inviteMember} disabled={inviting || !newEmail.trim()}>
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="border rounded-lg divide-y max-h-80 overflow-auto">
              {team.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <span className="text-2xl">👋</span>
                  <p className="mt-2">No team members yet. Invite your first teammate above!</p>
                </div>
              ) : (
                team.map((m) => (
                  <div key={m.id} className="p-3 flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{(m.member_name || m.member_email)[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.member_name || m.member_email}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.member_email}</p>
                    </div>
                    <Badge variant={m.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {m.status === 'active' ? '✅ Active' : '⏳ Invited'}
                    </Badge>
                    <Select value={m.role} onValueChange={(v) => updateRole(m.id, v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMember(m.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function rolePermissions(role: string) {
  switch (role) {
    case 'admin':
      return { contacts: 'write', campaigns: 'write', templates: 'write', settings: 'write', team: 'write' };
    case 'member':
      return { contacts: 'write', campaigns: 'write', templates: 'write', settings: 'read', team: 'read' };
    case 'viewer':
    default:
      return { contacts: 'read', campaigns: 'read', templates: 'read', settings: 'read', team: 'read' };
  }
}
