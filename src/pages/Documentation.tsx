import { useState } from 'react';
import { 
  Book, Zap, Database, Mail, Users, FileText, 
  Play, Settings, Code, ChevronRight, ExternalLink,
  CheckCircle, AlertCircle, Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'contacts', label: 'Managing Contacts', icon: Users },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'campaigns', label: 'Campaigns', icon: Mail },
  { id: 'n8n-automation', label: 'n8n Automation', icon: Workflow },
  { id: 'api-setup', label: 'API Setup', icon: Code },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: Settings },
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card/50 min-h-screen p-4 sticky top-0">
          <div className="flex items-center gap-2 mb-6 px-2">
            <Book className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Documentation</h1>
          </div>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 max-w-4xl">
          {activeSection === 'getting-started' && <GettingStarted />}
          {activeSection === 'contacts' && <ContactsDocs />}
          {activeSection === 'templates' && <TemplatesDocs />}
          {activeSection === 'campaigns' && <CampaignsDocs />}
          {activeSection === 'n8n-automation' && <N8nDocs />}
          {activeSection === 'api-setup' && <ApiSetupDocs />}
          {activeSection === 'troubleshooting' && <TroubleshootingDocs />}
        </main>
      </div>
    </div>
  );
}

function GettingStarted() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Getting Started</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to OutreachAI - your advanced automation platform for personalized outreach campaigns.
        </p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Start Guide</h2>
        <div className="space-y-4">
          <Step number={1} title="Import Your Contacts">
            Upload a CSV file with your contacts. Required columns: First Name, Last Name, Email.
            Optional: Business Name, Phone, Instagram, TikTok handles.
          </Step>
          <Step number={2} title="Create Templates">
            Build personalized message templates using variables like {"{{firstName}}"}, {"{{businessName}}"}.
            Create templates for Email, Instagram DM, TikTok DM, or Voicemail.
          </Step>
          <Step number={3} title="Build Campaigns">
            Select contacts, choose templates, and schedule your campaign.
            Monitor delivery in real-time with open and click tracking.
          </Step>
          <Step number={4} title="Automate with n8n">
            Export the n8n workflow to automate multi-channel outreach with advanced scheduling.
          </Step>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">System Requirements</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            Modern browser (Chrome, Firefox, Safari, Edge)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            Resend API key for email sending
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            n8n instance (self-hosted or cloud) for automation
          </li>
        </ul>
      </div>
    </div>
  );
}

function ContactsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Managing Contacts</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">CSV Import Format</h2>
        <p className="text-muted-foreground mb-4">
          Your CSV file should have the following columns:
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre>First Name,Last Name,Business Name,Email,Phone,Instagram,TikTok</pre>
          <pre>John,Smith,Acme Corp,john@acme.com,+1234567890,@johnsmith,@johnsmith_tt</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Statuses</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="font-medium text-foreground">Pending</span>
            <span className="text-muted-foreground">- Not yet contacted</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="font-medium text-foreground">Sent</span>
            <span className="text-muted-foreground">- Message delivered</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-destructive" />
            <span className="font-medium text-foreground">Failed</span>
            <span className="text-muted-foreground">- Delivery failed</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function TemplatesDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Templates</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Available Variables</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <code className="text-primary">{"{{firstName}}"}</code>
            <p className="text-sm text-muted-foreground mt-1">Contact's first name</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <code className="text-primary">{"{{lastName}}"}</code>
            <p className="text-sm text-muted-foreground mt-1">Contact's last name</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <code className="text-primary">{"{{businessName}}"}</code>
            <p className="text-sm text-muted-foreground mt-1">Business/company name</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <code className="text-primary">{"{{email}}"}</code>
            <p className="text-sm text-muted-foreground mt-1">Contact's email address</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Template Types</h2>
        <ul className="space-y-3">
          <li><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">Includes subject line and HTML body</span></li>
          <li><strong className="text-foreground">Instagram DM:</strong> <span className="text-muted-foreground">Short, casual messages</span></li>
          <li><strong className="text-foreground">TikTok DM:</strong> <span className="text-muted-foreground">Brief, engaging content</span></li>
          <li><strong className="text-foreground">Voicemail:</strong> <span className="text-muted-foreground">Script for voice messages</span></li>
        </ul>
      </div>
    </div>
  );
}

function CampaignsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Campaigns</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Creating a Campaign</h2>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li>Navigate to the Campaigns tab</li>
          <li>Enter a campaign name</li>
          <li>Select contacts (use checkbox to select all or individual)</li>
          <li>Choose template(s) for each channel</li>
          <li>Set schedule date/time or launch immediately</li>
          <li>Click "Launch Campaign"</li>
        </ol>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Email Tracking</h2>
        <p className="text-muted-foreground mb-4">
          Every email includes tracking for:
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Opens:</strong> Tracked via 1x1 pixel
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Clicks:</strong> Link wrapping with redirect tracking
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Timestamps:</strong> When each event occurred
          </li>
        </ul>
      </div>
    </div>
  );
}

function N8nDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">n8n Automation</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">What is n8n?</h2>
        <p className="text-muted-foreground">
          n8n is a powerful workflow automation tool that connects apps and services.
          Export our workflow template to automate multi-channel outreach with advanced scheduling.
        </p>
        <Button className="mt-4" variant="outline" asChild>
          <a href="https://n8n.io" target="_blank" rel="noopener noreferrer">
            Visit n8n <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Setup Steps</h2>
        <ol className="space-y-4 list-decimal list-inside">
          <li className="text-muted-foreground">
            <strong className="text-foreground">Install n8n:</strong> Self-host with Docker or use n8n Cloud
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Export Workflow:</strong> Go to n8n tab and download the JSON
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Import Workflow:</strong> In n8n, create new workflow and import JSON
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Configure Credentials:</strong>
            <ul className="ml-6 mt-2 space-y-1 list-disc">
              <li>SMTP/SendGrid for emails</li>
              <li>Twilio for calls/SMS</li>
              <li>Google Sheets for logging</li>
            </ul>
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Upload CSV:</strong> Place your contacts CSV where n8n can access it
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Activate Workflow:</strong> Toggle the workflow to active
          </li>
        </ol>
      </div>

      <div className="glass-card rounded-xl p-6 border-warning/50">
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-warning" />
          Important Considerations
        </h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Email providers have daily sending limits (Resend free tier: 100/day)</li>
          <li>• Respect rate limits to avoid being flagged as spam</li>
          <li>• Instagram/TikTok DMs require their official APIs (limited access)</li>
          <li>• Always include unsubscribe options in marketing emails</li>
          <li>• Test with small batches before large campaigns</li>
        </ul>
      </div>
    </div>
  );
}

function ApiSetupDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">API Setup</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Resend (Email)</h2>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li>Sign up at <a href="https://resend.com" target="_blank" className="text-primary hover:underline">resend.com</a></li>
          <li>Verify your domain at <a href="https://resend.com/domains" target="_blank" className="text-primary hover:underline">resend.com/domains</a></li>
          <li>Create API key at <a href="https://resend.com/api-keys" target="_blank" className="text-primary hover:underline">resend.com/api-keys</a></li>
          <li>Add the RESEND_API_KEY in Supabase Edge Function secrets</li>
        </ol>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Twilio (Voice/SMS)</h2>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li>Sign up at <a href="https://twilio.com" target="_blank" className="text-primary hover:underline">twilio.com</a></li>
          <li>Get Account SID and Auth Token from Console</li>
          <li>Purchase a phone number</li>
          <li>Configure in n8n workflow credentials</li>
        </ol>
      </div>
    </div>
  );
}

function TroubleshootingDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Troubleshooting</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Common Issues</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Emails not sending</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Verify RESEND_API_KEY is set correctly</li>
              <li>• Check domain verification status</li>
              <li>• Review Edge Function logs in Supabase</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">CSV import fails</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Ensure CSV has proper headers</li>
              <li>• Check for special characters in data</li>
              <li>• Verify email format is valid</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Open tracking not working</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Some email clients block tracking pixels</li>
              <li>• Gmail may proxy images</li>
              <li>• This is expected behavior for privacy-focused clients</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-primary font-bold">{number}</span>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{children}</p>
      </div>
    </div>
  );
}
