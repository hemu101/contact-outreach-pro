import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Copy,
  Send,
  AlertCircle,
  Loader2,
  Save,
  TestTube2,
  Zap,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WebhookConfig {
  id: string;
  name: string;
  provider: 'hubspot' | 'apollo' | 'salesforce' | 'zapier' | 'custom';
  webhookUrl: string;
  enabled: boolean;
  events: string[];
  lastTriggered?: string;
  status: 'active' | 'error' | 'untested';
}

const PROVIDERS = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts and campaign events to HubSpot CRM',
    logo: '🟠',
    docUrl: 'https://developers.hubspot.com/docs/api/webhooks',
  },
  {
    id: 'apollo',
    name: 'Apollo.io',
    description: 'Sync leads and engagement data to Apollo',
    logo: '🔵',
    docUrl: 'https://apolloio.github.io/apollo-api-docs/',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect campaign data to Salesforce',
    logo: '☁️',
    docUrl: 'https://developer.salesforce.com/docs/',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps via Zapier webhooks',
    logo: '⚡',
    docUrl: 'https://zapier.com/apps/webhook/integrations',
  },
  {
    id: 'custom',
    name: 'Custom Webhook',
    description: 'Send events to any custom endpoint',
    logo: '🔗',
    docUrl: null,
  },
];

const EVENT_TYPES = [
  { id: 'email.sent', label: 'Email Sent', description: 'When an email is sent to a contact' },
  { id: 'email.opened', label: 'Email Opened', description: 'When a recipient opens an email' },
  { id: 'email.clicked', label: 'Email Clicked', description: 'When a recipient clicks a link' },
  { id: 'email.replied', label: 'Email Reply', description: 'When a recipient replies' },
  { id: 'email.bounced', label: 'Email Bounced', description: 'When an email bounces' },
  { id: 'campaign.started', label: 'Campaign Started', description: 'When a campaign begins sending' },
  { id: 'campaign.completed', label: 'Campaign Completed', description: 'When a campaign finishes' },
  { id: 'contact.created', label: 'Contact Created', description: 'When a new contact is added' },
  { id: 'dm.sent', label: 'DM Sent', description: 'When a DM is sent' },
  { id: 'dm.replied', label: 'DM Reply', description: 'When someone replies to a DM' },
];

export function CRMWebhookIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('webhooks');
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    name: '',
    provider: 'custom',
    webhookUrl: '',
    enabled: true,
    events: ['email.sent', 'email.opened'],
  });

  // Fetch saved webhooks from workflows table (using it as webhook storage)
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['crm-webhooks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user?.id)
        .eq('trigger_type', 'crm_webhook')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        enabled: w.is_active,
        ...((w.actions as any) || {}),
      })) as WebhookConfig[];
    },
    enabled: !!user,
  });

  // Save webhook mutation
  const saveWebhook = useMutation({
    mutationFn: async (config: Partial<WebhookConfig>) => {
      const workflowData = {
        user_id: user?.id,
        name: config.name || 'CRM Webhook',
        trigger_type: 'crm_webhook',
        is_active: config.enabled,
        actions: {
          provider: config.provider,
          webhookUrl: config.webhookUrl,
          events: config.events,
          status: 'untested',
        },
      };

      if (config.id) {
        const { error } = await supabase
          .from('workflows')
          .update(workflowData)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('workflows')
          .insert(workflowData);
        if (error) throw error;
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action_type: config.id ? 'webhook_updated' : 'webhook_created',
        entity_type: 'crm_webhook',
        metadata: { provider: config.provider, name: config.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-webhooks'] });
      setShowAddForm(false);
      setNewWebhook({
        name: '',
        provider: 'custom',
        webhookUrl: '',
        enabled: true,
        events: ['email.sent', 'email.opened'],
      });
      toast({ title: 'Webhook saved successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to save webhook', description: error.message, variant: 'destructive' });
    },
  });

  // Delete webhook mutation
  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-webhooks'] });
      toast({ title: 'Webhook deleted' });
    },
  });

  // Toggle webhook enabled state
  const toggleWebhook = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-webhooks'] });
    },
  });

  // Test webhook
  const testWebhook = async (webhook: WebhookConfig) => {
    setTestingWebhook(webhook.id);
    try {
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Test webhook from OutreachFlow',
          webhook_name: webhook.name,
          provider: webhook.provider,
        },
      };

      const response = await fetch(webhook.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify(testPayload),
      });

      toast({ 
        title: 'Test webhook sent', 
        description: 'Check your webhook endpoint to verify receipt' 
      });

      // Log the test
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action_type: 'webhook_tested',
        entity_type: 'crm_webhook',
        entity_id: webhook.id,
        metadata: { provider: webhook.provider, url: webhook.webhookUrl },
      });
    } catch (error: any) {
      toast({ 
        title: 'Webhook test failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events?.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...(prev.events || []), eventId],
    }));
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Webhook URL copied' });
  };

  const getProviderInfo = (providerId: string) => {
    return PROVIDERS.find(p => p.id === providerId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">CRM Webhook Integration</h2>
        <p className="text-muted-foreground">
          Sync campaign events with HubSpot, Apollo, and other CRMs
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="providers">
            <Zap className="h-4 w-4 mr-2" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Settings2 className="h-4 w-4 mr-2" />
            Event Logs
          </TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Configure webhooks to send campaign events to external services
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {newWebhook.id ? 'Edit Webhook' : 'New Webhook'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Webhook Name</Label>
                    <Input
                      placeholder="e.g., HubSpot Sync"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newWebhook.provider}
                      onChange={(e) => setNewWebhook({ ...newWebhook, provider: e.target.value as any })}
                    >
                      {PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.logo} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://..."
                    value={newWebhook.webhookUrl}
                    onChange={(e) => setNewWebhook({ ...newWebhook, webhookUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    The URL where event data will be sent via POST request
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Events to Send</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EVENT_TYPES.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          newWebhook.events?.includes(event.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => toggleEvent(event.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            newWebhook.events?.includes(event.id)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {newWebhook.events?.includes(event.id) && (
                              <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="font-medium text-sm">{event.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 pl-6">
                          {event.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowAddForm(false);
                    setNewWebhook({
                      name: '',
                      provider: 'custom',
                      webhookUrl: '',
                      enabled: true,
                      events: ['email.sent', 'email.opened'],
                    });
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveWebhook.mutate(newWebhook)}
                    disabled={!newWebhook.name || !newWebhook.webhookUrl || saveWebhook.isPending}
                  >
                    {saveWebhook.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Webhooks List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : webhooks.length === 0 && !showAddForm ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No webhooks configured</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a webhook to sync campaign events with your CRM
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook) => {
                const provider = getProviderInfo(webhook.provider);
                return (
                  <Card key={webhook.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{provider?.logo || '🔗'}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{webhook.name}</h3>
                              <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                                {webhook.enabled ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-md">
                              {webhook.webhookUrl}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={webhook.enabled}
                            onCheckedChange={(enabled) => 
                              toggleWebhook.mutate({ id: webhook.id, enabled })
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testWebhook(webhook)}
                            disabled={testingWebhook === webhook.id}
                          >
                            {testingWebhook === webhook.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyWebhookUrl(webhook.webhookUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWebhook.mutate(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {webhook.events?.map((event: string) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {EVENT_TYPES.find(e => e.id === event)?.label || event}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROVIDERS.map((provider) => (
              <Card key={provider.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{provider.logo}</div>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setNewWebhook({ ...newWebhook, provider: provider.id as any });
                        setShowAddForm(true);
                        setActiveTab('webhooks');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    {provider.docUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={provider.docUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Event Logs Tab */}
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Webhook Events</CardTitle>
              <CardDescription>
                View the history of events sent to your webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Webhook event logs are stored in the activity_logs table. 
                  View detailed logs in the n8n Workflow section.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
