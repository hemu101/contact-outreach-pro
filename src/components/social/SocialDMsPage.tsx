import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Instagram, 
  Music2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Users,
  Loader2,
  Upload,
  CheckCircle,
  Link,
  MessageSquare,
  Key
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { DMTemplates } from './DMTemplates';
import { DMAccountSetup } from './DMAccountSetup';

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
  const [activeTab, setActiveTab] = useState<'instagram' | 'tiktok' | 'templates' | 'accounts'>('instagram');
  const [profileUrl, setProfileUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const platformForQuery = activeTab === 'templates' ? 'instagram' : activeTab;
  
  const { data: creators, isLoading } = useQuery({
    queryKey: ['creators', user?.id, platformForQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user?.id)
        .eq('platform', platformForQuery)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Creator[];
    },
    enabled: !!user && activeTab !== 'templates',
  });

  const parseProfileUrl = (url: string, platform: string): { handle: string; name: string } | null => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      let handle = '';
      
      if (platform === 'instagram') {
        // Handle instagram.com/username or instagram.com/username/
        const match = urlObj.pathname.match(/^\/?([^\/]+)/);
        handle = match ? match[1] : '';
      } else if (platform === 'tiktok') {
        // Handle tiktok.com/@username
        const match = urlObj.pathname.match(/^\/?@?([^\/]+)/);
        handle = match ? match[1].replace('@', '') : '';
      }
      
      if (handle && !['p', 'reel', 'stories', 'explore'].includes(handle)) {
        return { handle: handle.toLowerCase(), name: handle };
      }
      return null;
    } catch {
      // Try to parse as just a username
      const cleanHandle = url.replace(/[@\/]/g, '').trim().toLowerCase();
      if (cleanHandle) {
        return { handle: cleanHandle, name: cleanHandle };
      }
      return null;
    }
  };

  const addCreator = useMutation({
    mutationFn: async (url: string) => {
      const parsed = parseProfileUrl(url, activeTab);
      if (!parsed) throw new Error('Invalid profile URL or handle');

      // Check if already exists
      const { data: existing } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user?.id)
        .eq('handle', parsed.handle)
        .eq('platform', activeTab)
        .single();

      if (existing) throw new Error('This creator is already added');

      const { data, error } = await supabase
        .from('creators')
        .insert({
          user_id: user?.id,
          name: parsed.name,
          handle: parsed.handle,
          platform: activeTab,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action_type: 'creator_added',
        entity_type: 'creator',
        entity_id: data.id,
        metadata: { platform: activeTab, handle: parsed.handle },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      setProfileUrl('');
      toast({
        title: 'Creator added',
        description: 'Profile has been added to your list',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add creator',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addBulkCreators = useMutation({
    mutationFn: async (urls: string[]) => {
      const results = { added: 0, failed: 0 };
      
      for (const url of urls) {
        const parsed = parseProfileUrl(url.trim(), activeTab);
        if (!parsed) {
          results.failed++;
          continue;
        }

        // Check if already exists
        const { data: existing } = await supabase
          .from('creators')
          .select('id')
          .eq('user_id', user?.id)
          .eq('handle', parsed.handle)
          .eq('platform', activeTab)
          .single();

        if (existing) {
          results.failed++;
          continue;
        }

        const { error } = await supabase
          .from('creators')
          .insert({
            user_id: user?.id,
            name: parsed.name,
            handle: parsed.handle,
            platform: activeTab,
          });

        if (error) {
          results.failed++;
        } else {
          results.added++;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      setBulkUrls('');
      setShowBulkUpload(false);
      toast({
        title: 'Bulk import complete',
        description: `Added ${results.added} creators, ${results.failed} failed`,
      });
    },
  });

  const deleteCreator = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      toast({ title: 'Creator removed' });
    },
  });

  const handleBulkImport = () => {
    const urls = bulkUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);
    
    if (urls.length === 0) {
      toast({
        title: 'No URLs provided',
        description: 'Enter profile URLs, one per line',
        variant: 'destructive',
      });
      return;
    }

    addBulkCreators.mutate(urls);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'tiktok': return Music2;
      default: return Users;
    }
  };

  const getPlatformUrl = (handle: string, platform: string) => {
    switch (platform) {
      case 'instagram': return `https://instagram.com/${handle}`;
      case 'tiktok': return `https://tiktok.com/@${handle}`;
      default: return '#';
    }
  };

  const PlatformIcon = getPlatformIcon(activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Social Media DMs</h1>
        <p className="text-muted-foreground">
          Manage your Instagram and TikTok outreach contacts
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'instagram' | 'tiktok' | 'templates' | 'accounts')}>
        <TabsList className="grid w-full max-w-[800px] grid-cols-4">
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="flex items-center gap-2">
            <Music2 className="h-4 w-4" />
            TikTok
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Accounts
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          <DMTemplates />
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4 mt-4">
          <DMAccountSetup />
        </TabsContent>

        {/* Instagram/TikTok Tabs */}
        {(activeTab === 'instagram' || activeTab === 'tiktok') && (
          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {/* Add Creator Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlatformIcon className="h-5 w-5 text-primary" />
                  Add {activeTab === 'instagram' ? 'Instagram' : 'TikTok'} Profiles
                </CardTitle>
                <CardDescription>
                  Paste profile URLs or usernames to add to your outreach list
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showBulkUpload ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Enter ${activeTab} profile URL or username...`}
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && profileUrl && addCreator.mutate(profileUrl)}
                    />
                    <Button 
                      onClick={() => addCreator.mutate(profileUrl)}
                      disabled={!profileUrl || addCreator.isPending}
                    >
                      {addCreator.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowBulkUpload(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Import
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder={`Paste ${activeTab} profile URLs, one per line...\n\nExample:\nhttps://instagram.com/username\n@username\nusername`}
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                      rows={6}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleBulkImport}
                        disabled={addBulkCreators.isPending}
                      >
                        {addBulkCreators.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Import All
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowBulkUpload(false);
                          setBulkUrls('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creators List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your {activeTab === 'instagram' ? 'Instagram' : 'TikTok'} Contacts</CardTitle>
                    <CardDescription>
                      {creators?.length || 0} profiles added
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : creators && creators.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {creators.map((creator) => (
                        <div
                          key={creator.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <PlatformIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{creator.name}</span>
                                {creator.verified && (
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">@{creator.handle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {creator.followers && (
                              <Badge variant="secondary">{creator.followers} followers</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a 
                                href={getPlatformUrl(creator.handle, creator.platform || activeTab)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCreator.mutate(creator.id)}
                            >
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
                    <p>No {activeTab} profiles added yet</p>
                    <p className="text-sm">Add profile URLs above to start building your list</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Coming Soon: DM Automation</h4>
                <p className="text-sm text-muted-foreground">
                  We're building automated DM sending for {activeTab === 'instagram' ? 'Instagram' : 'TikTok'}. 
                  For now, you can collect and organize your outreach contacts here. 
                  DM templates and automation will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}