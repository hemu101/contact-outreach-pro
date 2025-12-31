import { useState, useEffect } from 'react';
import { Key, Mail, MessageCircle, Phone, Save, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmailSettings } from '@/hooks/useEmailSettings';

export function SettingsPage() {
  const { settings, isLoading, saveSettings } = useEmailSettings();
  const [formData, setFormData] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    sendgridKey: '',
    brevoApiKey: '',
    twilioSid: '',
    twilioToken: '',
    twilioNumber: '',
  });

  // Load saved settings when available
  useEffect(() => {
    if (settings) {
      setFormData({
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || '587',
        smtpUser: settings.smtpUser || '',
        smtpPassword: settings.smtpPassword || '',
        sendgridKey: settings.sendgridKey || '',
        brevoApiKey: settings.brevoApiKey || '',
        twilioSid: settings.twilioSid || '',
        twilioToken: settings.twilioToken || '',
        twilioNumber: settings.twilioNumber || '',
      });
    }
  }, [settings]);

  const handleSave = () => {
    saveSettings.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your API credentials and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Settings - SMTP */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">SMTP Configuration</h3>
              <p className="text-sm text-muted-foreground">For Brevo, Gmail, or custom SMTP</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">SMTP Host</label>
                <Input
                  placeholder="smtp-relay.brevo.com"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData(s => ({ ...s, smtpHost: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Port</label>
                <Input
                  placeholder="587"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData(s => ({ ...s, smtpPort: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">SMTP Username/Email</label>
              <Input
                placeholder="your-email@domain.com"
                value={formData.smtpUser}
                onChange={(e) => setFormData(s => ({ ...s, smtpUser: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">SMTP Password / API Key</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.smtpPassword}
                onChange={(e) => setFormData(s => ({ ...s, smtpPassword: e.target.value }))}
              />
            </div>
            <div className="pt-2 border-t border-border">
              <label className="text-sm text-muted-foreground mb-1 block">Brevo API Key (optional)</label>
              <Input
                placeholder="xkeysib-xxxxx"
                value={formData.brevoApiKey}
                onChange={(e) => setFormData(s => ({ ...s, brevoApiKey: e.target.value }))}
              />
              <a 
                href="https://app.brevo.com/settings/keys/api" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-primary hover:underline mt-2"
              >
                Get Brevo API Key
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* SendGrid / Resend */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">SendGrid / Resend</h3>
              <p className="text-sm text-muted-foreground">Alternative email providers</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">SendGrid API Key</label>
              <Input
                placeholder="SG.xxxxx"
                value={formData.sendgridKey}
                onChange={(e) => setFormData(s => ({ ...s, sendgridKey: e.target.value }))}
              />
              <a 
                href="https://app.sendgrid.com/settings/api_keys" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-primary hover:underline mt-2"
              >
                Get SendGrid API Key
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Twilio Settings */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Twilio (Voicemail)</h3>
              <p className="text-sm text-muted-foreground">For automated voice messages</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Account SID</label>
              <Input
                placeholder="ACxxxxxxxx"
                value={formData.twilioSid}
                onChange={(e) => setFormData(s => ({ ...s, twilioSid: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Auth Token</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.twilioToken}
                onChange={(e) => setFormData(s => ({ ...s, twilioToken: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
              <Input
                placeholder="+1234567890"
                value={formData.twilioNumber}
                onChange={(e) => setFormData(s => ({ ...s, twilioNumber: e.target.value }))}
              />
            </div>
            <a 
              href="https://twilio.com/console" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Get credentials from Twilio Console
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Social Media Note */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Social Media DMs</h3>
              <p className="text-sm text-muted-foreground">Instagram & TikTok</p>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Instagram and TikTok do not provide official APIs for sending DMs. 
              For automation, consider these options:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>ManyChat:</strong> Instagram DM automation for business accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>PhantomBuster:</strong> Browser automation (use carefully, may violate TOS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Manual Export:</strong> Export your contact list and reach out personally</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          variant="gradient" 
          size="lg" 
          onClick={handleSave}
          disabled={saveSettings.isPending}
        >
          {saveSettings.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
