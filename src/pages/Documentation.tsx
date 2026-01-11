import { useState } from 'react';
import { 
  Book, Zap, Database, Mail, Users, FileText, 
  Play, Settings, Code, ChevronRight, ExternalLink,
  CheckCircle, AlertCircle, Workflow, PieChart, Edit3, 
  Upload, MousePointer, ArrowLeft, Shield, Clock, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'contacts', label: 'Managing Contacts', icon: Users },
  { id: 'inline-editing', label: 'Inline Editing', icon: Edit3 },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'campaigns', label: 'Campaigns', icon: Mail },
  { id: 'social-dm', label: 'Social DM Outreach', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics Dashboard', icon: PieChart },
  { id: 'n8n-automation', label: 'n8n Automation', icon: Workflow },
  { id: 'database-logging', label: 'Database Logging', icon: Database },
  { id: 'api-setup', label: 'API Setup', icon: Code },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: Settings },
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border bg-card/50 min-h-screen p-4 sticky top-0">
          <div className="flex items-center gap-2 mb-6 px-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </div>
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
          {activeSection === 'inline-editing' && <InlineEditingDocs />}
          {activeSection === 'templates' && <TemplatesDocs />}
          {activeSection === 'campaigns' && <CampaignsDocs />}
          {activeSection === 'social-dm' && <SocialDMDocs />}
          {activeSection === 'analytics' && <AnalyticsDocs />}
          {activeSection === 'n8n-automation' && <N8nDocs />}
          {activeSection === 'database-logging' && <DatabaseLoggingDocs />}
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
          Welcome to OutreachFlow - your advanced automation platform for personalized outreach campaigns.
        </p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Start Guide</h2>
        <div className="space-y-4">
          <Step number={1} title="Sign Up / Login">
            Create an account or log in with your email. You'll need to verify your email if confirmation is enabled.
          </Step>
          <Step number={2} title="Import Your Contacts">
            Go to the Contacts tab and upload a CSV file. Required columns: First Name, Last Name, Email.
            Optional: Business Name, Phone, Instagram, TikTok handles.
          </Step>
          <Step number={3} title="Create Templates">
            Build personalized message templates using variables like {"{{firstName}}"}, {"{{businessName}}"}.
            Create templates for Email, Instagram DM, TikTok DM, or Voicemail.
          </Step>
          <Step number={4} title="Build Campaigns">
            Select contacts, choose templates, and schedule your campaign.
            Monitor delivery in real-time with open and click tracking.
          </Step>
          <Step number={5} title="View Analytics">
            Check the Analytics tab to see open rates, click rates, and engagement metrics.
          </Step>
          <Step number={6} title="Automate with n8n">
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
            Brevo/SendGrid API key for email sending
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            n8n instance (self-hosted or cloud) for advanced automation
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6 border-primary/30">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Initial Setup Checklist</h2>
        <div className="space-y-3">
          <ChecklistItem>Create your account and verify email</ChecklistItem>
          <ChecklistItem>Set up Brevo/SendGrid API key (Settings → API Keys)</ChecklistItem>
          <ChecklistItem>Import your first batch of contacts via CSV</ChecklistItem>
          <ChecklistItem>Create at least one email template</ChecklistItem>
          <ChecklistItem>Create a test campaign with 1-2 contacts</ChecklistItem>
          <ChecklistItem>Verify emails are being received</ChecklistItem>
          <ChecklistItem>Set up n8n for automation (optional)</ChecklistItem>
          <ChecklistItem>Connect social accounts for DM outreach (optional)</ChecklistItem>
        </div>
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
          Your CSV file should have the following columns (header row required):
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-foreground">First Name,Last Name,Business Name,Email,Phone,Instagram,TikTok,Timezone</pre>
          <pre className="text-muted-foreground">John,Smith,Acme Corp,john@acme.com,+1234567890,@johnsmith,@johnsmith_tt,America/New_York</pre>
          <pre className="text-muted-foreground">Jane,Doe,Tech Inc,jane@tech.io,,,@janedoe_tt,Europe/London</pre>
        </div>
        <div className="mt-4 p-4 bg-warning/10 rounded-lg border border-warning/30">
          <p className="text-sm text-warning flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Optional columns can be left empty. Only Email is required for email campaigns.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Bulk Operations</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs text-primary font-bold">1</span>
            </div>
            <div>
              <strong className="text-foreground">Select Multiple:</strong> Use checkboxes to select individual contacts or click the header checkbox to select all.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs text-primary font-bold">2</span>
            </div>
            <div>
              <strong className="text-foreground">Bulk Delete:</strong> After selecting contacts, click the red "Delete" button to remove them.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs text-primary font-bold">3</span>
            </div>
            <div>
              <strong className="text-foreground">Filter by Status:</strong> Use the dropdown to filter by Pending, Sent, or Failed.
            </div>
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Statuses</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="font-medium text-foreground">Pending</span>
            <span className="text-muted-foreground">- Not yet contacted, waiting for campaign</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="font-medium text-foreground">Sent</span>
            <span className="text-muted-foreground">- Message successfully delivered</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-destructive" />
            <span className="font-medium text-foreground">Failed</span>
            <span className="text-muted-foreground">- Delivery failed (check email address)</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="font-medium text-foreground">Bounced</span>
            <span className="text-muted-foreground">- Email bounced (invalid address)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function InlineEditingDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Inline Editing</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Click-to-Edit Fields</h2>
        <p className="text-muted-foreground mb-4">
          Quickly update contact information without opening a separate form. Simply click on any field in the contacts table to edit it.
        </p>
        <div className="space-y-4">
          <Step number={1} title="Click on a Field">
            Click on any name, email, or business name in the contacts table. A pencil icon appears on hover.
          </Step>
          <Step number={2} title="Edit the Value">
            Type your changes directly in the input field that appears.
          </Step>
          <Step number={3} title="Save Changes">
            Press <kbd className="px-2 py-0.5 rounded bg-secondary text-foreground text-xs">Enter</kbd> to save, or click the green checkmark. Press <kbd className="px-2 py-0.5 rounded bg-secondary text-foreground text-xs">Escape</kbd> or the red X to cancel.
          </Step>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Editable Fields</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">First Name</strong> - Contact's first name
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Last Name</strong> - Contact's last name
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Email</strong> - Email address (validated)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Business Name</strong> - Company or organization
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6 border-primary/30">
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <MousePointer className="w-5 h-5" />
          Pro Tips
        </h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Changes save automatically when you press Enter or click outside</li>
          <li>• You can Tab through fields to edit multiple contacts quickly</li>
          <li>• Empty fields show placeholder text in italics</li>
          <li>• All edits are synced to the database instantly</li>
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
        <h2 className="text-2xl font-semibold text-foreground mb-4">Template Library</h2>
        <p className="text-muted-foreground mb-4">
          Access the Template Library from the sidebar to manage all your templates in one place:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Use Template</strong> - Click to apply template to a campaign
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Duplicate</strong> - Create a copy to customize
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Edit</strong> - Modify existing templates
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Delete</strong> - Remove unused templates
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Available Variables</h2>
        <p className="text-muted-foreground mb-4">
          Use these variables in your templates. They will be replaced with actual contact data:
        </p>
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
          <div className="bg-secondary/50 rounded-lg p-3">
            <code className="text-primary">{"{{handle}}"}</code>
            <p className="text-sm text-muted-foreground mt-1">Social media handle</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <code className="text-primary">{"{{platform}}"}</code>
            <p className="text-sm text-muted-foreground mt-1">Platform name (Instagram/TikTok)</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Template Types</h2>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📧 Email Templates</h3>
            <p className="text-muted-foreground text-sm">Full HTML emails with subject lines. Best for professional outreach.</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📱 Instagram DM Templates</h3>
            <p className="text-muted-foreground text-sm">Short, casual messages for Instagram direct messages.</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">🎵 TikTok DM Templates</h3>
            <p className="text-muted-foreground text-sm">Brief, engaging content for TikTok messages.</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">🎙️ Voicemail Scripts</h3>
            <p className="text-muted-foreground text-sm">Script templates for voice messages and calls.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Campaigns</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Campaign Wizard</h2>
        <p className="text-muted-foreground mb-4">Create campaigns using the step-by-step wizard:</p>
        <ol className="space-y-4 list-decimal list-inside">
          <li className="text-muted-foreground">
            <strong className="text-foreground">Company Info</strong> - Enter your company name and select mode (AI or Manual)
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Lead Selection</strong> - Choose how to import leads (CSV, existing contacts, or manual)
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Review Leads</strong> - Preview and select contacts for the campaign
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Build Sequence</strong> - Add email, DM, and follow-up steps with drag-and-drop reordering
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Launch</strong> - Review and launch your campaign
          </li>
        </ol>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Campaign Statuses</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full bg-secondary text-muted-foreground text-sm">draft</span>
            <span className="text-muted-foreground">Campaign created but not launched</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full bg-warning/10 text-warning text-sm">scheduled</span>
            <span className="text-muted-foreground">Set to launch at a future date/time</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">running</span>
            <span className="text-muted-foreground">Currently sending messages</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full bg-success/10 text-success text-sm">completed</span>
            <span className="text-muted-foreground">All messages have been sent</span>
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Email Tracking</h2>
        <p className="text-muted-foreground mb-4">
          Every email includes automatic tracking:
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Opens:</strong> Tracked via invisible 1x1 pixel
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Clicks:</strong> All links are wrapped for tracking
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Timestamps:</strong> Exact time of each event
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong className="text-foreground">Device Info:</strong> Browser and IP logged
          </li>
        </ul>
      </div>
    </div>
  );
}

function SocialDMDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Social DM Outreach</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Multi-Account Setup</h2>
        <p className="text-muted-foreground mb-4">
          Connect multiple Instagram and TikTok accounts to distribute your outreach and avoid rate limits:
        </p>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Account Rotation</strong> - Messages are distributed across accounts automatically
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Primary Account</strong> - Set one account as primary for each platform
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Individual Limits</strong> - Configure daily limits per account
            </div>
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Anti-Block Protection</h2>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Active Hours</h3>
            </div>
            <p className="text-muted-foreground text-sm">Set sending hours (e.g., 9 AM - 9 PM) to mimic human behavior</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Message Delays</h3>
            </div>
            <p className="text-muted-foreground text-sm">Random delays between 30s-10min to avoid detection</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Daily Limits</h3>
            </div>
            <p className="text-muted-foreground text-sm">Recommended: 30-50 DMs per account per day</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border-warning/50">
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warning" />
          Important Considerations
        </h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Instagram/TikTok don't have official DM APIs - use third-party tools carefully</li>
          <li>• Always warm up new accounts before high-volume sending</li>
          <li>• Vary your message content to avoid spam detection</li>
          <li>• Monitor account status daily for rate limit warnings</li>
          <li>• Keep daily sends under 50 per account to stay safe</li>
        </ul>
      </div>
    </div>
  );
}

function AnalyticsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📤 Total Sent</h3>
            <p className="text-muted-foreground text-sm">Total number of messages successfully delivered across all campaigns.</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">👁️ Open Rate</h3>
            <p className="text-muted-foreground text-sm">Percentage of sent emails that were opened. Formula: (Opens / Sent) × 100</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">🖱️ Click Rate</h3>
            <p className="text-muted-foreground text-sm">Percentage of opened emails where links were clicked. Formula: (Clicks / Opens) × 100</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📊 Reply Rate</h3>
            <p className="text-muted-foreground text-sm">Percentage of DMs that received a reply.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border-primary/30">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Understanding Your Metrics</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground">Good Open Rates</h3>
            <p className="text-sm text-muted-foreground">20-40% is considered good for cold outreach. Above 40% is excellent.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Good Click Rates</h3>
            <p className="text-sm text-muted-foreground">2-5% of opens is typical. Above 10% indicates highly engaged recipients.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Good DM Reply Rates</h3>
            <p className="text-sm text-muted-foreground">5-15% is typical for cold DM outreach. Personalization helps significantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function N8nDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">n8n Automation v2.0</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Enhanced Workflow Features</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Supabase Integration</strong> - All actions logged directly to your database
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Rate Limiting</strong> - Built-in limits prevent account blocks
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Error Handling</strong> - Automatic retry and error logging
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Multi-Channel</strong> - Email, DM, and Voicemail support
            </div>
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Database Tables Used</h2>
        <div className="space-y-3 font-mono text-sm">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="text-primary">campaign_contacts</span>
            <span className="text-muted-foreground"> - Delivery status (sent_at, opened_at, clicked_at)</span>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="text-primary">campaign_send_logs</span>
            <span className="text-muted-foreground"> - Detailed send events and errors</span>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="text-primary">activity_logs</span>
            <span className="text-muted-foreground"> - Full audit trail of all actions</span>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="text-primary">email_events</span>
            <span className="text-muted-foreground"> - Open/click tracking events</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Setup Steps</h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">1</span>
            </div>
            <div>
              <strong className="text-foreground">Download Workflow</strong>
              <p className="text-sm text-muted-foreground">Go to n8n tab and click "Download" to get the JSON file</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">2</span>
            </div>
            <div>
              <strong className="text-foreground">Import to n8n</strong>
              <p className="text-sm text-muted-foreground">Add Workflow → Import from File → Select JSON</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">3</span>
            </div>
            <div>
              <strong className="text-foreground">Add Supabase Credentials</strong>
              <p className="text-sm text-muted-foreground">Credentials → Supabase → Use your project URL and service role key</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">4</span>
            </div>
            <div>
              <strong className="text-foreground">Configure Email Provider</strong>
              <p className="text-sm text-muted-foreground">Add Brevo, SendGrid, or SMTP credentials</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">5</span>
            </div>
            <div>
              <strong className="text-foreground">Activate Workflow</strong>
              <p className="text-sm text-muted-foreground">Toggle Active to enable scheduled execution</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}

function DatabaseLoggingDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Database Logging</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Comprehensive Audit Trail</h2>
        <p className="text-muted-foreground mb-4">
          All actions in the platform are logged to your Supabase database for complete visibility:
        </p>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📊 activity_logs</h3>
            <p className="text-muted-foreground text-sm">Every user action: campaign creation, contact imports, template edits</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📧 campaign_send_logs</h3>
            <p className="text-muted-foreground text-sm">Detailed send events: success, failures, error codes, timestamps</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">👁️ email_events</h3>
            <p className="text-muted-foreground text-sm">Tracking events: opens, clicks, IP addresses, user agents</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📱 page_views</h3>
            <p className="text-muted-foreground text-sm">User navigation tracking for analytics</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Log Retention</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            All logs are retained indefinitely (no auto-deletion)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            Export logs via Supabase dashboard or API
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            Query logs for custom reports and analytics
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            RLS ensures users only see their own data
          </li>
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
        <h2 className="text-2xl font-semibold text-foreground mb-4">Brevo (Email) - Recommended</h2>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li>Sign up at <a href="https://brevo.com" target="_blank" className="text-primary hover:underline">brevo.com</a></li>
          <li>Go to Settings → SMTP & API → Create API Key</li>
          <li>Add BREVO_API_KEY to your settings or Supabase secrets</li>
          <li>Free tier: 300 emails/day</li>
        </ol>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">SendGrid (Alternative)</h2>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li>Sign up at <a href="https://sendgrid.com" target="_blank" className="text-primary hover:underline">sendgrid.com</a></li>
          <li>Verify your sender domain</li>
          <li>Create API key at Settings → API Keys</li>
          <li>Free tier: 100 emails/day</li>
        </ol>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Twilio (Voice/SMS)</h2>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li>Sign up at <a href="https://twilio.com" target="_blank" className="text-primary hover:underline">twilio.com</a></li>
          <li>Get Account SID and Auth Token from Console</li>
          <li>Purchase a phone number ($1/month for US numbers)</li>
          <li>Add credentials to n8n workflow or app settings</li>
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
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">❌ Emails not sending</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Verify API key is set correctly in settings</li>
              <li>• Check domain verification status with your provider</li>
              <li>• Review Edge Function logs in Supabase dashboard</li>
              <li>• Ensure the "from" email matches your verified domain</li>
            </ul>
          </div>
          
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">❌ DMs not sending</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Check account status in DM Account Setup</li>
              <li>• Verify daily limit hasn't been reached</li>
              <li>• Check for rate limit warnings or errors</li>
              <li>• Ensure active hours are configured correctly</li>
            </ul>
          </div>
          
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">❌ CSV import fails</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Ensure CSV has proper headers</li>
              <li>• Check for special characters or encoding issues (use UTF-8)</li>
              <li>• Verify email format is valid</li>
              <li>• Remove any blank rows from the CSV</li>
            </ul>
          </div>
          
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">❌ n8n workflow errors</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Check Supabase credentials are correct</li>
              <li>• Verify table names match your schema</li>
              <li>• Review execution logs in n8n for specific errors</li>
              <li>• Ensure rate limit settings aren't too aggressive</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border-primary/30">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Getting Help</h2>
        <p className="text-muted-foreground">
          For additional support, check the Supabase dashboard for function logs, 
          or review the activity_logs table for detailed error information.
        </p>
      </div>
    </div>
  );
}

// Helper Components
function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-sm text-primary font-bold">{number}</span>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{children}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded border border-border flex items-center justify-center">
        <CheckCircle className="w-3 h-3 text-transparent" />
      </div>
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}
