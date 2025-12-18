import { useState } from 'react';
import { Key, Mail, MessageCircle, Phone, Save, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    sendgridKey: '',
    twilioSid: '',
    twilioToken: '',
    twilioNumber: '',
  });

  const handleSave = () => {
    // In a real app, save to backend/localStorage
    localStorage.setItem('outreach-settings', JSON.stringify(settings));
    toast({ title: "Settings saved", description: "Your API credentials have been saved securely." });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your API credentials and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Settings */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Email Configuration</h3>
              <p className="text-sm text-muted-foreground">SMTP or SendGrid</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">SMTP Host</label>
                <Input
                  placeholder="smtp.gmail.com"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings(s => ({ ...s, smtpHost: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Port</label>
                <Input
                  placeholder="587"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings(s => ({ ...s, smtpPort: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Username</label>
              <Input
                placeholder="your-email@gmail.com"
                value={settings.smtpUser}
                onChange={(e) => setSettings(s => ({ ...s, smtpUser: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Password / App Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={settings.smtpPassword}
                onChange={(e) => setSettings(s => ({ ...s, smtpPassword: e.target.value }))}
              />
            </div>
            <div className="pt-2 border-t border-border">
              <label className="text-sm text-muted-foreground mb-1 block">Or use SendGrid API Key</label>
              <Input
                placeholder="SG.xxxxx"
                value={settings.sendgridKey}
                onChange={(e) => setSettings(s => ({ ...s, sendgridKey: e.target.value }))}
              />
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
                value={settings.twilioSid}
                onChange={(e) => setSettings(s => ({ ...s, twilioSid: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Auth Token</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={settings.twilioToken}
                onChange={(e) => setSettings(s => ({ ...s, twilioToken: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
              <Input
                placeholder="+1234567890"
                value={settings.twilioNumber}
                onChange={(e) => setSettings(s => ({ ...s, twilioNumber: e.target.value }))}
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
        <div className="glass-card rounded-xl p-6 animate-slide-up lg:col-span-2">
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
              <strong className="text-foreground">Note:</strong> Instagram and TikTok don't provide official APIs for sending DMs. 
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
        <Button variant="gradient" size="lg" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
