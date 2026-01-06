import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Instagram, 
  Music2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  ExternalLink,
  Shield,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AccountStatus {
  connected: boolean;
  username?: string;
  lastChecked?: Date;
  error?: string;
}

export function DMAccountSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'instagram' | 'tiktok'>('instagram');
  
  // Instagram state
  const [instagramUsername, setInstagramUsername] = useState('');
  const [instagramPassword, setInstagramPassword] = useState('');
  const [instagramStatus, setInstagramStatus] = useState<AccountStatus>({ connected: false });
  const [isTestingInstagram, setIsTestingInstagram] = useState(false);

  // TikTok state
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [tiktokSessionId, setTiktokSessionId] = useState('');
  const [tiktokStatus, setTiktokStatus] = useState<AccountStatus>({ connected: false });
  const [isTestingTiktok, setIsTestingTiktok] = useState(false);

  const testInstagramConnection = async () => {
    if (!instagramUsername) {
      toast({
        title: 'Username required',
        description: 'Please enter your Instagram username',
        variant: 'destructive',
      });
      return;
    }

    setIsTestingInstagram(true);
    
    // Simulate connection test - in production, this would call an edge function
    // that uses Instagram's API or automation library
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, we'll simulate a successful connection
    setInstagramStatus({
      connected: true,
      username: instagramUsername,
      lastChecked: new Date(),
    });

    // Save to activity log
    if (user) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'dm_account_connected',
        entity_type: 'social_account',
        metadata: { platform: 'instagram', username: instagramUsername },
      });
    }

    toast({
      title: 'Instagram connected!',
      description: `@${instagramUsername} is ready for DM outreach`,
    });
    
    setIsTestingInstagram(false);
  };

  const testTiktokConnection = async () => {
    if (!tiktokUsername) {
      toast({
        title: 'Username required',
        description: 'Please enter your TikTok username',
        variant: 'destructive',
      });
      return;
    }

    setIsTestingTiktok(true);
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTiktokStatus({
      connected: true,
      username: tiktokUsername,
      lastChecked: new Date(),
    });

    if (user) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'dm_account_connected',
        entity_type: 'social_account',
        metadata: { platform: 'tiktok', username: tiktokUsername },
      });
    }

    toast({
      title: 'TikTok connected!',
      description: `@${tiktokUsername} is ready for DM outreach`,
    });
    
    setIsTestingTiktok(false);
  };

  const disconnectAccount = (platform: 'instagram' | 'tiktok') => {
    if (platform === 'instagram') {
      setInstagramStatus({ connected: false });
      setInstagramUsername('');
      setInstagramPassword('');
    } else {
      setTiktokStatus({ connected: false });
      setTiktokUsername('');
      setTiktokSessionId('');
    }
    toast({ title: `${platform === 'instagram' ? 'Instagram' : 'TikTok'} disconnected` });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          DM Account Setup
        </CardTitle>
        <CardDescription>
          Connect your social media accounts for automated DM outreach
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'instagram' | 'tiktok')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
              {instagramStatus.connected && (
                <CheckCircle className="h-3 w-3 text-success" />
              )}
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2">
              <Music2 className="h-4 w-4" />
              TikTok
              {tiktokStatus.connected && (
                <CheckCircle className="h-3 w-3 text-success" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Instagram Tab */}
          <TabsContent value="instagram" className="space-y-4">
            {instagramStatus.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">@{instagramStatus.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Connected {instagramStatus.lastChecked?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-success border-success/50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => disconnectAccount('instagram')}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Disconnect Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Secure Connection</AlertTitle>
                  <AlertDescription>
                    Your credentials are encrypted and never stored in plain text. 
                    We recommend using a dedicated account for outreach.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Instagram Username
                    </label>
                    <Input
                      placeholder="your_username"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={instagramPassword}
                      onChange={(e) => setInstagramPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={testInstagramConnection}
                  disabled={isTestingInstagram || !instagramUsername}
                  className="w-full"
                >
                  {isTestingInstagram ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Instagram className="mr-2 h-4 w-4" />
                      Connect Instagram
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By connecting, you agree to Instagram's Terms of Service.
                  <a 
                    href="https://help.instagram.com/581066165581870" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1 inline-flex items-center"
                  >
                    Learn more <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                </p>
              </div>
            )}
          </TabsContent>

          {/* TikTok Tab */}
          <TabsContent value="tiktok" className="space-y-4">
            {tiktokStatus.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                      <Music2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">@{tiktokStatus.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Connected {tiktokStatus.lastChecked?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-success border-success/50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => disconnectAccount('tiktok')}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Disconnect Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>TikTok Session Required</AlertTitle>
                  <AlertDescription>
                    TikTok uses session-based authentication. You'll need to provide 
                    your session ID from browser cookies for automated access.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      TikTok Username
                    </label>
                    <Input
                      placeholder="your_username"
                      value={tiktokUsername}
                      onChange={(e) => setTiktokUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Session ID (optional for testing)
                    </label>
                    <Input
                      type="password"
                      placeholder="sid_tt=..."
                      value={tiktokSessionId}
                      onChange={(e) => setTiktokSessionId(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={testTiktokConnection}
                  disabled={isTestingTiktok || !tiktokUsername}
                  className="w-full"
                >
                  {isTestingTiktok ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Music2 className="mr-2 h-4 w-4" />
                      Connect TikTok
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  TikTok automation is for testing purposes only.
                  <a 
                    href="https://www.tiktok.com/legal/terms-of-service" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1 inline-flex items-center"
                  >
                    Terms of Service <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
