import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useEmailSettings } from '@/hooks/useEmailSettings';
import { DeliverabilityTest } from '@/components/campaigns/DeliverabilityTest';
import { TestEmailSend } from '@/components/campaigns/TestEmailSend';
import {
  Mail, Save, ExternalLink, Loader2, Shield, Zap, Send, Server,
  CheckCircle, Star, Globe, DollarSign, ArrowRight
} from 'lucide-react';

const EMAIL_PROVIDERS = [
  {
    name: 'Brevo (Sendinblue)',
    tier: 'free',
    freeTier: '300 emails/day free',
    features: ['SMTP Relay', 'API', 'Template Builder', 'Analytics'],
    setupUrl: 'https://app.brevo.com/settings/keys/smtp',
    logo: '📧',
    recommended: true,
  },
  {
    name: 'Mailgun',
    tier: 'free',
    freeTier: '100 emails/day (sandbox)',
    features: ['REST API', 'SMTP', 'Email Validation', 'Webhooks'],
    setupUrl: 'https://app.mailgun.com/app/sending/domains',
    logo: '📬',
  },
  {
    name: 'SendGrid',
    tier: 'free',
    freeTier: '100 emails/day free forever',
    features: ['Web API', 'SMTP Relay', 'Email Design', 'Dynamic Templates'],
    setupUrl: 'https://app.sendgrid.com/settings/api_keys',
    logo: '⚡',
  },
  {
    name: 'Resend',
    tier: 'free',
    freeTier: '100 emails/day, 3000/month free',
    features: ['Modern API', 'React Email', 'Webhooks', 'Custom Domains'],
    setupUrl: 'https://resend.com/api-keys',
    logo: '🚀',
  },
  {
    name: 'Amazon SES',
    tier: 'paid',
    freeTier: '$0.10 per 1000 emails',
    features: ['Massive Scale', 'High Deliverability', 'Pay-as-you-go', 'AWS Integration'],
    setupUrl: 'https://console.aws.amazon.com/ses/',
    logo: '☁️',
  },
  {
    name: 'Postmark',
    tier: 'paid',
    freeTier: '100 emails/month free trial',
    features: ['Fastest Delivery', 'Dedicated IP', 'Inbound Processing', 'Streams'],
    setupUrl: 'https://account.postmarkapp.com/servers',
    logo: '📮',
  },
  {
    name: 'Mailjet',
    tier: 'free',
    freeTier: '200 emails/day, 6000/month free',
    features: ['Drag & Drop Editor', 'A/B Testing', 'Real-time Stats', 'Contact Management'],
    setupUrl: 'https://app.mailjet.com/account/api_keys',
    logo: '✈️',
  },
  {
    name: 'SMTP.com',
    tier: 'paid',
    freeTier: 'From $25/month',
    features: ['Enterprise SMTP', 'Reputation Monitoring', 'Dedicated IPs', 'Expert Support'],
    setupUrl: 'https://www.smtp.com/',
    logo: '🏢',
  },
];

const AUTOMATION_ALTERNATIVES = [
  {
    name: 'Supabase Edge Functions',
    tier: 'built-in',
    description: 'Already integrated! Use edge functions for custom email logic, scheduling, and webhooks.',
    features: ['Built into your project', 'Custom triggers', 'Webhook handlers', 'Database integration'],
    free: true,
  },
  {
    name: 'Zapier',
    tier: 'freemium',
    description: 'Connect apps and automate workflows with a visual builder.',
    features: ['5000+ app integrations', '100 tasks/month free', 'Multi-step zaps', 'Webhooks'],
    setupUrl: 'https://zapier.com',
    free: true,
  },
  {
    name: 'Make (Integromat)',
    tier: 'freemium',
    description: 'Advanced automation with complex scenarios and data transformation.',
    features: ['1000 ops/month free', 'Visual builder', 'HTTP modules', 'Data stores'],
    setupUrl: 'https://make.com',
    free: true,
  },
  {
    name: 'n8n',
    tier: 'open-source',
    description: 'Self-hosted workflow automation (already integrated in your project).',
    features: ['Self-hosted free', '200+ integrations', 'Code nodes', 'Webhook triggers'],
    setupUrl: 'https://n8n.io',
    free: true,
  },
  {
    name: 'Pipedream',
    tier: 'freemium',
    description: 'Code-level automation with pre-built components.',
    features: ['Unlimited workflows', 'Node.js runtime', 'Free tier generous', 'Real-time triggers'],
    setupUrl: 'https://pipedream.com',
    free: true,
  },
];

export function EmailToolsPage() {
  const { settings, isLoading, saveSettings } = useEmailSettings();
  const [formData, setFormData] = useState({
    smtpHost: '', smtpPort: '587', smtpUser: '', smtpPassword: '',
    sendgridKey: '', brevoApiKey: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        smtpHost: settings.smtpHost || '', smtpPort: settings.smtpPort || '587',
        smtpUser: settings.smtpUser || '', smtpPassword: settings.smtpPassword || '',
        sendgridKey: settings.sendgridKey || '', brevoApiKey: settings.brevoApiKey || '',
      });
    }
  }, [settings]);

  const handleSave = () => {
    saveSettings.mutate({
      ...formData,
      twilioSid: '', twilioToken: '', twilioNumber: '',
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Mail className="w-7 h-7" /> Email & Automation Tools</h1>
        <p className="text-muted-foreground mt-1">Configure SMTP, choose email providers, and explore automation alternatives</p>
      </div>

      <Tabs defaultValue="smtp">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4">
          <TabsTrigger value="smtp"><Server className="w-4 h-4 mr-1" />SMTP</TabsTrigger>
          <TabsTrigger value="providers"><Globe className="w-4 h-4 mr-1" />Providers</TabsTrigger>
          <TabsTrigger value="automation"><Zap className="w-4 h-4 mr-1" />Automation</TabsTrigger>
          <TabsTrigger value="testing"><Shield className="w-4 h-4 mr-1" />Testing</TabsTrigger>
        </TabsList>

        {/* SMTP Configuration */}
        <TabsContent value="smtp" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Server className="w-5 h-5" /> SMTP Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input placeholder="smtp-relay.brevo.com" value={formData.smtpHost} onChange={e => setFormData(s => ({ ...s, smtpHost: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input placeholder="587" value={formData.smtpPort} onChange={e => setFormData(s => ({ ...s, smtpPort: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>SMTP Username/Email</Label>
                  <Input placeholder="your-email@domain.com" value={formData.smtpUser} onChange={e => setFormData(s => ({ ...s, smtpUser: e.target.value }))} />
                </div>
                <div>
                  <Label>SMTP Password / API Key</Label>
                  <Input type="password" placeholder="••••••••" value={formData.smtpPassword} onChange={e => setFormData(s => ({ ...s, smtpPassword: e.target.value }))} />
                </div>
                <div className="pt-3 border-t border-border">
                  <Label>Brevo API Key (optional)</Label>
                  <Input placeholder="xkeysib-xxxxx" value={formData.brevoApiKey} onChange={e => setFormData(s => ({ ...s, brevoApiKey: e.target.value }))} />
                </div>
                <div>
                  <Label>SendGrid API Key (optional)</Label>
                  <Input placeholder="SG.xxxxx" value={formData.sendgridKey} onChange={e => setFormData(s => ({ ...s, sendgridKey: e.target.value }))} />
                </div>
                <Button onClick={handleSave} className="w-full" disabled={saveSettings.isPending}>
                  {saveSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save SMTP Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5" /> Quick Setup Guides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Brevo SMTP', host: 'smtp-relay.brevo.com', port: '587', url: 'https://app.brevo.com/settings/keys/smtp' },
                  { name: 'Gmail SMTP', host: 'smtp.gmail.com', port: '587', url: 'https://myaccount.google.com/apppasswords' },
                  { name: 'Outlook SMTP', host: 'smtp.office365.com', port: '587', url: 'https://outlook.live.com' },
                  { name: 'Mailgun SMTP', host: 'smtp.mailgun.org', port: '587', url: 'https://app.mailgun.com' },
                  { name: 'SendGrid SMTP', host: 'smtp.sendgrid.net', port: '587', url: 'https://app.sendgrid.com' },
                  { name: 'Amazon SES', host: 'email-smtp.us-east-1.amazonaws.com', port: '587', url: 'https://console.aws.amazon.com/ses' },
                ].map(provider => (
                  <div key={provider.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">{provider.host}:{provider.port}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setFormData(s => ({ ...s, smtpHost: provider.host, smtpPort: provider.port }))}>
                        Use
                      </Button>
                      <a href={provider.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink className="w-3 h-3" /></Button>
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Providers */}
        <TabsContent value="providers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {EMAIL_PROVIDERS.map(provider => (
              <Card key={provider.name} className={`border-border relative ${provider.recommended ? 'ring-2 ring-primary' : ''}`}>
                {provider.recommended && (
                  <Badge className="absolute -top-2 right-3 bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" /> Recommended
                  </Badge>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{provider.logo}</span>
                    <div>
                      <CardTitle className="text-sm">{provider.name}</CardTitle>
                      <Badge variant={provider.tier === 'free' ? 'secondary' : 'outline'} className="text-[10px] mt-1">
                        {provider.tier === 'free' ? '✅ Free Tier' : '💰 Paid'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-primary font-medium">{provider.freeTier}</p>
                  <div className="space-y-1">
                    {provider.features.map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <a href={provider.setupUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <ExternalLink className="w-3 h-3 mr-1" /> Get API Key
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Alternatives */}
        <TabsContent value="automation" className="mt-6">
          <div className="space-y-4">
            <Card className="border-border bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Beyond n8n: Free & Advanced Automation Options</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your project already has n8n workflow support and Supabase Edge Functions. 
                      Below are additional tools you can integrate for more complex automation needs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AUTOMATION_ALTERNATIVES.map(tool => (
                <Card key={tool.name} className={`border-border ${tool.tier === 'built-in' ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{tool.name}</CardTitle>
                      <Badge variant={tool.free ? 'secondary' : 'outline'} className="text-[10px]">
                        {tool.tier === 'built-in' ? '🔧 Built-in' : tool.free ? '✅ Free' : '💰 Paid'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                    <div className="space-y-1">
                      {tool.features.map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    {tool.setupUrl && (
                      <a href={tool.setupUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="w-3 h-3 mr-1" /> Learn More
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Testing */}
        <TabsContent value="testing" className="mt-6 space-y-6">
          <DeliverabilityTest />
          <TestEmailSend />
        </TabsContent>
      </Tabs>
    </div>
  );
}
