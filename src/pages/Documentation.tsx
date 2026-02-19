import { useState } from 'react';
import { 
  Book, Zap, Database, Mail, Users, FileText, 
  Play, Settings, Code, ChevronRight, ExternalLink,
  CheckCircle, AlertCircle, Workflow, PieChart, Edit3, 
  Upload, MousePointer, ArrowLeft, Shield, Clock, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'contacts', label: 'Managing Contacts', icon: Users },
  { id: 'inline-editing', label: 'Inline Editing', icon: Edit3 },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'campaigns', label: 'Campaigns', icon: Mail },
  { id: 'unified-inbox', label: 'Unified Inbox', icon: Mail },
  { id: 'social-dm', label: 'Social DM Outreach', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics Dashboard', icon: PieChart },
  { id: 'db-schema', label: 'Database Schema', icon: Database },
  { id: 'backup-scripts', label: 'Backup SQL Scripts', icon: Code },
  { id: 'n8n-automation', label: 'n8n Automation', icon: Workflow },
  { id: 'database-logging', label: 'Database Logging', icon: Database },
  { id: 'db-migration', label: 'PostgreSQL Migration', icon: Database },
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
          {activeSection === 'unified-inbox' && <UnifiedInboxDocs />}
          {activeSection === 'social-dm' && <SocialDMDocs />}
          {activeSection === 'analytics' && <AnalyticsDocs />}
          {activeSection === 'db-schema' && <DatabaseSchemaDocs />}
          {activeSection === 'backup-scripts' && <BackupScriptsDocs />}
          {activeSection === 'n8n-automation' && <N8nDocs />}
          {activeSection === 'database-logging' && <DatabaseLoggingDocs />}
          {activeSection === 'db-migration' && <DatabaseMigrationDocs />}
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

function DatabaseMigrationDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">PostgreSQL Migration</h1>
      
      <div className="glass-card rounded-xl p-6 border-warning/50">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-warning" />
          <h2 className="text-2xl font-semibold text-foreground">Before You Begin</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Migrating from Supabase to a self-hosted PostgreSQL database requires careful planning. 
          Ensure you have a backup and test the migration in a staging environment first.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            Auth users are stored in Supabase's auth schema - you'll need an alternative auth system
          </li>
          <li className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            RLS policies use auth.uid() - these need to be adapted for your auth system
          </li>
          <li className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            Edge Functions need to be rewritten as standard backend APIs
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Step 1: Export Schema</h2>
        <p className="text-muted-foreground mb-4">
          Export your database schema from Supabase using pg_dump:
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-foreground">{`# Get your database connection string from Supabase Dashboard
# Settings → Database → Connection string

pg_dump \\
  --schema=public \\
  --schema-only \\
  --no-owner \\
  --no-privileges \\
  "postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres" \\
  > schema.sql`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Step 2: Export Data</h2>
        <p className="text-muted-foreground mb-4">
          Export your data (without schema) for the public tables:
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-foreground">{`pg_dump \\
  --schema=public \\
  --data-only \\
  --no-owner \\
  --no-privileges \\
  "postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres" \\
  > data.sql`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Step 3: Modify Schema for Standard PostgreSQL</h2>
        <p className="text-muted-foreground mb-4">
          Update the schema to work without Supabase-specific features:
        </p>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Remove RLS Policies</h3>
            <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-foreground">{`-- Remove all RLS-related statements
-- DELETE: ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- DELETE: CREATE POLICY ... ON ... USING (auth.uid() = ...);

-- Or keep RLS but replace auth.uid() with your auth system:
-- CREATE POLICY "user_access" ON contacts
-- USING (user_id = current_setting('app.current_user_id')::uuid);`}</pre>
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Remove Supabase Functions</h3>
            <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-foreground">{`-- Replace auth.uid() references
-- Before: WHERE user_id = auth.uid()
-- After:  WHERE user_id = $1  (use parameterized queries)

-- Remove functions that reference auth schema:
-- has_role(), handle_new_user(), etc.`}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Step 4: Import to New PostgreSQL</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-foreground">{`# Create new database
createdb outreachflow

# Import schema
psql -d outreachflow -f schema_modified.sql

# Import data
psql -d outreachflow -f data.sql

# Verify data
psql -d outreachflow -c "SELECT COUNT(*) FROM contacts;"`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Step 5: Update Application Code</h2>
        <p className="text-muted-foreground mb-4">
          Replace Supabase client with a standard PostgreSQL client:
        </p>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Install PostgreSQL Client</h3>
            <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs">
              <pre className="text-foreground">{`npm install pg
# or for TypeScript
npm install @types/pg`}</pre>
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Create Database Connection</h3>
            <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-foreground">{`// db.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
});

// Query example
export async function getContacts(userId: string) {
  const result = await pool.query(
    'SELECT * FROM contacts WHERE user_id = $1',
    [userId]
  );
  return result.rows;
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Step 6: Replace Edge Functions</h2>
        <p className="text-muted-foreground mb-4">
          Convert Supabase Edge Functions to Express/Node.js endpoints:
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-foreground">{`// server.js - Express equivalent of Edge Functions
import express from 'express';
import { pool } from './db';

const app = express();
app.use(express.json());

// Before: supabase/functions/send-campaign-emails/index.ts
// After: 
app.post('/api/send-campaign-emails', async (req, res) => {
  const { campaignId } = req.body;
  
  // Your email sending logic here
  const contacts = await pool.query(
    'SELECT * FROM campaign_contacts WHERE campaign_id = $1',
    [campaignId]
  );
  
  // Send emails...
  res.json({ success: true });
});

app.listen(3001);`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Tables to Migrate</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="font-mono text-primary">contacts</span>
            <p className="text-muted-foreground text-xs mt-1">All contact records</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="font-mono text-primary">templates</span>
            <p className="text-muted-foreground text-xs mt-1">Email/DM templates</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="font-mono text-primary">campaigns</span>
            <p className="text-muted-foreground text-xs mt-1">Campaign definitions</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="font-mono text-primary">campaign_contacts</span>
            <p className="text-muted-foreground text-xs mt-1">Campaign recipients & status</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="font-mono text-primary">email_events</span>
            <p className="text-muted-foreground text-xs mt-1">Open/click tracking</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="font-mono text-primary">activity_logs</span>
            <p className="text-muted-foreground text-xs mt-1">Audit trail</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="font-mono text-primary">social_accounts</span>
            <p className="text-muted-foreground text-xs mt-1">DM account settings</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <span className="font-mono text-primary">email_settings</span>
            <p className="text-muted-foreground text-xs mt-1">API credentials</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border-primary/30">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Authentication Alternatives</h2>
        <p className="text-muted-foreground mb-4">
          After migration, you'll need to implement your own authentication:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">NextAuth.js</strong>
              <p className="text-sm text-muted-foreground">Full-featured auth for Next.js apps</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Passport.js</strong>
              <p className="text-sm text-muted-foreground">Flexible authentication for Express</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Auth0 / Clerk</strong>
              <p className="text-sm text-muted-foreground">Managed auth services (similar to Supabase Auth)</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Custom JWT</strong>
              <p className="text-sm text-muted-foreground">Roll your own with bcrypt + jsonwebtoken</p>
            </div>
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

function UnifiedInboxDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Unified Inbox</h1>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          The Unified Inbox consolidates all inbound replies from email campaigns and social DM outreach into a single view. Filter by channel, status, or campaign.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">Auto-matching</strong> — Replies linked to campaigns &amp; contacts</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">Read tracking</strong> — Messages marked read when opened</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">Star &amp; Archive</strong> — Organize with stars and archiving</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">Reply inline</strong> — Compose replies directly</li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sources</h2>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📧 email_inbox table</h3>
            <p className="text-muted-foreground text-sm">Inbound emails matched via <code className="text-primary">inbound-email-webhook</code>. Linked to campaigns and contacts via foreign keys.</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">💬 dm_campaign_contacts table</h3>
            <p className="text-muted-foreground text-sm">DM replies tracked via <code className="text-primary">replied_at</code> timestamp. Joins with <code className="text-primary">creators</code> and <code className="text-primary">dm_campaigns</code>.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Filters</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'All', desc: 'Every message across all channels' },
            { label: 'Unread', desc: 'Messages not yet opened' },
            { label: 'Starred', desc: 'Flagged messages' },
            { label: 'Campaigns', desc: 'Replies linked to a campaign' },
            { label: 'Email', desc: 'Email channel only' },
            { label: 'Instagram', desc: 'Instagram DM replies' },
            { label: 'TikTok', desc: 'TikTok DM replies' },
          ].map(f => (
            <div key={f.label} className="bg-secondary/50 rounded-lg p-3">
              <code className="text-primary">{f.label}</code>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseSchemaDocs() {
  const tables = [
    { name: 'profiles', cols: 'id (uuid PK = auth.uid), email (text), full_name (text), avatar_url (text), created_at, updated_at', rls: 'SELECT/UPDATE by owner' },
    { name: 'contacts', cols: 'id (uuid PK), user_id (uuid), first_name, last_name, email, business_name, phone, instagram, tiktok, linkedin, job_title, location, city, state, country, timezone (default UTC), status (default pending), tags (text[]), bounced (bool), bounce_type, bounced_at, unsubscribed (bool), unsubscribed_at, email_sent, dm_sent, voicemail_sent, created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'templates', cols: 'id (uuid PK), user_id (uuid), name (text NOT NULL), subject (text), content (text), type (text: email|instagram|tiktok|linkedin|voicemail), created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'campaigns', cols: 'id (uuid PK), user_id (uuid), name (text NOT NULL), status (default draft), template_id (uuid FK→templates), scheduled_at, started_at, completed_at, total_contacts (int), sent_count, open_count, click_count, ab_testing_enabled (bool), variant_a/b_subject, variant_a/b_content, variant_a/b_sent/opens/clicks, use_recipient_timezone (bool), optimal_send_hour (int), created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'campaign_contacts', cols: 'id (uuid PK), campaign_id (uuid FK→campaigns), contact_id (uuid FK→contacts), status (default pending), sent_at, opened_at, clicked_at, bounced_at, bounce_type, error_message, variant (text)', rls: 'CRUD via campaigns.user_id join' },
    { name: 'campaign_templates', cols: 'id (uuid PK), user_id (uuid), name (text NOT NULL), description (text), category (default Sales), steps (int default 1), featured (bool), sequence_data (jsonb default []), created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'campaign_send_logs', cols: 'id (uuid PK), campaign_id (uuid FK→campaigns), campaign_contact_id (uuid FK→campaign_contacts), event_type (text), status (text), error_message, error_code, provider, message_id, metadata (jsonb), ip_address, user_agent, created_at', rls: 'INSERT public; SELECT via campaigns join' },
    { name: 'email_events', cols: 'id (uuid PK), campaign_contact_id (uuid FK→campaign_contacts), event_type (text), metadata (jsonb), ip_address, user_agent, created_at', rls: 'INSERT public; SELECT via campaigns join' },
    { name: 'email_inbox', cols: 'id (uuid PK), user_id (uuid), from_email (text NOT NULL), from_name, to_email (text NOT NULL), subject, body_text, body_html, is_read (bool), is_starred (bool), folder (default inbox), message_id, in_reply_to, campaign_id (FK→campaigns), campaign_contact_id (FK→campaign_contacts), contact_id (FK→contacts), received_at, created_at', rls: 'Full CRUD by owner + public INSERT' },
    { name: 'email_settings', cols: 'id (uuid PK), user_id (uuid), smtp_host, smtp_port (default 587), smtp_user, smtp_password, brevo_api_key, sendgrid_key, twilio_sid, twilio_token, twilio_number, created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'email_warmup_schedules', cols: 'id (uuid PK), user_id (uuid), domain (text), warmup_start_date (date), current_daily_limit (int default 10), target_daily_limit (int default 500), increment_per_day (int default 10), emails_sent_today (int), last_send_date (date), status (default active), created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'email_deliverability_tests', cols: 'id (uuid PK), user_id (uuid), email (text), test_type (default inbox_placement), status (default pending), spam_score (numeric), inbox_placement (text), result (jsonb), authentication_results (jsonb), warnings (text[]), completed_at, created_at', rls: 'Full CRUD by owner' },
    { name: 'follow_up_sequences', cols: 'id (uuid PK), user_id (uuid), campaign_id (uuid FK→campaigns), template_id (uuid FK→templates), name (text NOT NULL), trigger_type (default opened_not_clicked), delay_hours (int default 24), subject, content, status (default active), created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'follow_up_queue', cols: 'id (uuid PK), sequence_id (uuid FK→follow_up_sequences), campaign_contact_id (uuid FK→campaign_contacts), scheduled_at (timestamptz), sent_at, status (default pending), created_at', rls: 'CRUD via sequences.user_id join' },
    { name: 'dm_campaigns', cols: 'id (uuid PK), user_id (uuid), name (text NOT NULL), platform (text NOT NULL), status (default draft), template_id (uuid FK→templates), total_contacts, sent_count, reply_count, scheduled_at, started_at, completed_at, created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'dm_campaign_contacts', cols: 'id (uuid PK), dm_campaign_id (uuid FK→dm_campaigns), creator_id (uuid FK→creators), status (default pending), sent_at, replied_at, error_message, created_at', rls: 'SELECT/INSERT/UPDATE via dm_campaigns join' },
    { name: 'creators', cols: 'id (uuid PK), user_id (uuid), name (text NOT NULL), handle (text NOT NULL), platform (default instagram), bio, avatar, followers, engagement, avg_likes, category (text[]), location, recent_post, verified (bool), created_at, updated_at', rls: 'SELECT public; INSERT/UPDATE/DELETE by owner' },
    { name: 'activity_logs', cols: 'id (uuid PK), user_id (uuid), entity_type (text), entity_id (uuid), action_type (text), metadata (jsonb), created_at', rls: 'INSERT public + by owner; SELECT by owner' },
    { name: 'page_views', cols: 'id (uuid PK), user_id (uuid), page_name (text), path (text), metadata (jsonb), created_at', rls: 'INSERT/SELECT by owner' },
    { name: 'country_timezones', cols: 'id (uuid PK), country_code (text), country_name (text), timezone (text), utc_offset (int)', rls: 'SELECT public (read-only)' },
    { name: 'ads_campaigns', cols: 'id (uuid PK), user_id (uuid), name, status, platforms (text[]), budget, spent, reach, impressions, clicks, ctr, cpc, results, result_type, objective, start_date, end_date, target_audience (jsonb), ad_creative (jsonb), created_at, updated_at', rls: 'Full CRUD by owner' },
    { name: 'campaign_invitations', cols: 'id (uuid PK), brand_user_id (uuid), campaign_id (FK→ads_campaigns), creator_id (FK→creators), message, budget_offered, deliverables (jsonb), deadline, status, responded_at, created_at, updated_at', rls: 'INSERT/UPDATE/SELECT by brand + SELECT/UPDATE by creator' },
    { name: 'collaboration_contracts', cols: 'id (uuid PK), brand_user_id (uuid), creator_id (FK→creators), invitation_id (FK→campaign_invitations), title, description, terms, deliverables (jsonb), payment_amount, payment_currency, payment_terms, start_date, end_date, status, brand_signature, brand_signed_at, creator_signature, creator_signed_at, exclusivity_clause, usage_rights, cancellation_terms, expires_at, created_at, updated_at', rls: 'ALL by brand; SELECT/UPDATE by creator' },
    { name: 'contract_templates', cols: 'id (uuid PK), user_id (uuid), name, description, terms_template, deliverables_template (jsonb), payment_terms_template, exclusivity_template, usage_rights_template, cancellation_template, is_default (bool), created_at, updated_at', rls: 'ALL by owner' },
    { name: 'contract_activity', cols: 'id (uuid PK), contract_id (FK→collaboration_contracts), user_id (uuid), action (text), details (jsonb), ip_address, user_agent, created_at', rls: 'INSERT/SELECT by contract parties' },
    { name: 'content_posts', cols: 'id (uuid PK), user_id (uuid), title, content, type (default image), status (default draft), platforms (text[]), media_urls (text[]), thumbnail_url, scheduled_for, published_at, views_count, likes_count, comments_count, shares_count, created_at, updated_at', rls: 'CRUD by owner; SELECT published' },
    { name: 'content_comments', cols: 'id (uuid PK), post_id (FK→content_posts), user_id (uuid), content (text), created_at', rls: 'SELECT public; INSERT/DELETE by owner' },
    { name: 'content_reports', cols: 'id (uuid PK), post_id (FK→content_posts), user_id (uuid), reason (text), description, status (default pending), created_at', rls: 'INSERT/SELECT by owner' },
    { name: 'conversations', cols: 'id (uuid PK), participant_ids (uuid[]), platform (default messenger), last_message, last_message_at, created_at, updated_at', rls: 'INSERT/UPDATE/SELECT by participant' },
    { name: 'messages', cols: 'id (uuid PK), conversation_id (FK→conversations), sender_id (uuid), content (text), is_read (bool), created_at', rls: 'INSERT/SELECT by conversation participant' },
    { name: 'saved_creators', cols: 'id (uuid PK), user_id (uuid), creator_id (FK→creators), created_at', rls: 'CRUD by owner' },
    { name: 'saved_filters', cols: 'id (uuid PK), user_id (uuid), name (text), page (text), filters (jsonb), is_default (bool), created_at, updated_at', rls: 'CRUD by owner' },
    { name: 'business_details', cols: 'id (uuid PK), user_id (uuid), company_name, billing_address, city, state, postal_code, country, phone, tax_id, created_at, updated_at', rls: 'INSERT/UPDATE/SELECT by owner' },
    { name: 'credit_transactions', cols: 'id (uuid PK), user_id (uuid), amount (int), type (text), tool_used, description, created_at', rls: 'INSERT/SELECT by owner' },
    { name: 'signatures', cols: 'id (uuid PK), user_id (uuid), document_name, document_url, recipient_email, recipient_name, signature_data, signed_at, expires_at, status (default pending), created_at, updated_at', rls: 'CRUD by owner' },
    { name: 'signature_templates', cols: 'id (uuid PK), user_id (uuid), name, content, fields (jsonb), created_at, updated_at', rls: 'CRUD by owner' },
    { name: 'portfolio_items', cols: 'id (uuid PK), creator_id (FK→creators), title, description, image_url (text NOT NULL), link, created_at, updated_at', rls: 'CRUD by creator owner' },
    { name: 'creator_earnings', cols: 'id (uuid PK), creator_id (FK→creators), campaign_invitation_id (FK→campaign_invitations), amount (numeric NOT NULL), currency (default USD), status (default pending), paid_at, created_at', rls: 'SELECT by creator' },
    { name: 'processing_history', cols: 'id (uuid PK), user_id (uuid), tool_id (text), file_name, file_size, output_format, credits_used, metadata (jsonb), status, created_at', rls: 'CRUD by owner' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Database Schema Reference</h1>
      <p className="text-muted-foreground">Complete reference for all {tables.length} tables with columns, types, defaults, and RLS policies.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Connection Info</h2>
        <p className="text-sm text-muted-foreground mb-4">Use these to connect from external tools or your backend.</p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto space-y-1">
          <p><span className="text-muted-foreground">Project ID:</span> syqawvakxxfaohcgrenn</p>
          <p><span className="text-muted-foreground">API URL:</span> https://syqawvakxxfaohcgrenn.supabase.co</p>
          <p><span className="text-muted-foreground">DB Host:</span> db.syqawvakxxfaohcgrenn.supabase.co</p>
          <p><span className="text-muted-foreground">DB Port:</span> 5432</p>
          <p><span className="text-muted-foreground">DB Name:</span> postgres</p>
          <p><span className="text-muted-foreground">Anon Key:</span> eyJhbGciOiJIUzI1NiIs... (see .env)</p>
          <p className="text-muted-foreground mt-2">// Use SUPABASE_DB_URL secret for direct Postgres connections</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">All Tables ({tables.length})</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {tables.map(t => (
            <details key={t.name} className="border border-border rounded-lg group">
              <summary className="p-3 cursor-pointer hover:bg-secondary/50 flex items-center justify-between">
                <span className="font-semibold text-foreground font-mono text-sm">{t.name}</span>
                <Badge variant="outline" className="text-[10px]">{t.rls}</Badge>
              </summary>
              <div className="px-3 pb-3 text-xs text-muted-foreground font-mono leading-relaxed">
                {t.cols}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Foreign Key Relationships</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto">
          <pre>{`campaigns.template_id → templates.id
campaign_contacts.campaign_id → campaigns.id
campaign_contacts.contact_id → contacts.id
campaign_send_logs.campaign_id → campaigns.id
campaign_send_logs.campaign_contact_id → campaign_contacts.id
email_events.campaign_contact_id → campaign_contacts.id
email_inbox.campaign_id → campaigns.id
email_inbox.contact_id → contacts.id
email_inbox.campaign_contact_id → campaign_contacts.id
follow_up_sequences.campaign_id → campaigns.id
follow_up_sequences.template_id → templates.id
follow_up_queue.sequence_id → follow_up_sequences.id
follow_up_queue.campaign_contact_id → campaign_contacts.id
dm_campaigns.template_id → templates.id
dm_campaign_contacts.dm_campaign_id → dm_campaigns.id
dm_campaign_contacts.creator_id → creators.id
campaign_invitations.campaign_id → ads_campaigns.id
campaign_invitations.creator_id → creators.id
collaboration_contracts.creator_id → creators.id
collaboration_contracts.invitation_id → campaign_invitations.id
contract_activity.contract_id → collaboration_contracts.id
content_comments.post_id → content_posts.id
content_reports.post_id → content_posts.id
messages.conversation_id → conversations.id
saved_creators.creator_id → creators.id
portfolio_items.creator_id → creators.id
creator_earnings.creator_id → creators.id
creator_earnings.campaign_invitation_id → campaign_invitations.id`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Database Functions</h2>
        <div className="space-y-3">
          {[
            { name: 'handle_new_user()', desc: 'Trigger on auth.users INSERT — creates profile, assigns role, gives 300 credits, creates creator profile if role=creator', type: 'TRIGGER' },
            { name: 'create_sample_templates_for_user()', desc: 'Trigger on auth.users INSERT — seeds 13 email/DM templates + 4 campaign templates for new users', type: 'TRIGGER' },
            { name: 'create_default_contract_templates()', desc: 'Trigger on auth.users INSERT — seeds 3 default contract templates', type: 'TRIGGER' },
            { name: 'update_updated_at_column()', desc: 'Generic trigger to set updated_at = now() before UPDATE on any attached table', type: 'TRIGGER' },
            { name: 'deduct_credits(user_id, amount, tool, desc)', desc: 'Deducts credits from user balance. Admins bypass deduction. Returns boolean success.', type: 'FUNCTION' },
            { name: 'has_role(user_id, role)', desc: 'Security definer function checking user_roles. Used in RLS policies to avoid recursion.', type: 'FUNCTION' },
          ].map(fn => (
            <div key={fn.name} className="p-3 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Code className="w-4 h-4 text-primary shrink-0" />
                <span className="font-mono text-sm text-foreground font-semibold">{fn.name}</span>
                <Badge variant="outline" className="text-[10px]">{fn.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground ml-6">{fn.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Storage Buckets</h2>
        <div className="space-y-2">
          {[
            { name: 'avatars', public: true, desc: 'User and creator profile images' },
            { name: 'portfolio', public: true, desc: 'Creator portfolio images' },
            { name: 'documents', public: false, desc: 'Private documents and contracts' },
          ].map(b => (
            <div key={b.name} className="p-3 border border-border rounded-lg flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-foreground">{b.name}</span>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
              <Badge variant={b.public ? 'secondary' : 'outline'} className="text-[10px]">
                {b.public ? 'Public' : 'Private'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">RLS Policy Pattern</h2>
        <p className="text-muted-foreground mb-3">All user-owned tables use Row-Level Security:</p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-foreground">
          <pre>{`-- Direct ownership
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)

-- Via join (e.g. campaign_contacts)
USING (EXISTS (
  SELECT 1 FROM campaigns
  WHERE campaigns.id = campaign_contacts.campaign_id
  AND campaigns.user_id = auth.uid()
))

-- Admin check (avoids recursion)
SELECT public.has_role(auth.uid(), 'admin')`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Edge Functions</h2>
        <div className="space-y-3">
          {[
            { name: 'send-campaign-emails', desc: 'Sends emails via Brevo/SendGrid with open/click tracking pixels' },
            { name: 'track-email', desc: 'Records open & click events from tracking pixels' },
            { name: 'inbound-email-webhook', desc: 'Processes inbound emails, matches to campaigns & contacts' },
            { name: 'match-email-replies', desc: 'Matches reply emails to campaign contacts via message_id/in_reply_to' },
            { name: 'process-follow-ups', desc: 'Checks follow_up_queue and sends scheduled follow-up emails' },
            { name: 'process-scheduled-campaigns', desc: 'Launches campaigns at their scheduled_at time' },
            { name: 'test-deliverability', desc: 'Tests email deliverability, SPF/DKIM/DMARC, and spam score' },
          ].map(fn => (
            <div key={fn.name} className="p-3 border border-border rounded-lg flex items-start gap-3">
              <Code className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="font-mono text-foreground text-sm">{fn.name}</span>
                <p className="text-xs text-muted-foreground">{fn.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BackupScriptsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Backup SQL Scripts</h1>
      <p className="text-muted-foreground">Copy these scripts to recreate the schema. Run in the Supabase SQL Editor or any PostgreSQL client.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Core Outreach Tables</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto max-h-[500px] overflow-y-auto">
          <pre>{`-- contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  first_name text, last_name text, email text,
  business_name text, phone text, instagram text, tiktok text, linkedin text,
  job_title text, location text, city text, state text, country text,
  timezone text DEFAULT 'UTC', status text DEFAULT 'pending',
  tags text[] DEFAULT '{}', bounced boolean DEFAULT false,
  bounce_type text, bounced_at timestamptz,
  unsubscribed boolean DEFAULT false, unsubscribed_at timestamptz,
  email_sent boolean DEFAULT false, dm_sent boolean DEFAULT false,
  voicemail_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- templates
CREATE TABLE IF NOT EXISTS public.templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, name text NOT NULL,
  subject text, content text, type text DEFAULT 'email',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, name text NOT NULL,
  status text DEFAULT 'draft', template_id uuid REFERENCES public.templates(id),
  scheduled_at timestamptz, started_at timestamptz, completed_at timestamptz,
  total_contacts int DEFAULT 0, sent_count int DEFAULT 0,
  open_count int DEFAULT 0, click_count int DEFAULT 0,
  ab_testing_enabled boolean DEFAULT false,
  variant_a_subject text, variant_a_content text, variant_a_sent int DEFAULT 0,
  variant_a_opens int DEFAULT 0, variant_a_clicks int DEFAULT 0,
  variant_b_subject text, variant_b_content text, variant_b_sent int DEFAULT 0,
  variant_b_opens int DEFAULT 0, variant_b_clicks int DEFAULT 0,
  use_recipient_timezone boolean DEFAULT false, optimal_send_hour int DEFAULT 9,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- campaign_contacts
CREATE TABLE IF NOT EXISTS public.campaign_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  contact_id uuid NOT NULL REFERENCES public.contacts(id),
  status text DEFAULT 'pending', variant text,
  sent_at timestamptz, opened_at timestamptz, clicked_at timestamptz,
  bounced_at timestamptz, bounce_type text, error_message text
);
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;

-- campaign_templates
CREATE TABLE IF NOT EXISTS public.campaign_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, name text NOT NULL,
  description text, category text DEFAULT 'Sales',
  steps int DEFAULT 1, featured boolean DEFAULT false,
  sequence_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

-- campaign_send_logs
CREATE TABLE IF NOT EXISTS public.campaign_send_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  campaign_contact_id uuid NOT NULL REFERENCES public.campaign_contacts(id),
  event_type text NOT NULL, status text NOT NULL,
  error_message text, error_code text, provider text,
  message_id text, metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text, user_agent text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.campaign_send_logs ENABLE ROW LEVEL SECURITY;

-- email_events
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_contact_id uuid NOT NULL REFERENCES public.campaign_contacts(id),
  event_type text NOT NULL, metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text, user_agent text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- email_inbox
CREATE TABLE IF NOT EXISTS public.email_inbox (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, from_email text NOT NULL, to_email text NOT NULL,
  from_name text, subject text, body_text text, body_html text,
  is_read boolean DEFAULT false, is_starred boolean DEFAULT false,
  folder text DEFAULT 'inbox', message_id text, in_reply_to text,
  campaign_id uuid REFERENCES public.campaigns(id),
  campaign_contact_id uuid REFERENCES public.campaign_contacts(id),
  contact_id uuid REFERENCES public.contacts(id),
  received_at timestamptz DEFAULT now(), created_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_inbox ENABLE ROW LEVEL SECURITY;

-- email_settings
CREATE TABLE IF NOT EXISTS public.email_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  smtp_host text, smtp_port text DEFAULT '587', smtp_user text, smtp_password text,
  brevo_api_key text, sendgrid_key text,
  twilio_sid text, twilio_token text, twilio_number text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- email_warmup_schedules
CREATE TABLE IF NOT EXISTS public.email_warmup_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, domain text NOT NULL,
  warmup_start_date date DEFAULT CURRENT_DATE,
  current_daily_limit int DEFAULT 10, target_daily_limit int DEFAULT 500,
  increment_per_day int DEFAULT 10, emails_sent_today int DEFAULT 0,
  last_send_date date, status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_warmup_schedules ENABLE ROW LEVEL SECURITY;

-- email_deliverability_tests
CREATE TABLE IF NOT EXISTS public.email_deliverability_tests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, email text NOT NULL,
  test_type text DEFAULT 'inbox_placement', status text DEFAULT 'pending',
  spam_score numeric, inbox_placement text,
  result jsonb DEFAULT '{}'::jsonb, authentication_results jsonb DEFAULT '{}'::jsonb,
  warnings text[], completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_deliverability_tests ENABLE ROW LEVEL SECURITY;`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Follow-ups & DM Tables</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto max-h-[400px] overflow-y-auto">
          <pre>{`-- follow_up_sequences
CREATE TABLE IF NOT EXISTS public.follow_up_sequences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, campaign_id uuid REFERENCES public.campaigns(id),
  template_id uuid REFERENCES public.templates(id),
  name text NOT NULL, trigger_type text DEFAULT 'opened_not_clicked',
  delay_hours int DEFAULT 24, subject text, content text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- follow_up_queue
CREATE TABLE IF NOT EXISTS public.follow_up_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id uuid NOT NULL REFERENCES public.follow_up_sequences(id),
  campaign_contact_id uuid NOT NULL REFERENCES public.campaign_contacts(id),
  scheduled_at timestamptz NOT NULL, sent_at timestamptz,
  status text DEFAULT 'pending', created_at timestamptz DEFAULT now()
);

-- dm_campaigns
CREATE TABLE IF NOT EXISTS public.dm_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, name text NOT NULL, platform text NOT NULL,
  status text DEFAULT 'draft', template_id uuid REFERENCES public.templates(id),
  total_contacts int DEFAULT 0, sent_count int DEFAULT 0, reply_count int DEFAULT 0,
  scheduled_at timestamptz, started_at timestamptz, completed_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- dm_campaign_contacts
CREATE TABLE IF NOT EXISTS public.dm_campaign_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dm_campaign_id uuid NOT NULL REFERENCES public.dm_campaigns(id),
  creator_id uuid NOT NULL REFERENCES public.creators(id),
  status text DEFAULT 'pending', sent_at timestamptz, replied_at timestamptz,
  error_message text, created_at timestamptz DEFAULT now()
);

-- creators
CREATE TABLE IF NOT EXISTS public.creators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid, name text NOT NULL, handle text NOT NULL,
  platform text DEFAULT 'instagram', bio text, avatar text,
  followers text, engagement text, avg_likes text,
  category text[], location text, recent_post text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Collaboration & Content Tables</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto max-h-[400px] overflow-y-auto">
          <pre>{`-- ads_campaigns
CREATE TABLE IF NOT EXISTS public.ads_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, name text NOT NULL,
  status text DEFAULT 'draft', platforms text[] DEFAULT ARRAY['facebook'],
  budget numeric, spent numeric DEFAULT 0, objective text,
  reach int DEFAULT 0, impressions int DEFAULT 0, clicks int DEFAULT 0,
  ctr numeric DEFAULT 0, cpc numeric DEFAULT 0,
  results int DEFAULT 0, result_type text,
  start_date date, end_date date,
  target_audience jsonb, ad_creative jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- collaboration_contracts
CREATE TABLE IF NOT EXISTS public.collaboration_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_user_id uuid NOT NULL,
  creator_id uuid REFERENCES public.creators(id),
  invitation_id uuid REFERENCES public.campaign_invitations(id),
  title text NOT NULL, description text, terms text NOT NULL,
  deliverables jsonb DEFAULT '[]'::jsonb,
  payment_amount numeric, payment_currency text DEFAULT 'USD',
  payment_terms text, start_date date, end_date date,
  status text DEFAULT 'draft',
  brand_signature text, brand_signed_at timestamptz,
  creator_signature text, creator_signed_at timestamptz,
  exclusivity_clause text, usage_rights text,
  cancellation_terms text, expires_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- content_posts
CREATE TABLE IF NOT EXISTS public.content_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, title text NOT NULL,
  content text, type text DEFAULT 'image', status text DEFAULT 'draft',
  platforms text[] DEFAULT ARRAY['instagram'],
  media_urls text[] DEFAULT ARRAY[]::text[],
  thumbnail_url text, scheduled_for timestamptz, published_at timestamptz,
  views_count int DEFAULT 0, likes_count int DEFAULT 0,
  comments_count int DEFAULT 0, shares_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY, -- matches auth.users.id
  email text, full_name text, avatar_url text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, entity_type text NOT NULL,
  entity_id uuid, action_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Stored Procedures & Triggers</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto max-h-[400px] overflow-y-auto">
          <pre>{`-- Auto-update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Attach to tables:
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- New user handler (creates profile + role + credits)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE user_role TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'user');
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role::app_role);
  INSERT INTO public.user_credits (user_id, balance, total_purchased) VALUES (NEW.id, 300, 0);
  IF user_role = 'creator' THEN
    INSERT INTO public.creators (user_id, name, handle, bio)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Creator'),
            LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'creator'), ' ', '_'))
            || '_' || SUBSTRING(NEW.id::text, 1, 8), '');
  END IF;
  RETURN NEW;
END; $$;

-- Credit deduction function
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid, p_amount int, p_tool text, p_description text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE current_balance INTEGER; is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin') INTO is_admin;
  IF is_admin THEN
    INSERT INTO public.credit_transactions (user_id, amount, type, tool_used, description)
    VALUES (p_user_id, 0, 'admin_usage', p_tool, p_description);
    RETURN TRUE;
  END IF;
  SELECT balance INTO current_balance FROM public.user_credits WHERE user_id = p_user_id FOR UPDATE;
  IF current_balance IS NULL OR current_balance < p_amount THEN RETURN FALSE; END IF;
  UPDATE public.user_credits SET balance = balance - p_amount, updated_at = now() WHERE user_id = p_user_id;
  INSERT INTO public.credit_transactions (user_id, amount, type, tool_used, description)
  VALUES (p_user_id, -p_amount, 'usage', p_tool, p_description);
  RETURN TRUE;
END; $$;

-- Role check (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;`}</pre>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Edge Functions</h2>
        <div className="space-y-3">
          {[
            { name: 'send-campaign-emails', desc: 'Sends emails via Brevo/SendGrid with tracking pixels. Reads email_settings, updates campaign_contacts status.' },
            { name: 'track-email', desc: 'Handles open/click tracking pixel requests. Inserts into email_events and updates campaign_contacts.' },
            { name: 'inbound-email-webhook', desc: 'Webhook endpoint for inbound email providers. Inserts into email_inbox, matches via message_id.' },
            { name: 'match-email-replies', desc: 'Background function to match unlinked inbox emails to campaign contacts.' },
            { name: 'process-follow-ups', desc: 'Processes follow_up_queue entries whose scheduled_at has passed.' },
            { name: 'process-scheduled-campaigns', desc: 'Checks campaigns with status=scheduled and scheduled_at <= now(), launches them.' },
            { name: 'test-deliverability', desc: 'Tests SPF/DKIM/DMARC records and spam score for a given email address.' },
          ].map(fn => (
            <div key={fn.name} className="p-3 border border-border rounded-lg flex items-start gap-3">
              <Code className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="font-mono text-foreground text-sm">{fn.name}</span>
                <p className="text-xs text-muted-foreground">{fn.desc}</p>
              </div>
            </div>
          ))}
        </div>
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
