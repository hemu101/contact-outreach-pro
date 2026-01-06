import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmailSettings } from '@/hooks/useEmailSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  success: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export function TestEmailSend() {
  const { user } = useAuth();
  const { settings, isLoading: settingsLoading } = useEmailSettings();
  const { toast } = useToast();
  
  const [testEmail, setTestEmail] = useState('');
  const [subject, setSubject] = useState('Test Email from Campaign System');
  const [content, setContent] = useState('This is a test email to verify your email configuration is working correctly.\n\nIf you received this, your setup is complete!');
  const [isSending, setIsSending] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const hasEmailConfig = settings && (
    settings.brevoApiKey || 
    settings.sendgridKey || 
    (settings.smtpHost && settings.smtpUser)
  );

  const getConfiguredProvider = () => {
    if (settings?.brevoApiKey) return 'Brevo';
    if (settings?.sendgridKey) return 'SendGrid';
    if (settings?.smtpHost) return 'Custom SMTP';
    return 'None';
  };

  const sendTestEmail = async () => {
    if (!testEmail || !user) return;
    
    setIsSending(true);
    const result: TestResult = {
      success: false,
      timestamp: new Date(),
    };

    try {
      // Create a temporary test campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: `Test Email ${new Date().toISOString()}`,
          user_id: user.id,
          status: 'draft',
          total_contacts: 1,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Create or find test contact
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', testEmail)
        .eq('user_id', user.id)
        .maybeSingle();

      let contactId = existingContact?.id;

      if (!contactId) {
        const { data: newContact, error: contactError } = await supabase
          .from('contacts')
          .insert({
            email: testEmail,
            first_name: 'Test',
            last_name: 'Recipient',
            user_id: user.id,
          })
          .select()
          .single();

        if (contactError) throw contactError;
        contactId = newContact.id;
      }

      // Create campaign contact
      await supabase.from('campaign_contacts').insert({
        campaign_id: campaign.id,
        contact_id: contactId,
        status: 'pending',
      });

      // Create a test template
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .insert({
          name: 'Test Template',
          type: 'email',
          subject: subject,
          content: content,
          user_id: user.id,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Update campaign with template
      await supabase
        .from('campaigns')
        .update({ template_id: template.id })
        .eq('id', campaign.id);

      // Send test email
      const { data, error } = await supabase.functions.invoke('send-campaign-emails', {
        body: { campaignId: campaign.id },
      });

      if (error) throw error;

      result.success = true;
      result.provider = getConfiguredProvider();
      result.messageId = data?.messageId;

      toast({
        title: 'Test email sent!',
        description: `Check ${testEmail} for your test message.`,
      });

      // Clean up test campaign and template
      await supabase.from('campaign_contacts').delete().eq('campaign_id', campaign.id);
      await supabase.from('campaigns').delete().eq('id', campaign.id);
      await supabase.from('templates').delete().eq('id', template.id);

    } catch (error: any) {
      console.error('Test email error:', error);
      result.success = false;
      result.error = error.message || 'Unknown error';
      
      toast({
        title: 'Test email failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
      setTestResults(prev => [result, ...prev].slice(0, 5));
    }
  };

  if (settingsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Test Email Send
        </CardTitle>
        <CardDescription>
          Send a test email to verify your configuration is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Email Provider:</span>
          </div>
          {hasEmailConfig ? (
            <Badge variant="outline" className="text-success border-success/50">
              <CheckCircle className="w-3 h-3 mr-1" />
              {getConfiguredProvider()}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-destructive border-destructive/50">
              <XCircle className="w-3 h-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </div>

        {!hasEmailConfig && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No email provider configured</AlertTitle>
            <AlertDescription>
              Go to Settings → Email Settings to configure your email provider (Brevo, SendGrid, or custom SMTP).
            </AlertDescription>
          </Alert>
        )}

        {/* Test Form */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Recipient Email
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Subject
            </label>
            <Input
              placeholder="Test subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Content
            </label>
            <Textarea
              placeholder="Test email content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={sendTestEmail} 
            disabled={!testEmail || !hasEmailConfig || isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="text-sm font-medium">Recent Tests</h4>
            {testResults.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  result.success ? 'bg-success/10' : 'bg-destructive/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span>
                    {result.success 
                      ? `Sent via ${result.provider}`
                      : result.error}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
