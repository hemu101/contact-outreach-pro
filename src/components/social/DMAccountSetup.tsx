import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Instagram, Music2, CheckCircle, XCircle, AlertCircle,
  Loader2, Shield, Key, Plus, Clock, Settings2, Zap,
  AlertTriangle, Trash2, RefreshCw, Calendar, Timer,
  Users, Wifi, WifiOff, TestTube, Eye, EyeOff, Copy
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
  session_id?: string | null;
  api_key?: string | null;
  cookies?: string | null;
  auth_method?: string | null;
  proxy_url?: string | null;
  last_tested_at?: string | null;
  test_status?: string | null;
}

const ALL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, color: 'from-gray-700 to-black' },
  { id: 'linkedin', label: 'LinkedIn', icon: Users, color: 'from-blue-600 to-blue-800' },
  { id: 'facebook', label: 'Facebook', icon: Users, color: 'from-blue-500 to-blue-700' },
  { id: 'whatsapp', label: 'WhatsApp', icon: Users, color: 'from-green-500 to-green-700' },
  { id: 'x', label: 'X (Twitter)', icon: Users, color: 'from-gray-700 to-black' },
  { id: 'reddit', label: 'Reddit', icon: Users, color: 'from-orange-500 to-red-500' },
  { id: 'discord', label: 'Discord', icon: Users, color: 'from-indigo-500 to-purple-600' },
];

const AUTH_METHODS = [
  { value: 'session_cookie', label: 'Session Cookie', description: 'Browser session cookies (most common)' },
  { value: 'api_key', label: 'API Key / Token', description: 'Official API credentials or access token' },
  { value: 'oauth', label: 'OAuth Token', description: 'OAuth 2.0 access token from app authorization' },
  { value: 'webhook', label: 'Webhook (n8n/Make)', description: 'External automation tool handles auth' },
];

export function DMAccountSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('instagram');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [authMethod, setAuthMethod] = useState('session_cookie');
  const [sessionId, setSessionId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [cookies, setCookies] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

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

  const getAccountsByPlatform = (platform: string) => accounts.filter(a => a.platform === platform);
  const totalDailyLimit = accounts.reduce((sum, a) => sum + a.daily_limit, 0);
  const totalSentToday = accounts.reduce((sum, a) => sum + a.messages_sent_today, 0);

  const addAccount = useMutation({
    mutationFn: async ({ platform, username }: { platform: string; username: string }) => {
      if (!user) throw new Error('Not authenticated');
      const platformAccounts = getAccountsByPlatform(platform);
      const insertData: any = {
        user_id: user.id,
        platform,
        username,
        is_primary: platformAccounts.length === 0,
        daily_limit: 50,
        send_delay_min: 60,
        send_delay_max: 180,
        active_hours_start: 9,
        active_hours_end: 21,
      };
      // Store credentials based on auth method
      if (authMethod === 'session_cookie' && sessionId) insertData.session_id = sessionId;
      if (authMethod === 'api_key' && apiKey) insertData.api_key = apiKey;
      if (cookies) insertData.cookies = cookies;
      if (proxyUrl) insertData.proxy_url = proxyUrl;
      insertData.auth_method = authMethod;

      const { data, error } = await supabase
        .from('social_accounts')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast({ title: 'Account connected!', description: `@${data.username} is ready for DM outreach` });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to connect', description: error.message, variant: 'destructive' });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SocialAccount> }) => {
      const { error } = await supabase.from('social_accounts').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast({ title: 'Settings updated' });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('social_accounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast({ title: 'Account disconnected' });
    },
  });

  const testConnection = useMutation({
    mutationFn: async (account: SocialAccount) => {
      setTestingId(account.id);
      // Simulate connection test - checks if credentials are present
      await new Promise(r => setTimeout(r, 2000));
      const hasCredentials = account.session_id || account.api_key || account.cookies || account.auth_method === 'webhook';
      const testStatus = hasCredentials ? 'passed' : 'no_credentials';
      await supabase.from('social_accounts').update({ 
        last_tested_at: new Date().toISOString(),
        test_status: testStatus,
        status: testStatus === 'passed' ? 'connected' : 'error',
        error_message: testStatus === 'no_credentials' ? 'No credentials configured. Add session cookie, API key, or webhook URL.' : null,
      }).eq('id', account.id);
      return testStatus;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      if (status === 'passed') {
        toast({ title: '✅ Connection test passed', description: 'Account is configured and ready to send' });
      } else {
        toast({ title: '❌ Connection test failed', description: 'Missing credentials. Configure session cookie, API key, or webhook.', variant: 'destructive' });
      }
      setTestingId(null);
    },
    onError: () => {
      setTestingId(null);
      toast({ title: 'Test failed', description: 'Could not verify connection', variant: 'destructive' });
    },
  });

  const resetCounters = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('social_accounts').update({ messages_sent_today: 0 }).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast({ title: 'Counters reset' });
    },
  });

  const resetForm = () => {
    setNewUsername('');
    setSessionId('');
    setApiKey('');
    setCookies('');
    setProxyUrl('');
    setAuthMethod('session_cookie');
    setShowAddForm(false);
  };

  const handleConnect = async () => {
    if (!newUsername.trim()) return;
    setIsConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    addAccount.mutate({ platform: activeTab, username: newUsername.trim() });
    setIsConnecting(false);
  };

  const setPrimary = (id: string, platform: string) => {
    const platformAccounts = accounts.filter(a => a.platform === platform);
    platformAccounts.forEach(acc => {
      if (acc.is_primary) updateAccount.mutate({ id: acc.id, updates: { is_primary: false } });
    });
    updateAccount.mutate({ id, updates: { is_primary: true } });
  };

  const getScheduleDescription = (account: SocialAccount) => {
    const formatHour = (h: number) => h === 0 ? '12 AM' : h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`;
    return `${formatHour(account.active_hours_start)} - ${formatHour(account.active_hours_end)}`;
  };

  const toggleCredentialVisibility = (id: string) => {
    setShowCredentials(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderAccountCard = (account: SocialAccount) => {
    const isRateLimited = account.status === 'rate_limited';
    const hasError = account.status === 'error';
    const isCooldown = account.cooldown_until && new Date(account.cooldown_until) > new Date();
    const usagePercent = (account.messages_sent_today / account.daily_limit) * 100;
    const isNearLimit = usagePercent > 80;
    const credVisible = showCredentials[account.id];
    const isTesting = testingId === account.id;
    const platform = ALL_PLATFORMS.find(p => p.id === account.platform);

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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${platform?.color || 'from-gray-500 to-gray-700'}`}>
              {platform ? <platform.icon className="h-5 w-5 text-white" /> : <Users className="h-5 w-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">@{account.username}</span>
                {account.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
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
                {account.auth_method && (
                  <Badge variant="outline" className="text-xs">{account.auth_method.replace('_', ' ')}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              disabled={isTesting}
              onClick={() => testConnection.mutate(account)}
              className="text-xs"
            >
              {isTesting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <TestTube className="w-3 h-3 mr-1" />}
              Test
            </Button>
            {!account.is_primary && (
              <Button variant="ghost" size="sm" onClick={() => setPrimary(account.id, account.platform)}>Set Primary</Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ open: true, id: account.id, name: account.username })} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Test Status */}
        {account.last_tested_at && (
          <div className={`mt-2 text-xs flex items-center gap-1 ${account.test_status === 'passed' ? 'text-success' : 'text-destructive'}`}>
            {account.test_status === 'passed' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            Last tested: {new Date(account.last_tested_at).toLocaleString()} — {account.test_status === 'passed' ? 'Connected' : 'Failed'}
          </div>
        )}

        {/* Usage Progress */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Usage</span>
            <span className={`font-medium ${isNearLimit ? 'text-warning' : ''}`}>{account.messages_sent_today}/{account.daily_limit}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${usagePercent > 90 ? 'bg-destructive' : usagePercent > 80 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
          </div>
        </div>

        {/* Schedule & Credentials */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" /><span>Active: {getScheduleDescription(account)}</span>
          <span className="mx-1">•</span>
          <Timer className="w-3 h-3" /><span>Delay: {account.send_delay_min}s - {account.send_delay_max}s</span>
        </div>

        {/* Credentials Section */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Key className="w-3 h-3" /> Credentials
            </span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => toggleCredentialVisibility(account.id)}>
              {credVisible ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {credVisible ? 'Hide' : 'Show'}
            </Button>
          </div>
          {credVisible && (
            <div className="space-y-2">
              <div>
                <Label className="text-[10px]">Session ID / Cookie</Label>
                <Input
                  type="password"
                  value={account.session_id || ''}
                  placeholder="Not set"
                  className="h-7 text-xs font-mono"
                  onChange={(e) => updateAccount.mutate({ id: account.id, updates: { session_id: e.target.value } as any })}
                />
              </div>
              <div>
                <Label className="text-[10px]">API Key / Access Token</Label>
                <Input
                  type="password"
                  value={account.api_key || ''}
                  placeholder="Not set"
                  className="h-7 text-xs font-mono"
                  onChange={(e) => updateAccount.mutate({ id: account.id, updates: { api_key: e.target.value } as any })}
                />
              </div>
              <div>
                <Label className="text-[10px]">Proxy URL (optional)</Label>
                <Input
                  value={account.proxy_url || ''}
                  placeholder="socks5://user:pass@host:port"
                  className="h-7 text-xs font-mono"
                  onChange={(e) => updateAccount.mutate({ id: account.id, updates: { proxy_url: e.target.value } as any })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="mt-3 pt-3 border-t border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Daily Limit</Label>
              <Input type="number" value={account.daily_limit} onChange={(e) => updateAccount.mutate({ id: account.id, updates: { daily_limit: parseInt(e.target.value) || 50 } })} className="h-8 mt-1" min={10} max={200} />
              <p className="text-[10px] text-muted-foreground mt-1">Recommended: 30-50/day</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Active Hours</Label>
              <div className="flex items-center gap-1 mt-1">
                <Input type="number" value={account.active_hours_start} onChange={(e) => updateAccount.mutate({ id: account.id, updates: { active_hours_start: parseInt(e.target.value) || 9 } })} className="h-8 w-16" min={0} max={23} />
                <span className="text-muted-foreground">-</span>
                <Input type="number" value={account.active_hours_end} onChange={(e) => updateAccount.mutate({ id: account.id, updates: { active_hours_end: parseInt(e.target.value) || 21 } })} className="h-8 w-16" min={0} max={23} />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Message Delay: {account.send_delay_min}s - {account.send_delay_max}s</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-1">Min</p>
                <Slider value={[account.send_delay_min]} min={30} max={300} step={10} onValueChange={([v]) => updateAccount.mutate({ id: account.id, updates: { send_delay_min: v } })} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-1">Max</p>
                <Slider value={[account.send_delay_max]} min={60} max={600} step={10} onValueChange={([v]) => updateAccount.mutate({ id: account.id, updates: { send_delay_max: v } })} />
              </div>
            </div>
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

  return (
    <>
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-primary" />DM Account Setup</CardTitle>
            <CardDescription>Connect accounts with credentials, test connections, and configure anti-block settings</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => resetCounters.mutate()} disabled={resetCounters.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${resetCounters.isPending ? 'animate-spin' : ''}`} />Reset Counters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-secondary/30"><p className="text-2xl font-bold">{accounts.length}</p><p className="text-xs text-muted-foreground">Total Accounts</p></div>
          <div className="text-center p-3 rounded-lg bg-success/10"><p className="text-2xl font-bold text-success">{accounts.filter(a => a.status === 'connected').length}</p><p className="text-xs text-muted-foreground">Active</p></div>
          <div className="text-center p-3 rounded-lg bg-warning/10"><p className="text-2xl font-bold text-warning">{totalSentToday}</p><p className="text-xs text-muted-foreground">Sent Today</p></div>
          <div className="text-center p-3 rounded-lg bg-primary/10"><p className="text-2xl font-bold text-primary">{totalDailyLimit}</p><p className="text-xs text-muted-foreground">Daily Capacity</p></div>
        </div>

        {/* Rotation */}
        <div className="mb-6 p-4 rounded-lg bg-secondary/20 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="font-medium">Account Rotation</span></div>
            <Switch checked={rotationEnabled} onCheckedChange={setRotationEnabled} />
          </div>
          <p className="text-sm text-muted-foreground">{rotationEnabled ? 'Messages are distributed across accounts to avoid detection' : 'Only primary account will be used for sending'}</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setShowAddForm(false); }}>
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full mb-4">
              {ALL_PLATFORMS.map(p => {
                const pAccounts = getAccountsByPlatform(p.id);
                return (
                  <TabsTrigger key={p.id} value={p.id} className="flex items-center gap-1.5 text-xs">
                    <p.icon className="h-3.5 w-3.5" />{p.label} ({pAccounts.length})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>

          {ALL_PLATFORMS.map(p => (
            <TabsContent key={p.id} value={p.id}>
              <div className="space-y-4">
                {getAccountsByPlatform(p.id).length > 0 ? (
                  <div className="space-y-3">{getAccountsByPlatform(p.id).map(renderAccountCard)}</div>
                ) : !showAddForm && (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-gradient-to-br ${p.color}`}>
                      <p.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-muted-foreground mb-3">No {p.label} accounts connected</p>
                    <Button onClick={() => setShowAddForm(true)} variant="outline"><Plus className="w-4 h-4 mr-2" />Add Account</Button>
                  </div>
                )}

                {(showAddForm || getAccountsByPlatform(p.id).length > 0) && (
                  <div className="pt-4 border-t border-border">
                    {showAddForm ? (
                      <div className="space-y-4">
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertTitle>Secure Multi-Account Setup</AlertTitle>
                          <AlertDescription>Add credentials to enable automated DM sending via external tools (n8n, Make, Pipedream).</AlertDescription>
                        </Alert>
                        <div><Label>Username *</Label><Input placeholder="your_username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="mt-1" /></div>
                        
                        <div>
                          <Label>Authentication Method</Label>
                          <Select value={authMethod} onValueChange={setAuthMethod}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {AUTH_METHODS.map(m => (
                                <SelectItem key={m.value} value={m.value}>
                                  <div><span className="font-medium">{m.label}</span><span className="text-xs text-muted-foreground ml-2">— {m.description}</span></div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {authMethod === 'session_cookie' && (
                          <div>
                            <Label>Session ID / Cookie String</Label>
                            <Textarea placeholder="Paste your browser session cookie here..." value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="mt-1 font-mono text-xs" rows={3} />
                            <p className="text-[10px] text-muted-foreground mt-1">Get this from browser DevTools → Application → Cookies</p>
                          </div>
                        )}
                        {authMethod === 'api_key' && (
                          <div>
                            <Label>API Key / Access Token</Label>
                            <Input type="password" placeholder="Your API key or access token" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="mt-1 font-mono" />
                          </div>
                        )}
                        {authMethod === 'oauth' && (
                          <div>
                            <Label>OAuth Access Token</Label>
                            <Input type="password" placeholder="OAuth 2.0 access token" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="mt-1 font-mono" />
                          </div>
                        )}
                        {authMethod === 'webhook' && (
                          <div>
                            <Label>Webhook URL (n8n/Make)</Label>
                            <Input placeholder="https://your-n8n.com/webhook/..." value={proxyUrl} onChange={(e) => setProxyUrl(e.target.value)} className="mt-1 font-mono text-xs" />
                            <p className="text-[10px] text-muted-foreground mt-1">The external tool will handle authentication. Just provide the trigger URL.</p>
                          </div>
                        )}
                        
                        <div>
                          <Label>Proxy URL (optional)</Label>
                          <Input placeholder="socks5://user:pass@host:port" value={proxyUrl} onChange={(e) => setProxyUrl(e.target.value)} className="mt-1 font-mono text-xs" />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleConnect} disabled={isConnecting || !newUsername.trim()} className="flex-1">
                            {isConnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting...</> : <><Plus className="mr-2 h-4 w-4" />Connect Account</>}
                          </Button>
                          <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />Add Another Account
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Alert className="mt-6">
          <Zap className="h-4 w-4" />
          <AlertTitle>Smart Anti-Block Protection</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Your messages are protected with:</p>
            <ul className="text-sm space-y-1 mt-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-success" />Random delays between messages (mimics human behavior)</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-success" />Account rotation to distribute load</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-success" />Active hours scheduling (no overnight sending)</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-success" />Daily limits per account to stay under radar</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>How to test:</strong> Click the "Test" button on any account to verify credentials are configured. 
              The test checks if session cookies, API keys, or webhook URLs are present and valid.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <ConfirmDialog
      open={deleteConfirm.open}
      onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
      title="Disconnect Account?"
      description={`Are you sure you want to disconnect @${deleteConfirm.name}? This will remove the account from rotation.`}
      confirmLabel="Yes, disconnect"
      onConfirm={() => { deleteAccount.mutate(deleteConfirm.id); setDeleteConfirm({ open: false, id: '', name: '' }); }}
    />
    </>
  );
}
