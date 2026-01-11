import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Instagram, 
  Music2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Shield,
  Key,
  Plus,
  Clock,
  Settings2,
  Zap,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Calendar,
  Timer,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  display_name: string | null;
  status: string;
  daily_limit: number;
  messages_sent_today: number;
  send_delay_min: number;
  send_delay_max: number;
  active_hours_start: number;
  active_hours_end: number;
  is_primary: boolean;
  cooldown_until: string | null;
  error_message: string | null;
  created_at: string;
}

export function DMAccountSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'instagram' | 'tiktok'>('instagram');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(true);

  // Fetch accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['social-accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data as SocialAccount[];
    },
    enabled: !!user,
  });

  const instagramAccounts = accounts.filter(a => a.platform === 'instagram');
  const tiktokAccounts = accounts.filter(a => a.platform === 'tiktok');
  const totalDailyLimit = accounts.reduce((sum, a) => sum + a.daily_limit, 0);
  const totalSentToday = accounts.reduce((sum, a) => sum + a.messages_sent_today, 0);

  // Add account mutation
  const addAccount = useMutation({
    mutationFn: async ({ platform, username }: { platform: string; username: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('social_accounts')
        .insert({
          user_id: user.id,
          platform,
          username,
          is_primary: platform === 'instagram' ? instagramAccounts.length === 0 : tiktokAccounts.length === 0,
          // Smart defaults for avoiding blocks
          daily_limit: 50,
          send_delay_min: 60,
          send_delay_max: 180,
          active_hours_start: 9,
          active_hours_end: 21,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast({ title: 'Account connected!', description: `@${data.username} is ready for DM outreach` });
      setNewUsername('');
      setShowAddForm(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to connect', description: error.message, variant: 'destructive' });
    },
  });

  // Update account mutation
  const updateAccount = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SocialAccount> }) => {
      const { error } = await supabase
        .from('social_accounts')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast({ title: 'Settings updated' });
    },
  });

  // Delete account mutation
  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast({ title: 'Account disconnected' });
    },
  });

  // Reset daily counters
  const resetCounters = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('social_accounts')
        .update({ messages_sent_today: 0 })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast({ title: 'Counters reset', description: 'Daily message counts have been reset' });
    },
  });

  const handleConnect = async () => {
    if (!newUsername.trim()) return;
    setIsConnecting(true);
    // Simulate connection verification
    await new Promise(r => setTimeout(r, 1500));
    addAccount.mutate({ platform: activeTab, username: newUsername.trim() });
    setIsConnecting(false);
  };

  const setPrimary = (id: string, platform: string) => {
    const platformAccounts = accounts.filter(a => a.platform === platform);
    platformAccounts.forEach(acc => {
      if (acc.is_primary) {
        updateAccount.mutate({ id: acc.id, updates: { is_primary: false } });
      }
    });
    updateAccount.mutate({ id, updates: { is_primary: true } });
  };

  const getScheduleDescription = (account: SocialAccount) => {
    const formatHour = (h: number) => {
      if (h === 0) return '12 AM';
      if (h === 12) return '12 PM';
      return h < 12 ? `${h} AM` : `${h - 12} PM`;
    };
    return `${formatHour(account.active_hours_start)} - ${formatHour(account.active_hours_end)}`;
  };

  const renderAccountCard = (account: SocialAccount) => {
    const isRateLimited = account.status === 'rate_limited';
    const hasError = account.status === 'error';
    const isCooldown = account.cooldown_until && new Date(account.cooldown_until) > new Date();
    const usagePercent = (account.messages_sent_today / account.daily_limit) * 100;
    const isNearLimit = usagePercent > 80;

    return (
      <div 
        key={account.id}
        className={`p-4 rounded-xl border transition-all ${
          isCooldown ? 'border-blue-500/50 bg-blue-500/5' :
          isRateLimited ? 'border-warning/50 bg-warning/5' :
          hasError ? 'border-destructive/50 bg-destructive/5' :
          'border-border bg-card/50'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              account.platform === 'instagram' 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : 'bg-black'
            }`}>
              {account.platform === 'instagram' 
                ? <Instagram className="h-5 w-5 text-white" />
                : <Music2 className="h-5 w-5 text-white" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">@{account.username}</span>
                {account.is_primary && (
                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {account.status === 'connected' && !isCooldown && (
                  <Badge variant="outline" className="text-success border-success/50 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </Badge>
                )}
                {isCooldown && (
                  <Badge variant="outline" className="text-blue-500 border-blue-500/50 text-xs">
                    <Timer className="w-3 h-3 mr-1" /> Cooldown
                  </Badge>
                )}
                {isRateLimited && (
                  <Badge variant="outline" className="text-warning border-warning/50 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Rate Limited
                  </Badge>
                )}
                {hasError && (
                  <Badge variant="outline" className="text-destructive border-destructive/50 text-xs">
                    <XCircle className="w-3 h-3 mr-1" /> Error
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!account.is_primary && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setPrimary(account.id, account.platform)}
              >
                Set Primary
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => deleteAccount.mutate(account.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Usage</span>
            <span className={`font-medium ${isNearLimit ? 'text-warning' : ''}`}>
              {account.messages_sent_today}/{account.daily_limit}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                usagePercent > 90 ? 'bg-destructive' :
                usagePercent > 80 ? 'bg-warning' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Schedule Info */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Active: {getScheduleDescription(account)}</span>
          <span className="mx-1">•</span>
          <Timer className="w-3 h-3" />
          <span>Delay: {account.send_delay_min}s - {account.send_delay_max}s</span>
        </div>

        {/* Settings */}
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Daily Limit</Label>
              <Input
                type="number"
                value={account.daily_limit}
                onChange={(e) => updateAccount.mutate({ 
                  id: account.id, 
                  updates: { daily_limit: parseInt(e.target.value) || 50 }
                })}
                className="h-8 mt-1"
                min={10}
                max={200}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Recommended: 30-50/day</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Active Hours</Label>
              <div className="flex items-center gap-1 mt-1">
                <Input
                  type="number"
                  value={account.active_hours_start}
                  onChange={(e) => updateAccount.mutate({ 
                    id: account.id, 
                    updates: { active_hours_start: parseInt(e.target.value) || 9 }
                  })}
                  className="h-8 w-16"
                  min={0}
                  max={23}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  value={account.active_hours_end}
                  onChange={(e) => updateAccount.mutate({ 
                    id: account.id, 
                    updates: { active_hours_end: parseInt(e.target.value) || 21 }
                  })}
                  className="h-8 w-16"
                  min={0}
                  max={23}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Message Delay (seconds): {account.send_delay_min}s - {account.send_delay_max}s
            </Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-1">Min Delay</p>
                <Slider
                  value={[account.send_delay_min]}
                  min={30}
                  max={300}
                  step={10}
                  onValueChange={([v]) => updateAccount.mutate({ 
                    id: account.id, 
                    updates: { send_delay_min: v }
                  })}
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-1">Max Delay</p>
                <Slider
                  value={[account.send_delay_max]}
                  min={60}
                  max={600}
                  step={10}
                  onValueChange={([v]) => updateAccount.mutate({ 
                    id: account.id, 
                    updates: { send_delay_max: v }
                  })}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Random delays between messages to mimic human behavior
            </p>
          </div>
        </div>

        {hasError && account.error_message && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{account.error_message}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderPlatformTab = (platform: 'instagram' | 'tiktok', platformAccounts: SocialAccount[]) => (
    <div className="space-y-4">
      {platformAccounts.length > 0 ? (
        <div className="space-y-3">
          {platformAccounts.map(renderAccountCard)}
        </div>
      ) : !showAddForm && (
        <div className="text-center py-8 border border-dashed border-border rounded-xl">
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
            platform === 'instagram' 
              ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
              : 'bg-secondary'
          }`}>
            {platform === 'instagram' 
              ? <Instagram className="h-6 w-6 text-pink-500" />
              : <Music2 className="h-6 w-6" />
            }
          </div>
          <p className="text-muted-foreground mb-3">No {platform === 'instagram' ? 'Instagram' : 'TikTok'} accounts connected</p>
          <Button onClick={() => setShowAddForm(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      )}

      {(showAddForm || platformAccounts.length > 0) && (
        <div className="pt-4 border-t border-border">
          {showAddForm ? (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Secure Multi-Account Setup</AlertTitle>
                <AlertDescription>
                  Add multiple accounts to distribute sending load and avoid rate limits. 
                  Accounts are rotated automatically with smart scheduling.
                </AlertDescription>
              </Alert>
              <div>
                <Label>Username</Label>
                <Input
                  placeholder="your_username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConnect} disabled={isConnecting || !newUsername.trim()} className="flex-1">
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      {platform === 'instagram' ? <Instagram className="mr-2 h-4 w-4" /> : <Music2 className="mr-2 h-4 w-4" />}
                      Connect Account
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Account
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              DM Account Setup
            </CardTitle>
            <CardDescription>
              Connect multiple accounts with smart scheduling to prevent blocking
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => resetCounters.mutate()}
            disabled={resetCounters.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${resetCounters.isPending ? 'animate-spin' : ''}`} />
            Reset Counters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <p className="text-2xl font-bold">{accounts.length}</p>
            <p className="text-xs text-muted-foreground">Total Accounts</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">
              {accounts.filter(a => a.status === 'connected').length}
            </p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-warning/10">
            <p className="text-2xl font-bold text-warning">{totalSentToday}</p>
            <p className="text-xs text-muted-foreground">Sent Today</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <p className="text-2xl font-bold text-primary">{totalDailyLimit}</p>
            <p className="text-xs text-muted-foreground">Daily Capacity</p>
          </div>
        </div>

        {/* Account Rotation Settings */}
        <div className="mb-6 p-4 rounded-lg bg-secondary/20 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">Account Rotation</span>
            </div>
            <Switch
              checked={rotationEnabled}
              onCheckedChange={setRotationEnabled}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {rotationEnabled 
              ? 'Messages are distributed across accounts to avoid detection'
              : 'Only primary account will be used for sending'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'instagram' | 'tiktok'); setShowAddForm(false); }}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram ({instagramAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2">
              <Music2 className="h-4 w-4" />
              TikTok ({tiktokAccounts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instagram">
            {renderPlatformTab('instagram', instagramAccounts)}
          </TabsContent>

          <TabsContent value="tiktok">
            {renderPlatformTab('tiktok', tiktokAccounts)}
          </TabsContent>
        </Tabs>

        {/* Smart Scheduling Tips */}
        <Alert className="mt-6">
          <Zap className="h-4 w-4" />
          <AlertTitle>Smart Anti-Block Protection</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Your messages are protected with:</p>
            <ul className="text-sm space-y-1 mt-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Random delays between messages (mimics human behavior)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Account rotation to distribute load
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Active hours scheduling (no overnight sending)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Daily limits per account to stay under radar
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
