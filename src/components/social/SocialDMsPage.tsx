import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Instagram, Music2, Plus, Trash2, ExternalLink, Users, Loader2, Upload,
  CheckCircle, Link, MessageSquare, Key, FlaskConical, Globe, Hash, MessageCircleMore
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { DMTemplates } from './DMTemplates';
import { DMAccountSetup } from './DMAccountSetup';
import { DMABTesting } from './DMABTesting';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'whatsapp' | 'x' | 'reddit' | 'discord';

const PLATFORMS: { id: Platform; label: string; icon: any; color: string; urlBase: string; placeholder: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500', urlBase: 'https://instagram.com/', placeholder: 'Enter Instagram username or URL' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, color: 'from-black to-gray-800', urlBase: 'https://tiktok.com/@', placeholder: 'Enter TikTok username or URL' },
  { id: 'linkedin', label: 'LinkedIn', icon: Users, color: 'from-blue-600 to-blue-800', urlBase: 'https://linkedin.com/in/', placeholder: 'Enter LinkedIn profile URL' },
  { id: 'facebook', label: 'Facebook', icon: Globe, color: 'from-blue-500 to-blue-700', urlBase: 'https://facebook.com/', placeholder: 'Enter Facebook username or URL' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircleMore, color: 'from-green-500 to-green-700', urlBase: 'https://wa.me/', placeholder: 'Enter phone number or WhatsApp link' },
  { id: 'x', label: 'X (Twitter)', icon: Hash, color: 'from-gray-700 to-black', urlBase: 'https://x.com/', placeholder: 'Enter X/Twitter handle or URL' },
  { id: 'reddit', label: 'Reddit', icon: MessageSquare, color: 'from-orange-500 to-red-500', urlBase: 'https://reddit.com/user/', placeholder: 'Enter Reddit username' },
  { id: 'discord', label: 'Discord', icon: MessageCircleMore, color: 'from-indigo-500 to-purple-600', urlBase: '', placeholder: 'Enter Discord user ID or tag' },
];

interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: string;
  avatar: string | null;
  bio: string | null;
  followers: string | null;
  engagement: string | null;
  location: string | null;
  category: string[] | null;
  verified: boolean | null;
  created_at: string;
}

export function SocialDMsPage() {
  const [activeTab, setActiveTab] = useState<string>('instagram');
  const [profileUrl, setProfileUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isPlatformTab = PLATFORMS.some(p => p.id === activeTab);
  const activePlatform = PLATFORMS.find(p => p.id === activeTab);

  const { data: creators, isLoading } = useQuery({
    queryKey: ['creators', user?.id, activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user?.id)
        .eq('platform', activeTab)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Creator[];
    },
    enabled: !!user && isPlatformTab,
  });

  const parseProfileUrl = (url: string, platform: string): { handle: string; name: string } | null => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      let handle = '';
      const match = urlObj.pathname.match(/^\/?@?([^\/]+)/);
      handle = match ? match[1].replace('@', '') : '';
      if (handle && !['p', 'reel', 'stories', 'explore'].includes(handle)) {
        return { handle: handle.toLowerCase(), name: handle };
      }
      return null;
    } catch {
      const cleanHandle = url.replace(/[@\/]/g, '').trim().toLowerCase();
      if (cleanHandle) return { handle: cleanHandle, name: cleanHandle };
      return null;
    }
  };

  const addCreator = useMutation({
    mutationFn: async (url: string) => {
      const parsed = parseProfileUrl(url, activeTab);
      if (!parsed) throw new Error('Invalid profile URL or handle');
      const { data: existing } = await supabase
        .from('creators').select('id').eq('user_id', user?.id).eq('handle', parsed.handle).eq('platform', activeTab).single();
      if (existing) throw new Error('This contact is already added');
      const { data, error } = await supabase
        .from('creators')
        .insert({ user_id: user?.id, name: parsed.name, handle: parsed.handle, platform: activeTab })
        .select().single();
      if (error) throw error;
      await supabase.from('activity_logs').insert({
        user_id: user?.id, action_type: 'creator_added', entity_type: 'creator', entity_id: data.id,
        metadata: { platform: activeTab, handle: parsed.handle },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      setProfileUrl('');
      toast({ title: 'Contact added', description: 'Profile has been added to your list' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to add contact', description: error.message, variant: 'destructive' });
    },
  });

  const addBulkCreators = useMutation({
    mutationFn: async (urls: string[]) => {
      const results = { added: 0, failed: 0 };
      for (const url of urls) {
        const parsed = parseProfileUrl(url.trim(), activeTab);
        if (!parsed) { results.failed++; continue; }
        const { data: existing } = await supabase
          .from('creators').select('id').eq('user_id', user?.id).eq('handle', parsed.handle).eq('platform', activeTab).single();
        if (existing) { results.failed++; continue; }
        const { error } = await supabase
          .from('creators').insert({ user_id: user?.id, name: parsed.name, handle: parsed.handle, platform: activeTab });
        if (error) results.failed++; else results.added++;
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      setBulkUrls(''); setShowBulkUpload(false);
      toast({ title: 'Bulk import complete', description: `Added ${results.added} contacts, ${results.failed} failed` });
    },
  });

  const deleteCreator = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('creators').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      toast({ title: 'Contact removed' });
    },
  });

  const handleBulkImport = () => {
    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) {
      toast({ title: 'No URLs provided', description: 'Enter profile URLs, one per line', variant: 'destructive' });
      return;
    }
    addBulkCreators.mutate(urls);
  };

  const getProfileUrl = (handle: string) => {
    if (!activePlatform) return '#';
    return `${activePlatform.urlBase}${handle}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Social Media DMs</h1>
        <p className="text-muted-foreground">
          Multi-platform outreach across all major social networks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-auto min-w-full">
            {PLATFORMS.map(p => {
              const Icon = p.icon;
              return (
                <TabsTrigger key={p.id} value={p.id} className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3.5 w-3.5" />
                  {p.label}
                </TabsTrigger>
              );
            })}
            <TabsTrigger value="templates" className="flex items-center gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />Templates
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-1.5 text-xs">
              <Key className="h-3.5 w-3.5" />Accounts
            </TabsTrigger>
            <TabsTrigger value="ab-testing" className="flex items-center gap-1.5 text-xs">
              <FlaskConical className="h-3.5 w-3.5" />A/B Testing
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="templates" className="space-y-4 mt-4"><DMTemplates /></TabsContent>
        <TabsContent value="accounts" className="space-y-4 mt-4"><DMAccountSetup /></TabsContent>
        <TabsContent value="ab-testing" className="space-y-4 mt-4"><DMABTesting /></TabsContent>

        {isPlatformTab && activePlatform && (
          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {/* Add Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activePlatform.color} flex items-center justify-center`}>
                    <activePlatform.icon className="h-4 w-4 text-white" />
                  </div>
                  Add {activePlatform.label} Contacts
                </CardTitle>
                <CardDescription>Paste profile URLs or usernames to add to your outreach list</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showBulkUpload ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder={activePlatform.placeholder}
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && profileUrl && addCreator.mutate(profileUrl)}
                    />
                    <Button onClick={() => addCreator.mutate(profileUrl)} disabled={!profileUrl || addCreator.isPending}>
                      {addCreator.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
                      <Upload className="h-4 w-4 mr-2" />Bulk
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder={`Paste ${activePlatform.label} profile URLs, one per line...`}
                      value={bulkUrls} onChange={(e) => setBulkUrls(e.target.value)} rows={6}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleBulkImport} disabled={addBulkCreators.isPending}>
                        {addBulkCreators.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</> : <><Upload className="mr-2 h-4 w-4" />Import All</>}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowBulkUpload(false); setBulkUrls(''); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contacts List */}
            <Card>
              <CardHeader>
                <CardTitle>Your {activePlatform.label} Contacts</CardTitle>
                <CardDescription>{creators?.length || 0} profiles added</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : creators && creators.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {creators.map((creator) => (
                        <div key={creator.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activePlatform.color} flex items-center justify-center`}>
                              <activePlatform.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{creator.name}</span>
                                {creator.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                              </div>
                              <p className="text-sm text-muted-foreground">@{creator.handle}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {creator.followers && <Badge variant="secondary">{creator.followers} followers</Badge>}
                            {activePlatform.urlBase && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={getProfileUrl(creator.handle)} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ open: true, id: creator.id, name: creator.handle })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No {activePlatform.label} contacts added yet</p>
                    <p className="text-sm">Add profile URLs above to start building your list</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Anti-Block Protection Info */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  🛡️ Smart Anti-Block Protection
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Random delays between messages (mimics human behavior)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Account rotation to distribute sending load</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Active hours scheduling (no overnight sending)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Daily limits per account to stay under radar</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Configure per-account settings in the <strong>Accounts</strong> tab. Use external automation tools (n8n, Make, Pipedream) to connect your {activePlatform.label} accounts via session cookies or API credentials.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        title="Remove Contact?"
        description={`Are you sure you want to remove @${deleteConfirm.name} from your list?`}
        confirmLabel="Yes, remove"
        onConfirm={() => {
          deleteCreator.mutate(deleteConfirm.id);
          setDeleteConfirm({ open: false, id: '', name: '' });
        }}
      />
    </div>
  );
}
