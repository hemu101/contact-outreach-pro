import { useState } from 'react';
import { 
  Book, Zap, Database, Mail, Users, FileText, 
  Play, Settings, Code, ChevronRight, ExternalLink,
  CheckCircle, AlertCircle, Workflow, PieChart, Edit3, 
  Upload, MousePointer, ArrowLeft
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
  { id: 'analytics', label: 'Analytics Dashboard', icon: PieChart },
  { id: 'n8n-automation', label: 'n8n Automation', icon: Workflow },
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
          {activeSection === 'analytics' && <AnalyticsDocs />}
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
            Resend API key for email sending
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
          <ChecklistItem>Set up Resend API key (Settings → API Keys)</ChecklistItem>
          <ChecklistItem>Import your first batch of contacts via CSV</ChecklistItem>
          <ChecklistItem>Create at least one email template</ChecklistItem>
          <ChecklistItem>Create a test campaign with 1-2 contacts</ChecklistItem>
          <ChecklistItem>Verify emails are being received</ChecklistItem>
          <ChecklistItem>Set up n8n for automation (optional)</ChecklistItem>
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
          <pre className="text-foreground">First Name,Last Name,Business Name,Email,Phone,Instagram,TikTok</pre>
          <pre className="text-muted-foreground">John,Smith,Acme Corp,john@acme.com,+1234567890,@johnsmith,@johnsmith_tt</pre>
          <pre className="text-muted-foreground">Jane,Doe,Tech Inc,jane@tech.io,,,@janedoe_tt</pre>
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

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Example Email Template</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
          <p className="text-muted-foreground mb-2">Subject: Partnership Opportunity with {"{{businessName}}"}</p>
          <hr className="border-border my-2" />
          <p className="text-foreground">Hi {"{{firstName}}"},</p>
          <br />
          <p className="text-foreground">I hope this email finds you well. I came across {"{{businessName}}"} and was impressed by your work.</p>
          <br />
          <p className="text-foreground">I'd love to discuss a potential collaboration that could benefit both our businesses.</p>
          <br />
          <p className="text-foreground">Would you be available for a quick call this week?</p>
          <br />
          <p className="text-foreground">Best regards,<br />Your Name</p>
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
        <h2 className="text-2xl font-semibold text-foreground mb-4">Creating a Campaign</h2>
        <ol className="space-y-4 list-decimal list-inside">
          <li className="text-muted-foreground">
            <strong className="text-foreground">Navigate to Campaigns tab</strong> - Click "Campaigns" in the sidebar
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Enter campaign name</strong> - Give your campaign a descriptive name
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Select contacts</strong> - Choose which contacts to include using checkboxes
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Choose template</strong> - Select an email template for the campaign
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Set schedule (optional)</strong> - Schedule for later or launch immediately
          </li>
          <li className="text-muted-foreground">
            <strong className="text-foreground">Launch campaign</strong> - Click "Launch Campaign" to start sending
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
            <span className="text-muted-foreground">Currently sending emails</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full bg-success/10 text-success text-sm">completed</span>
            <span className="text-muted-foreground">All emails have been sent</span>
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

function AnalyticsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📤 Total Sent</h3>
            <p className="text-muted-foreground text-sm">Total number of emails successfully delivered across all campaigns.</p>
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
            <h3 className="font-semibold text-foreground mb-2">📊 Delivery Rate</h3>
            <p className="text-muted-foreground text-sm">Percentage of total contacts that received emails. Formula: (Sent / Total) × 100</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Charts & Visualizations</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Campaign Performance Bar Chart</strong>
              <p className="text-sm">Compare sent, opens, and clicks across your recent campaigns.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Engagement Pie Chart</strong>
              <p className="text-sm">Visual breakdown of opened vs clicked vs not opened emails.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-success mt-1" />
            <div>
              <strong className="text-foreground">Campaign Table</strong>
              <p className="text-sm">Detailed list of all campaigns with individual metrics.</p>
            </div>
          </li>
        </ul>
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
            <h3 className="font-medium text-foreground">Improving Metrics</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
              <li>Write compelling subject lines</li>
              <li>Personalize with variables like {"{{firstName}}"}</li>
              <li>Send at optimal times (Tue-Thu, 10am-2pm)</li>
              <li>Keep emails concise and action-oriented</li>
            </ul>
          </div>
        </div>
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
        <h2 className="text-2xl font-semibold text-foreground mb-4">Complete Setup Guide</h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">1</span>
            </div>
            <div>
              <strong className="text-foreground">Install n8n</strong>
              <p className="text-sm text-muted-foreground">Choose between self-hosting with Docker or n8n Cloud. For beginners, n8n Cloud is easier.</p>
              <code className="block mt-2 p-2 bg-secondary/50 rounded text-xs">docker run -it --rm -p 5678:5678 n8nio/n8n</code>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">2</span>
            </div>
            <div>
              <strong className="text-foreground">Export Workflow from App</strong>
              <p className="text-sm text-muted-foreground">Go to the n8n tab in the app and click "Download Workflow JSON".</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">3</span>
            </div>
            <div>
              <strong className="text-foreground">Import into n8n</strong>
              <p className="text-sm text-muted-foreground">In n8n, click "Add Workflow" → "Import from File" and select the downloaded JSON.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">4</span>
            </div>
            <div>
              <strong className="text-foreground">Configure Credentials</strong>
              <p className="text-sm text-muted-foreground">Set up the following credentials in n8n:</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>SMTP or SendGrid for email sending</li>
                <li>Twilio for SMS/voice (optional)</li>
                <li>Google Sheets for logging (optional)</li>
                <li>Supabase for database access</li>
              </ul>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">5</span>
            </div>
            <div>
              <strong className="text-foreground">Configure Schedule Trigger</strong>
              <p className="text-sm text-muted-foreground">Set up when the workflow should run (e.g., every hour, daily at 9am).</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-xs text-primary font-bold">6</span>
            </div>
            <div>
              <strong className="text-foreground">Test and Activate</strong>
              <p className="text-sm text-muted-foreground">Run the workflow manually first, then toggle it to "Active" for automatic execution.</p>
            </div>
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
          <li>• Add delays between emails to avoid spam flags (recommended: 30-60 seconds)</li>
          <li>• Instagram/TikTok DMs require their official APIs (limited access)</li>
          <li>• Always include unsubscribe options in marketing emails (CAN-SPAM compliance)</li>
          <li>• Test with small batches (5-10 contacts) before large campaigns</li>
          <li>• Monitor your sender reputation with tools like mail-tester.com</li>
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
        <h2 className="text-2xl font-semibold text-foreground mb-4">Resend (Email) - Required</h2>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li>Sign up at <a href="https://resend.com" target="_blank" className="text-primary hover:underline">resend.com</a></li>
          <li>Verify your domain at <a href="https://resend.com/domains" target="_blank" className="text-primary hover:underline">resend.com/domains</a>
            <p className="ml-6 text-sm mt-1">Add the DNS records shown to your domain provider</p>
          </li>
          <li>Create API key at <a href="https://resend.com/api-keys" target="_blank" className="text-primary hover:underline">resend.com/api-keys</a></li>
          <li>Add RESEND_API_KEY to Supabase Edge Function secrets:
            <p className="ml-6 text-sm mt-1">Dashboard → Settings → Edge Functions → Add Secret</p>
          </li>
        </ol>
        <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/30">
          <p className="text-sm text-success">Free tier includes 100 emails/day - perfect for testing!</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Twilio (Voice/SMS) - Optional</h2>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li>Sign up at <a href="https://twilio.com" target="_blank" className="text-primary hover:underline">twilio.com</a></li>
          <li>Get Account SID and Auth Token from Console</li>
          <li>Purchase a phone number ($1/month for US numbers)</li>
          <li>Configure credentials in n8n workflow</li>
        </ol>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Supabase Configuration</h2>
        <p className="text-muted-foreground mb-4">Your Supabase project is already connected. These secrets are auto-configured:</p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            SUPABASE_URL
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            SUPABASE_ANON_KEY
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            SUPABASE_SERVICE_ROLE_KEY
          </li>
        </ul>
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
              <li>• Verify RESEND_API_KEY is set in Supabase secrets</li>
              <li>• Check domain verification status at resend.com/domains</li>
              <li>• Review Edge Function logs in Supabase dashboard</li>
              <li>• Ensure the "from" email matches your verified domain</li>
            </ul>
          </div>
          
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">❌ CSV import fails</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Ensure CSV has proper headers (First Name, Last Name, Email, etc.)</li>
              <li>• Check for special characters or encoding issues (use UTF-8)</li>
              <li>• Verify email format is valid (name@domain.com)</li>
              <li>• Remove any blank rows from the CSV</li>
            </ul>
          </div>
          
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">❌ Open tracking not working</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Some email clients block tracking pixels (Apple Mail, Outlook)</li>
              <li>• Gmail may proxy images, affecting accuracy</li>
              <li>• This is expected behavior for privacy-focused clients</li>
              <li>• Focus on click tracking for more reliable data</li>
            </ul>
          </div>
          
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">❌ Can't see my contacts/campaigns</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Make sure you're logged in with the correct account</li>
              <li>• Data is user-specific due to Row Level Security</li>
              <li>• Try refreshing the page or logging out and back in</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">❌ n8n workflow not running</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Check if workflow is set to "Active"</li>
              <li>• Verify all credentials are configured correctly</li>
              <li>• Check n8n execution logs for error messages</li>
              <li>• Ensure trigger is set up correctly</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Getting Help</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <a href="https://supabase.com/dashboard" target="_blank" className="text-primary hover:underline">Supabase Dashboard</a>
            - Check logs and database
          </li>
          <li className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <a href="https://resend.com/emails" target="_blank" className="text-primary hover:underline">Resend Dashboard</a>
            - View sent emails and errors
          </li>
          <li className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <a href="https://docs.n8n.io" target="_blank" className="text-primary hover:underline">n8n Documentation</a>
            - Workflow automation help
          </li>
        </ul>
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

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="w-5 h-5 rounded border border-border group-hover:border-primary transition-colors flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-primary opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{children}</span>
    </label>
  );
}