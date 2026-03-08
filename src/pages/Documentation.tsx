import { useState } from 'react';
import { 
  Book, Zap, Database, Mail, Users, FileText, 
  Play, Settings, Code, ChevronRight, ExternalLink,
  CheckCircle, AlertCircle, Workflow, PieChart, Edit3, 
  Upload, MousePointer, ArrowLeft, Shield, Clock, MessageSquare,
  Key, Server, Layers, Search, Table2, FunctionSquare, Globe
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
  { id: 'companies', label: 'Companies & Contacts', icon: Layers },
  { id: 'lead-scoring', label: 'Lead Scoring & Intelligence', icon: Zap },
  { id: 'automation-rules', label: 'Workflow Automation', icon: Workflow },
  { id: 'contact-tracking', label: 'Contact Activity Tracking', icon: MousePointer },
  { id: 'website-tracking', label: 'Website Visitor Tracking', icon: Globe },
  { id: 'enrichment', label: 'Contact Enrichment', icon: Search },
  { id: 'audit-trail', label: 'Audit Trail', icon: Shield },
  { id: 'report-builder', label: 'Custom Report Builder', icon: PieChart },
  { id: 'revenue-forecast', label: 'Revenue Forecasting', icon: PieChart },
  { id: 'email-tools', label: 'Email & Automation Tools', icon: Mail },
  { id: 'connection-info', label: 'Connection & Setup', icon: Key },
  { id: 'db-schema', label: 'Database Schema (All Tables)', icon: Database },
  { id: 'db-indexes', label: 'Indexes & Views', icon: Search },
  { id: 'db-functions', label: 'Functions & Procedures', icon: FunctionSquare },
  { id: 'db-triggers', label: 'Triggers & Enums', icon: Zap },
  { id: 'edge-functions', label: 'Edge Functions', icon: Server },
  { id: 'rls-policies', label: 'RLS Policies', icon: Shield },
  { id: 'backup-scripts', label: 'Backup SQL Scripts', icon: Code },
  { id: 'n8n-automation', label: 'n8n Automation', icon: Workflow },
  { id: 'database-logging', label: 'Database Logging', icon: Database },
  { id: 'db-migration', label: 'PostgreSQL Migration', icon: Database },
  { id: 'api-setup', label: 'API Setup', icon: Code },
  { id: 'page-reference', label: 'Page-by-Page Reference', icon: Table2 },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: Settings },
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border bg-card/50 min-h-screen p-4 sticky top-0 overflow-y-auto max-h-screen">
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
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 max-w-5xl">
          {activeSection === 'getting-started' && <GettingStarted />}
          {activeSection === 'contacts' && <ContactsDocs />}
          {activeSection === 'inline-editing' && <InlineEditingDocs />}
          {activeSection === 'templates' && <TemplatesDocs />}
          {activeSection === 'campaigns' && <CampaignsDocs />}
          {activeSection === 'unified-inbox' && <UnifiedInboxDocs />}
          {activeSection === 'social-dm' && <SocialDMDocs />}
          {activeSection === 'analytics' && <AnalyticsDocs />}
          {activeSection === 'companies' && <CompaniesContactsDocs />}
          {activeSection === 'lead-scoring' && <LeadScoringDocs />}
          {activeSection === 'automation-rules' && <AutomationRulesDocs />}
          {activeSection === 'contact-tracking' && <ContactTrackingDocs />}
          {activeSection === 'website-tracking' && <WebsiteTrackingDocs />}
          {activeSection === 'enrichment' && <EnrichmentDocs />}
          {activeSection === 'audit-trail' && <AuditTrailDocs />}
          {activeSection === 'report-builder' && <ReportBuilderDocs />}
          {activeSection === 'revenue-forecast' && <RevenueForecastDocs />}
          {activeSection === 'email-tools' && <EmailToolsDocs />}
          {activeSection === 'connection-info' && <ConnectionInfoDocs />}
          {activeSection === 'db-schema' && <DatabaseSchemaDocs />}
          {activeSection === 'db-indexes' && <IndexesViewsDocs />}
          {activeSection === 'db-functions' && <DatabaseFunctionsDocs />}
          {activeSection === 'db-triggers' && <TriggersEnumsDocs />}
          {activeSection === 'edge-functions' && <EdgeFunctionsDocs />}
          {activeSection === 'rls-policies' && <RLSPoliciesDocs />}
          {activeSection === 'backup-scripts' && <BackupScriptsDocs />}
          {activeSection === 'n8n-automation' && <N8nDocs />}
          {activeSection === 'database-logging' && <DatabaseLoggingDocs />}
          {activeSection === 'db-migration' && <DatabaseMigrationDocs />}
          {activeSection === 'api-setup' && <ApiSetupDocs />}
          {activeSection === 'page-reference' && <PageReferenceDocs />}
          {activeSection === 'troubleshooting' && <TroubleshootingDocs />}
        </main>
      </div>
    </div>
  );
}

/* ========== HELPER COMPONENTS ========== */
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

function SqlBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="space-y-1">
      {title && <h3 className="font-semibold text-foreground text-sm">{title}</h3>}
      <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto max-h-[500px] overflow-y-auto">
        <pre>{children}</pre>
      </div>
    </div>
  );
}

function TableSchema({ name, description, columns, foreignKeys, indexes }: {
  name: string;
  description: string;
  columns: { name: string; type: string; nullable: boolean; default_val: string | null; note?: string }[];
  foreignKeys?: string[];
  indexes?: string[];
}) {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground font-mono">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-foreground font-semibold">Column</th>
              <th className="text-left py-2 px-2 text-foreground font-semibold">Type</th>
              <th className="text-left py-2 px-2 text-foreground font-semibold">Nullable</th>
              <th className="text-left py-2 px-2 text-foreground font-semibold">Default</th>
              <th className="text-left py-2 px-2 text-foreground font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr key={col.name} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-1.5 px-2 font-mono text-primary">{col.name}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{col.type}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{col.nullable ? 'Yes' : 'No'}</td>
                <td className="py-1.5 px-2 text-muted-foreground font-mono">{col.default_val ?? '—'}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{col.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {foreignKeys && foreignKeys.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-1">Foreign Keys</h4>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {foreignKeys.map((fk, i) => <li key={i} className="font-mono">→ {fk}</li>)}
          </ul>
        </div>
      )}
      {indexes && indexes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-1">Indexes</h4>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {indexes.map((idx, i) => <li key={i} className="font-mono">{idx}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ========== PAGE SECTIONS ========== */

function GettingStarted() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Getting Started</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to OutreachCopilot — your advanced automation platform for personalized outreach campaigns.
        </p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Start Guide</h2>
        <div className="space-y-4">
          <Step number={1} title="Sign Up / Login">Create an account or log in. Verify email if confirmation is enabled.</Step>
          <Step number={2} title="Import Contacts">Go to Contacts → Upload CSV. Required: First Name, Last Name, Email.</Step>
          <Step number={3} title="Create Templates">Build templates using variables like {"{{firstName}}"}, {"{{businessName}}"}.</Step>
          <Step number={4} title="Build Campaigns">Select contacts, choose templates, schedule. Monitor in real-time.</Step>
          <Step number={5} title="Manage Companies">Import company data with 80+ fields via CSV. Link person-level contacts.</Step>
          <Step number={6} title="View Analytics">Check open rates, click rates, and engagement metrics.</Step>
          <Step number={7} title="Automate with n8n">Export workflow to automate multi-channel outreach.</Step>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">System Requirements</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />Modern browser (Chrome, Firefox, Safari, Edge)</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />Brevo/SendGrid API key for email sending</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />n8n instance (self-hosted or cloud) for advanced automation</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />Supabase project for backend (already configured)</li>
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
          <ChecklistItem>Import companies with firmographic data</ChecklistItem>
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
        <p className="text-muted-foreground mb-4">Your CSV file should have the following columns (header row required):</p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-foreground">First Name,Last Name,Business Name,Email,Phone,Instagram,TikTok,Timezone</pre>
          <pre className="text-muted-foreground">John,Smith,Acme Corp,john@acme.com,+1234567890,@johnsmith,@johnsmith_tt,America/New_York</pre>
        </div>
        <div className="mt-4 p-4 bg-warning/10 rounded-lg border border-warning/30">
          <p className="text-sm text-warning flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Only Email is required for email campaigns. Other fields are optional.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Database Table: contacts</h2>
        <p className="text-muted-foreground mb-2">Columns: id, user_id, first_name, last_name, email, business_name, phone, instagram, tiktok, linkedin, job_title, location, city, state, country, timezone, status, tags[], bounced, bounce_type, bounced_at, unsubscribed, unsubscribed_at, email_sent, dm_sent, voicemail_sent, created_at, updated_at</p>
        <p className="text-muted-foreground text-sm">RLS: Full CRUD restricted to owner (auth.uid() = user_id)</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Statuses</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-warning" /><span className="font-medium text-foreground">Pending</span><span className="text-muted-foreground">— Not yet contacted</span></li>
          <li className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-success" /><span className="font-medium text-foreground">Sent</span><span className="text-muted-foreground">— Message delivered</span></li>
          <li className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-destructive" /><span className="font-medium text-foreground">Failed</span><span className="text-muted-foreground">— Delivery failed</span></li>
          <li className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-blue-500" /><span className="font-medium text-foreground">Bounced</span><span className="text-muted-foreground">— Invalid address</span></li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Frontend Hook: useContacts</h2>
        <SqlBlock>{`import { useContacts } from '@/hooks/useContacts';

const { contacts, isLoading, createContact, createManyContacts, updateContact, deleteContact } = useContacts();

// Create single contact
createContact.mutate({ first_name: 'John', last_name: 'Doe', email: 'john@example.com' });

// Bulk import from CSV
createManyContacts.mutate(parsedCSVRows);

// Update a contact
updateContact.mutate({ id: 'uuid', first_name: 'Jane' });

// Delete a contact
deleteContact.mutate('uuid');`}</SqlBlock>
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
        <p className="text-muted-foreground mb-4">Click on any field in the contacts table to edit it directly.</p>
        <div className="space-y-4">
          <Step number={1} title="Click on a Field">A pencil icon appears on hover.</Step>
          <Step number={2} title="Edit the Value">Type your changes in the input field.</Step>
          <Step number={3} title="Save Changes">Press Enter to save or Escape to cancel.</Step>
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Editable Fields</h2>
        <ul className="space-y-2 text-muted-foreground">
          {['First Name', 'Last Name', 'Email', 'Business Name', 'Phone', 'Job Title'].map(f => (
            <li key={f} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">{f}</strong></li>
          ))}
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
          {[
            { var: '{{firstName}}', desc: "Contact's first name" },
            { var: '{{lastName}}', desc: "Contact's last name" },
            { var: '{{businessName}}', desc: "Business/company name" },
            { var: '{{email}}', desc: "Contact's email address" },
            { var: '{{handle}}', desc: 'Social media handle' },
            { var: '{{platform}}', desc: 'Platform name' },
          ].map(v => (
            <div key={v.var} className="bg-secondary/50 rounded-lg p-3">
              <code className="text-primary">{v.var}</code>
              <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Template Types</h2>
        <div className="space-y-3">
          {[
            { icon: '📧', name: 'Email', desc: 'Full HTML emails with subject lines' },
            { icon: '📱', name: 'Instagram DM', desc: 'Short messages for Instagram DMs' },
            { icon: '🎵', name: 'TikTok DM', desc: 'Brief content for TikTok messages' },
            { icon: '🎙️', name: 'Voicemail Scripts', desc: 'Script templates for voice messages' },
          ].map(t => (
            <div key={t.name} className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-1">{t.icon} {t.name}</h3>
              <p className="text-muted-foreground text-sm">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Database: templates table</h2>
        <p className="text-muted-foreground text-sm font-mono">id (uuid PK), user_id (uuid), name (text NOT NULL), subject (text), content (text), type (text: email|instagram|tiktok|linkedin|voicemail), created_at, updated_at</p>
      </div>
    </div>
  );
}

function CampaignsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Campaigns (OutreachCopilot)</h1>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Campaign Wizard</h2>
        <p className="text-muted-foreground mb-4">Create campaigns using the step-by-step wizard:</p>
        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
          <li><strong className="text-foreground">Company Info</strong> — Enter company name, select AI or Manual mode</li>
          <li><strong className="text-foreground">Lead Selection</strong> — Import leads via CSV, existing contacts, or manual</li>
          <li><strong className="text-foreground">Review Leads</strong> — Preview and select contacts</li>
          <li><strong className="text-foreground">Build Sequence</strong> — Add email, DM, follow-up steps with drag-and-drop</li>
          <li><strong className="text-foreground">Launch</strong> — Review and launch campaign</li>
        </ol>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Campaign Statuses</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3"><Badge variant="secondary">draft</Badge><span className="text-muted-foreground">Created but not launched</span></li>
          <li className="flex items-center gap-3"><Badge className="bg-warning/10 text-warning">scheduled</Badge><span className="text-muted-foreground">Set for future launch</span></li>
          <li className="flex items-center gap-3"><Badge className="bg-primary/10 text-primary">running</Badge><span className="text-muted-foreground">Currently sending</span></li>
          <li className="flex items-center gap-3"><Badge className="bg-success/10 text-success">completed</Badge><span className="text-muted-foreground">All messages sent</span></li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">A/B Testing</h2>
        <p className="text-muted-foreground">Enable A/B testing to split contacts into Variant A and B with different subjects/content. Track opens and clicks per variant.</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Frontend Hook: useCampaigns</h2>
        <SqlBlock>{`import { useCampaigns } from '@/hooks/useCampaigns';

const { campaigns, isLoading, createCampaign, updateCampaign, launchCampaign, deleteCampaign, getCampaignContacts } = useCampaigns();

// Create campaign with contacts
createCampaign.mutate({
  campaign: { name: 'Q1 Outreach', status: 'draft' },
  contactIds: ['uuid1', 'uuid2']
});

// Launch campaign (invokes send-campaign-emails edge function)
launchCampaign.mutate('campaign-uuid');`}</SqlBlock>
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
        <p className="text-muted-foreground mb-4">Consolidates all inbound replies from email campaigns and social DM outreach into a single view.</p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">Auto-matching</strong> — Replies linked to campaigns & contacts</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">Read tracking</strong> — Messages marked read when opened</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">Star & Archive</strong> — Organize with stars and archiving</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><strong className="text-foreground">Reply inline</strong> — Compose replies directly</li>
        </ul>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sources</h2>
        <div className="space-y-3">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">📧 email_inbox</h3>
            <p className="text-muted-foreground text-sm">Inbound emails matched via inbound-email-webhook. FKs: campaign_id, campaign_contact_id, contact_id</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">💬 dm_campaign_contacts</h3>
            <p className="text-muted-foreground text-sm">DM replies tracked via replied_at. Joins with creators and dm_campaigns.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialDMDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Social DM Outreach</h1>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Supported Platforms</h2>
        <div className="grid grid-cols-3 gap-4">
          {['Instagram', 'TikTok', 'Twitter/X'].map(p => (
            <div key={p} className="p-4 border border-border rounded-lg text-center">
              <span className="text-foreground font-semibold">{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Anti-Block Protection</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Set sending hours (9 AM - 9 PM) to mimic human behavior</li>
          <li>• Random delays between 30s-10min to avoid detection</li>
          <li>• Recommended: 30-50 DMs per account per day</li>
          <li>• Warm up new accounts before high-volume sending</li>
        </ul>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Database Tables</h2>
        <p className="text-muted-foreground text-sm font-mono mb-2">dm_campaigns: id, user_id, name, platform, status, template_id, total_contacts, sent_count, reply_count, scheduled_at, started_at, completed_at</p>
        <p className="text-muted-foreground text-sm font-mono">dm_campaign_contacts: id, dm_campaign_id, creator_id, status, sent_at, replied_at, error_message</p>
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
          {[
            { icon: '📤', name: 'Total Sent', desc: 'Total messages delivered across campaigns' },
            { icon: '👁️', name: 'Open Rate', desc: '(Opens / Sent) × 100' },
            { icon: '🖱️', name: 'Click Rate', desc: '(Clicks / Opens) × 100' },
            { icon: '📊', name: 'Reply Rate', desc: 'Percentage of DMs that received a reply' },
          ].map(m => (
            <div key={m.name} className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-1">{m.icon} {m.name}</h3>
              <p className="text-muted-foreground text-sm">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Benchmarks</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Good open rate: 20-40% (cold outreach)</li>
          <li>• Good click rate: 2-5% of opens</li>
          <li>• Good DM reply rate: 5-15%</li>
        </ul>
      </div>
    </div>
  );
}

function CompaniesContactsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Companies & Company Contacts</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Model (Split Architecture)</h2>
        <p className="text-muted-foreground mb-4">
          Data is split into two tables: <code className="text-primary">companies</code> for organizational metadata (80+ columns) and <code className="text-primary">company_contacts</code> for person-level details. Contacts link to companies via <code className="text-primary">company_id</code> foreign key.
        </p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">companies — All Columns (60+)</h2>
        <div className="overflow-x-auto">
          <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs max-h-[400px] overflow-y-auto">
            <pre className="text-foreground">{`id                      uuid PK (gen_random_uuid)
user_id                 uuid NOT NULL
name                    text NOT NULL
website                 text
linkedin_url            text
industry                text
size                    text
headquarters            text
description             text
short_description       text
founded                 text
specialties             text[]
logo_url                text
phone                   text
email                   text
employee_count          integer
annual_revenue          text
company_name_for_emails text
company_phone           text
phone_from_website      text
instagram_url           text
company_linkedin_url    text
facebook_url            text
twitter_url             text
pinterest_url           text
company_city            text
company_state           text
company_country         text
company_address         text
technologies            text
keywords                text
total_funding           text
latest_funding          text
latest_funding_amount   text
subsidiary_of           text
number_of_retail_locations text
extracted_from          text
website_status          text
d2c_presence            text
e_commerce_presence     text
social_media_presence   text
integrated_videos       text
integrated_video_urls   text
ig_username             text
ig_bio                  text
ig_followers_count      text
total_post_in_3_months  text
average_er              text
total_collaborations    text
ugc_example             text
worked_with_creators    text
hashtags                text
mentions                text
segmentation            text
firmographic_score      text
engagement_score        text
ad_library_proof        text
metadata                jsonb DEFAULT '{}'
extra_data              jsonb DEFAULT '{}'
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()`}</pre>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">company_contacts — All Columns (30+)</h2>
        <div className="overflow-x-auto">
          <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs max-h-[400px] overflow-y-auto">
            <pre className="text-foreground">{`id                  uuid PK (gen_random_uuid)
user_id             uuid NOT NULL
company_id          uuid FK → companies(id)
first_name          text
last_name           text
seniority           text
departments         text
title               text
email               text
secondary_email     text
email_from_website  text
work_direct_phone   text
home_phone          text
mobile_phone        text
corporate_phone     text
other_phone         text
person_linkedin_url text
city                text
state               text
country             text
job_tracking_link   text
hiring_job_title    text
salary_estimated    text
job_location        text
linkedin_job_link   text
linkedin_job_title  text
job_basedon         text
mql                 text
sql_status          text
ig_score            text
notes_for_sdr       text
notes_for_data      text
date_of_filtration  text
extra_data          jsonb DEFAULT '{}'
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()`}</pre>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Frontend Hooks</h2>
        <SqlBlock title="useCompanies">{`import { useCompanies } from '@/hooks/useCompanies';
const { companies, isLoading, createCompany, updateCompany, deleteCompany } = useCompanies();

createCompany.mutate({ name: 'Acme Corp', industry: 'Tech', website: 'https://acme.com' });`}</SqlBlock>
        <div className="mt-4" />
        <SqlBlock title="useCompanyContacts">{`import { useCompanyContacts } from '@/hooks/useCompanyContacts';
const { contacts, isLoading, createContact, updateContact, deleteContact } = useCompanyContacts(companyId);

createContact.mutate({
  company_id: 'uuid', first_name: 'John', last_name: 'Doe',
  email: 'john@acme.com', seniority: 'VP', mql: 'High'
});`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">CSV Import/Export</h2>
        <p className="text-muted-foreground">Both tables support CSV bulk import with intelligent header mapping. Headers are automatically matched to column names. Extra unmapped columns are stored in the <code className="text-primary">extra_data</code> JSONB field.</p>
      </div>
    </div>
  );
}

function ConnectionInfoDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Connection & Setup Information</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Supabase Project</h2>
        <div className="space-y-3 font-mono text-sm">
          <div className="p-3 bg-secondary/50 rounded-lg flex justify-between">
            <span className="text-muted-foreground">Project ID</span>
            <span className="text-foreground">syqawvakxxfaohcgrenn</span>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg flex justify-between">
            <span className="text-muted-foreground">Region</span>
            <span className="text-foreground">See Supabase Dashboard</span>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg flex justify-between">
            <span className="text-muted-foreground">API URL</span>
            <span className="text-foreground">https://syqawvakxxfaohcgrenn.supabase.co</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Environment Variables</h2>
        <div className="space-y-2">
          {[
            { name: 'VITE_SUPABASE_URL', desc: 'Auto-populated from connected project' },
            { name: 'VITE_SUPABASE_PUBLISHABLE_KEY', desc: 'Anon key (safe for frontend)' },
            { name: 'VITE_SUPABASE_PROJECT_ID', desc: 'Project identifier' },
          ].map(e => (
            <div key={e.name} className="p-3 bg-secondary/50 rounded-lg">
              <code className="text-primary text-sm">{e.name}</code>
              <p className="text-xs text-muted-foreground mt-1">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Supabase Secrets (Edge Functions)</h2>
        <div className="space-y-2">
          {[
            'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
            'SUPABASE_DB_URL', 'RESEND_API_KEY', 'LOVABLE_API_KEY'
          ].map(s => (
            <div key={s} className="p-2 bg-secondary/50 rounded-lg font-mono text-sm text-foreground">{s}</div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Frontend Client Setup</h2>
        <SqlBlock>{`// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Storage Buckets</h2>
        <div className="space-y-2">
          {[
            { name: 'avatars', pub: true, desc: 'User profile pictures' },
            { name: 'portfolio', pub: true, desc: 'Creator portfolio files' },
            { name: 'documents', pub: false, desc: 'Private contract/doc files' },
          ].map(b => (
            <div key={b.name} className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between">
              <div>
                <code className="text-primary text-sm">{b.name}</code>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
              <Badge variant={b.pub ? 'default' : 'secondary'}>{b.pub ? 'Public' : 'Private'}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseSchemaDocs() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Database Schema — All Tables</h1>
      <p className="text-muted-foreground">Complete reference of all 40+ PostgreSQL tables in the public schema. Every column, type, nullable flag, and default value.</p>

      <TableSchema name="profiles" description="User profiles synced from auth.users via trigger"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'auth.users.id', note: 'PK, matches auth user' },
          { name: 'email', type: 'text', nullable: true, default_val: null },
          { name: 'full_name', type: 'text', nullable: true, default_val: null },
          { name: 'avatar_url', type: 'text', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="contacts" description="Outreach contacts for campaigns (email, DM, voicemail)"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null, note: 'Owner' },
          { name: 'first_name', type: 'text', nullable: true, default_val: null },
          { name: 'last_name', type: 'text', nullable: true, default_val: null },
          { name: 'email', type: 'text', nullable: true, default_val: null },
          { name: 'business_name', type: 'text', nullable: true, default_val: null },
          { name: 'phone', type: 'text', nullable: true, default_val: null },
          { name: 'instagram', type: 'text', nullable: true, default_val: null },
          { name: 'tiktok', type: 'text', nullable: true, default_val: null },
          { name: 'linkedin', type: 'text', nullable: true, default_val: null },
          { name: 'job_title', type: 'text', nullable: true, default_val: null },
          { name: 'location', type: 'text', nullable: true, default_val: null },
          { name: 'city', type: 'text', nullable: true, default_val: null },
          { name: 'state', type: 'text', nullable: true, default_val: null },
          { name: 'country', type: 'text', nullable: true, default_val: null },
          { name: 'timezone', type: 'text', nullable: true, default_val: "'UTC'" },
          { name: 'status', type: 'text', nullable: true, default_val: "'pending'" },
          { name: 'tags', type: 'text[]', nullable: true, default_val: "'{}'::text[]" },
          { name: 'bounced', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'bounce_type', type: 'text', nullable: true, default_val: null },
          { name: 'bounced_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'unsubscribed', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'unsubscribed_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'email_sent', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'dm_sent', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'voicemail_sent', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="companies" description="Organization-level data — 60+ columns for firmographics, social, scoring"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null, note: 'Owner' },
          { name: 'name', type: 'text', nullable: false, default_val: null },
          { name: 'website', type: 'text', nullable: true, default_val: null },
          { name: 'linkedin_url', type: 'text', nullable: true, default_val: null },
          { name: 'industry', type: 'text', nullable: true, default_val: null },
          { name: 'size', type: 'text', nullable: true, default_val: null },
          { name: 'headquarters', type: 'text', nullable: true, default_val: null },
          { name: 'description', type: 'text', nullable: true, default_val: null },
          { name: 'short_description', type: 'text', nullable: true, default_val: null },
          { name: 'founded', type: 'text', nullable: true, default_val: null },
          { name: 'specialties', type: 'text[]', nullable: true, default_val: null },
          { name: 'logo_url', type: 'text', nullable: true, default_val: null },
          { name: 'phone', type: 'text', nullable: true, default_val: null },
          { name: 'email', type: 'text', nullable: true, default_val: null },
          { name: 'employee_count', type: 'integer', nullable: true, default_val: null },
          { name: 'annual_revenue', type: 'text', nullable: true, default_val: null },
          { name: 'company_name_for_emails', type: 'text', nullable: true, default_val: null },
          { name: 'company_phone', type: 'text', nullable: true, default_val: null },
          { name: 'phone_from_website', type: 'text', nullable: true, default_val: null },
          { name: 'instagram_url', type: 'text', nullable: true, default_val: null },
          { name: 'company_linkedin_url', type: 'text', nullable: true, default_val: null },
          { name: 'facebook_url', type: 'text', nullable: true, default_val: null },
          { name: 'twitter_url', type: 'text', nullable: true, default_val: null },
          { name: 'pinterest_url', type: 'text', nullable: true, default_val: null },
          { name: 'company_city', type: 'text', nullable: true, default_val: null },
          { name: 'company_state', type: 'text', nullable: true, default_val: null },
          { name: 'company_country', type: 'text', nullable: true, default_val: null },
          { name: 'company_address', type: 'text', nullable: true, default_val: null },
          { name: 'technologies', type: 'text', nullable: true, default_val: null },
          { name: 'keywords', type: 'text', nullable: true, default_val: null },
          { name: 'total_funding', type: 'text', nullable: true, default_val: null },
          { name: 'latest_funding', type: 'text', nullable: true, default_val: null },
          { name: 'latest_funding_amount', type: 'text', nullable: true, default_val: null },
          { name: 'subsidiary_of', type: 'text', nullable: true, default_val: null },
          { name: 'number_of_retail_locations', type: 'text', nullable: true, default_val: null },
          { name: 'extracted_from', type: 'text', nullable: true, default_val: null },
          { name: 'website_status', type: 'text', nullable: true, default_val: null },
          { name: 'd2c_presence', type: 'text', nullable: true, default_val: null },
          { name: 'e_commerce_presence', type: 'text', nullable: true, default_val: null },
          { name: 'social_media_presence', type: 'text', nullable: true, default_val: null },
          { name: 'integrated_videos', type: 'text', nullable: true, default_val: null },
          { name: 'integrated_video_urls', type: 'text', nullable: true, default_val: null },
          { name: 'ig_username', type: 'text', nullable: true, default_val: null },
          { name: 'ig_bio', type: 'text', nullable: true, default_val: null },
          { name: 'ig_followers_count', type: 'text', nullable: true, default_val: null },
          { name: 'total_post_in_3_months', type: 'text', nullable: true, default_val: null },
          { name: 'average_er', type: 'text', nullable: true, default_val: null },
          { name: 'total_collaborations', type: 'text', nullable: true, default_val: null },
          { name: 'ugc_example', type: 'text', nullable: true, default_val: null },
          { name: 'worked_with_creators', type: 'text', nullable: true, default_val: null },
          { name: 'hashtags', type: 'text', nullable: true, default_val: null },
          { name: 'mentions', type: 'text', nullable: true, default_val: null },
          { name: 'segmentation', type: 'text', nullable: true, default_val: null },
          { name: 'firmographic_score', type: 'text', nullable: true, default_val: null },
          { name: 'engagement_score', type: 'text', nullable: true, default_val: null },
          { name: 'ad_library_proof', type: 'text', nullable: true, default_val: null },
          { name: 'metadata', type: 'jsonb', nullable: true, default_val: "'{}'::jsonb" },
          { name: 'extra_data', type: 'jsonb', nullable: true, default_val: "'{}'::jsonb" },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="company_contacts" description="Person-level contacts linked to companies"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null, note: 'Owner' },
          { name: 'company_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → companies' },
          { name: 'first_name', type: 'text', nullable: true, default_val: null },
          { name: 'last_name', type: 'text', nullable: true, default_val: null },
          { name: 'seniority', type: 'text', nullable: true, default_val: null },
          { name: 'departments', type: 'text', nullable: true, default_val: null },
          { name: 'title', type: 'text', nullable: true, default_val: null },
          { name: 'email', type: 'text', nullable: true, default_val: null },
          { name: 'secondary_email', type: 'text', nullable: true, default_val: null },
          { name: 'email_from_website', type: 'text', nullable: true, default_val: null },
          { name: 'work_direct_phone', type: 'text', nullable: true, default_val: null },
          { name: 'home_phone', type: 'text', nullable: true, default_val: null },
          { name: 'mobile_phone', type: 'text', nullable: true, default_val: null },
          { name: 'corporate_phone', type: 'text', nullable: true, default_val: null },
          { name: 'other_phone', type: 'text', nullable: true, default_val: null },
          { name: 'person_linkedin_url', type: 'text', nullable: true, default_val: null },
          { name: 'city', type: 'text', nullable: true, default_val: null },
          { name: 'state', type: 'text', nullable: true, default_val: null },
          { name: 'country', type: 'text', nullable: true, default_val: null },
          { name: 'job_tracking_link', type: 'text', nullable: true, default_val: null },
          { name: 'hiring_job_title', type: 'text', nullable: true, default_val: null },
          { name: 'salary_estimated', type: 'text', nullable: true, default_val: null },
          { name: 'job_location', type: 'text', nullable: true, default_val: null },
          { name: 'linkedin_job_link', type: 'text', nullable: true, default_val: null },
          { name: 'linkedin_job_title', type: 'text', nullable: true, default_val: null },
          { name: 'job_basedon', type: 'text', nullable: true, default_val: null },
          { name: 'mql', type: 'text', nullable: true, default_val: null },
          { name: 'sql_status', type: 'text', nullable: true, default_val: null },
          { name: 'ig_score', type: 'text', nullable: true, default_val: null },
          { name: 'notes_for_sdr', type: 'text', nullable: true, default_val: null },
          { name: 'notes_for_data', type: 'text', nullable: true, default_val: null },
          { name: 'date_of_filtration', type: 'text', nullable: true, default_val: null },
          { name: 'extra_data', type: 'jsonb', nullable: true, default_val: "'{}'::jsonb" },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
        foreignKeys={['company_contacts.company_id → public.companies.id']}
      />

      <TableSchema name="campaigns" description="Email outreach campaigns with A/B testing support"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'name', type: 'text', nullable: false, default_val: null },
          { name: 'status', type: 'text', nullable: true, default_val: "'draft'" },
          { name: 'template_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → templates' },
          { name: 'scheduled_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'started_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'completed_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'total_contacts', type: 'integer', nullable: true, default_val: '0' },
          { name: 'sent_count', type: 'integer', nullable: true, default_val: '0' },
          { name: 'open_count', type: 'integer', nullable: true, default_val: '0' },
          { name: 'click_count', type: 'integer', nullable: true, default_val: '0' },
          { name: 'ab_testing_enabled', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'variant_a_subject', type: 'text', nullable: true, default_val: null },
          { name: 'variant_a_content', type: 'text', nullable: true, default_val: null },
          { name: 'variant_a_sent', type: 'integer', nullable: true, default_val: '0' },
          { name: 'variant_a_opens', type: 'integer', nullable: true, default_val: '0' },
          { name: 'variant_a_clicks', type: 'integer', nullable: true, default_val: '0' },
          { name: 'variant_b_subject', type: 'text', nullable: true, default_val: null },
          { name: 'variant_b_content', type: 'text', nullable: true, default_val: null },
          { name: 'variant_b_sent', type: 'integer', nullable: true, default_val: '0' },
          { name: 'variant_b_opens', type: 'integer', nullable: true, default_val: '0' },
          { name: 'variant_b_clicks', type: 'integer', nullable: true, default_val: '0' },
          { name: 'use_recipient_timezone', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'optimal_send_hour', type: 'integer', nullable: true, default_val: '9' },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
        foreignKeys={['campaigns.template_id → public.templates.id']}
      />

      <TableSchema name="campaign_contacts" description="Junction table linking campaigns to contacts with delivery tracking"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'campaign_id', type: 'uuid', nullable: false, default_val: null, note: 'FK → campaigns' },
          { name: 'contact_id', type: 'uuid', nullable: false, default_val: null, note: 'FK → contacts' },
          { name: 'status', type: 'text', nullable: true, default_val: "'pending'" },
          { name: 'sent_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'opened_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'clicked_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'bounced_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'bounce_type', type: 'text', nullable: true, default_val: null },
          { name: 'error_message', type: 'text', nullable: true, default_val: null },
          { name: 'variant', type: 'text', nullable: true, default_val: null },
        ]}
        foreignKeys={['campaign_contacts.campaign_id → campaigns.id', 'campaign_contacts.contact_id → contacts.id']}
      />

      <TableSchema name="campaign_send_logs" description="Detailed send event logs per campaign email"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'campaign_id', type: 'uuid', nullable: false, default_val: null, note: 'FK → campaigns' },
          { name: 'campaign_contact_id', type: 'uuid', nullable: false, default_val: null, note: 'FK → campaign_contacts' },
          { name: 'event_type', type: 'text', nullable: false, default_val: null },
          { name: 'status', type: 'text', nullable: false, default_val: null },
          { name: 'error_message', type: 'text', nullable: true, default_val: null },
          { name: 'error_code', type: 'text', nullable: true, default_val: null },
          { name: 'provider', type: 'text', nullable: true, default_val: null },
          { name: 'message_id', type: 'text', nullable: true, default_val: null },
          { name: 'metadata', type: 'jsonb', nullable: true, default_val: "'{}'::jsonb" },
          { name: 'ip_address', type: 'text', nullable: true, default_val: null },
          { name: 'user_agent', type: 'text', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="campaign_templates" description="Reusable multi-step campaign sequence templates"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'name', type: 'text', nullable: false, default_val: null },
          { name: 'description', type: 'text', nullable: true, default_val: null },
          { name: 'category', type: 'text', nullable: true, default_val: "'Sales'" },
          { name: 'steps', type: 'integer', nullable: true, default_val: '1' },
          { name: 'featured', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'sequence_data', type: 'jsonb', nullable: true, default_val: "'[]'::jsonb" },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="email_events" description="Open/click tracking events for campaign emails"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'campaign_contact_id', type: 'uuid', nullable: false, default_val: null, note: 'FK → campaign_contacts' },
          { name: 'event_type', type: 'text', nullable: false, default_val: null },
          { name: 'metadata', type: 'jsonb', nullable: true, default_val: "'{}'::jsonb" },
          { name: 'ip_address', type: 'text', nullable: true, default_val: null },
          { name: 'user_agent', type: 'text', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="email_inbox" description="Inbound email replies matched to campaigns/contacts"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'from_email', type: 'text', nullable: false, default_val: null },
          { name: 'from_name', type: 'text', nullable: true, default_val: null },
          { name: 'to_email', type: 'text', nullable: false, default_val: null },
          { name: 'subject', type: 'text', nullable: true, default_val: null },
          { name: 'body_text', type: 'text', nullable: true, default_val: null },
          { name: 'body_html', type: 'text', nullable: true, default_val: null },
          { name: 'is_read', type: 'boolean', nullable: false, default_val: 'false' },
          { name: 'is_starred', type: 'boolean', nullable: false, default_val: 'false' },
          { name: 'folder', type: 'text', nullable: false, default_val: "'inbox'" },
          { name: 'message_id', type: 'text', nullable: true, default_val: null },
          { name: 'in_reply_to', type: 'text', nullable: true, default_val: null },
          { name: 'campaign_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → campaigns' },
          { name: 'campaign_contact_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → campaign_contacts' },
          { name: 'contact_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → contacts' },
          { name: 'received_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="email_settings" description="User SMTP/API credentials for email sending"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'smtp_host', type: 'text', nullable: true, default_val: null },
          { name: 'smtp_port', type: 'text', nullable: true, default_val: null },
          { name: 'smtp_user', type: 'text', nullable: true, default_val: null },
          { name: 'smtp_password', type: 'text', nullable: true, default_val: null },
          { name: 'brevo_api_key', type: 'text', nullable: true, default_val: null },
          { name: 'sendgrid_key', type: 'text', nullable: true, default_val: null },
          { name: 'twilio_sid', type: 'text', nullable: true, default_val: null },
          { name: 'twilio_token', type: 'text', nullable: true, default_val: null },
          { name: 'twilio_number', type: 'text', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="email_deliverability_tests" description="SPF/DKIM/DMARC deliverability test results"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'email', type: 'text', nullable: false, default_val: null },
          { name: 'test_type', type: 'text', nullable: false, default_val: "'inbox_placement'" },
          { name: 'status', type: 'text', nullable: false, default_val: "'pending'" },
          { name: 'spam_score', type: 'numeric', nullable: true, default_val: null },
          { name: 'inbox_placement', type: 'text', nullable: true, default_val: null },
          { name: 'result', type: 'jsonb', nullable: true, default_val: "'{}'::jsonb" },
          { name: 'authentication_results', type: 'jsonb', nullable: true, default_val: "'{}'::jsonb" },
          { name: 'warnings', type: 'text[]', nullable: true, default_val: null },
          { name: 'completed_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="dm_campaigns" description="Social DM outreach campaigns"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'name', type: 'text', nullable: false, default_val: null },
          { name: 'platform', type: 'text', nullable: false, default_val: null },
          { name: 'status', type: 'text', nullable: true, default_val: "'draft'" },
          { name: 'template_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → templates' },
          { name: 'total_contacts', type: 'integer', nullable: true, default_val: '0' },
          { name: 'sent_count', type: 'integer', nullable: true, default_val: '0' },
          { name: 'reply_count', type: 'integer', nullable: true, default_val: '0' },
          { name: 'scheduled_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'started_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'completed_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="dm_campaign_contacts" description="DM recipients per campaign"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'dm_campaign_id', type: 'uuid', nullable: false, default_val: null, note: 'FK → dm_campaigns' },
          { name: 'creator_id', type: 'uuid', nullable: false, default_val: null, note: 'FK → creators' },
          { name: 'status', type: 'text', nullable: true, default_val: "'pending'" },
          { name: 'sent_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'replied_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'error_message', type: 'text', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="creators" description="Social media creator profiles"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: true, default_val: null },
          { name: 'name', type: 'text', nullable: false, default_val: null },
          { name: 'handle', type: 'text', nullable: false, default_val: null },
          { name: 'platform', type: 'text', nullable: true, default_val: "'instagram'" },
          { name: 'bio', type: 'text', nullable: true, default_val: null },
          { name: 'avatar', type: 'text', nullable: true, default_val: null },
          { name: 'followers', type: 'text', nullable: true, default_val: null },
          { name: 'engagement', type: 'text', nullable: true, default_val: null },
          { name: 'avg_likes', type: 'text', nullable: true, default_val: null },
          { name: 'category', type: 'text[]', nullable: true, default_val: null },
          { name: 'location', type: 'text', nullable: true, default_val: null },
          { name: 'recent_post', type: 'text', nullable: true, default_val: null },
          { name: 'verified', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="activity_logs" description="Full audit trail of all user actions"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'entity_type', type: 'text', nullable: false, default_val: null },
          { name: 'entity_id', type: 'uuid', nullable: true, default_val: null },
          { name: 'action_type', type: 'text', nullable: false, default_val: null },
          { name: 'metadata', type: 'jsonb', nullable: true, default_val: "'{}'::jsonb" },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="ads_campaigns" description="Advertising campaigns (Facebook, Google, etc.)"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'name', type: 'text', nullable: false, default_val: null },
          { name: 'status', type: 'text', nullable: false, default_val: "'draft'" },
          { name: 'platforms', type: 'text[]', nullable: true, default_val: "ARRAY['facebook']" },
          { name: 'budget', type: 'numeric', nullable: true, default_val: null },
          { name: 'spent', type: 'numeric', nullable: true, default_val: '0' },
          { name: 'objective', type: 'text', nullable: true, default_val: null },
          { name: 'reach', type: 'integer', nullable: true, default_val: '0' },
          { name: 'impressions', type: 'integer', nullable: true, default_val: '0' },
          { name: 'clicks', type: 'integer', nullable: true, default_val: '0' },
          { name: 'ctr', type: 'numeric', nullable: true, default_val: '0' },
          { name: 'cpc', type: 'numeric', nullable: true, default_val: '0' },
          { name: 'results', type: 'integer', nullable: true, default_val: '0' },
          { name: 'result_type', type: 'text', nullable: true, default_val: null },
          { name: 'start_date', type: 'date', nullable: true, default_val: null },
          { name: 'end_date', type: 'date', nullable: true, default_val: null },
          { name: 'target_audience', type: 'jsonb', nullable: true, default_val: null },
          { name: 'ad_creative', type: 'jsonb', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="collaboration_contracts" description="Brand-creator collaboration contracts"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'brand_user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'creator_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → creators' },
          { name: 'invitation_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → campaign_invitations' },
          { name: 'title', type: 'text', nullable: false, default_val: null },
          { name: 'terms', type: 'text', nullable: false, default_val: null },
          { name: 'payment_amount', type: 'numeric', nullable: true, default_val: null },
          { name: 'payment_currency', type: 'text', nullable: true, default_val: "'USD'" },
          { name: 'status', type: 'text', nullable: true, default_val: "'draft'" },
          { name: 'deliverables', type: 'jsonb', nullable: true, default_val: "'[]'::jsonb" },
          { name: 'start_date', type: 'date', nullable: true, default_val: null },
          { name: 'end_date', type: 'date', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="country_timezones" description="Reference table of countries with timezones and UTC offsets"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'country_code', type: 'text', nullable: false, default_val: null },
          { name: 'country_name', type: 'text', nullable: false, default_val: null },
          { name: 'timezone', type: 'text', nullable: false, default_val: null },
          { name: 'utc_offset', type: 'integer', nullable: false, default_val: null },
        ]}
      />

      <TableSchema name="credit_transactions" description="User credit usage tracking"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'amount', type: 'integer', nullable: false, default_val: null },
          { name: 'type', type: 'text', nullable: false, default_val: null },
          { name: 'tool_used', type: 'text', nullable: true, default_val: null },
          { name: 'description', type: 'text', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="business_details" description="User business/billing information"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'company_name', type: 'text', nullable: true, default_val: null },
          { name: 'billing_address', type: 'text', nullable: true, default_val: null },
          { name: 'city', type: 'text', nullable: true, default_val: null },
          { name: 'state', type: 'text', nullable: true, default_val: null },
          { name: 'postal_code', type: 'text', nullable: true, default_val: null },
          { name: 'country', type: 'text', nullable: true, default_val: null },
          { name: 'phone', type: 'text', nullable: true, default_val: null },
          { name: 'tax_id', type: 'text', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="contact_activities" description="Tracks all contact interactions: page visits, emails, calls, form submissions"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'contact_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → company_contacts' },
          { name: 'activity_type', type: 'text', nullable: false, default_val: null, note: 'page_view, email_open, email_click, form_submit, call, meeting' },
          { name: 'title', type: 'text', nullable: true, default_val: null },
          { name: 'description', type: 'text', nullable: true, default_val: null },
          { name: 'metadata', type: 'jsonb', nullable: true, default_val: '{}' },
          { name: 'source', type: 'text', nullable: true, default_val: 'manual', note: 'manual, tracking_script, webhook, system' },
          { name: 'ip_address', type: 'text', nullable: true, default_val: null },
          { name: 'user_agent', type: 'text', nullable: true, default_val: null },
          { name: 'page_url', type: 'text', nullable: true, default_val: null },
          { name: 'duration_seconds', type: 'integer', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
        foreignKeys={['contact_id → company_contacts.id']}
      />

      <TableSchema name="automation_rules" description="IF/THEN workflow automation rules"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'name', type: 'text', nullable: false, default_val: null },
          { name: 'description', type: 'text', nullable: true, default_val: null },
          { name: 'trigger_type', type: 'text', nullable: false, default_val: null, note: 'lead_score_threshold, no_reply, stage_change, new_contact, email_opened' },
          { name: 'trigger_config', type: 'jsonb', nullable: false, default_val: '{}', note: 'Trigger parameters (e.g., threshold value, days)' },
          { name: 'action_type', type: 'text', nullable: false, default_val: null, note: 'move_stage, send_email, add_tag, notify, create_task' },
          { name: 'action_config', type: 'jsonb', nullable: false, default_val: '{}', note: 'Action parameters (e.g., target stage, template)' },
          { name: 'is_active', type: 'boolean', nullable: true, default_val: 'true' },
          { name: 'execution_count', type: 'integer', nullable: true, default_val: '0' },
          { name: 'last_executed_at', type: 'timestamptz', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="automation_logs" description="Execution log for automation rules"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'rule_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → automation_rules' },
          { name: 'contact_id', type: 'uuid', nullable: true, default_val: null, note: 'FK → company_contacts' },
          { name: 'status', type: 'text', nullable: true, default_val: 'success', note: 'success, error' },
          { name: 'trigger_data', type: 'jsonb', nullable: true, default_val: null },
          { name: 'action_result', type: 'jsonb', nullable: true, default_val: null },
          { name: 'error_message', type: 'text', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
        foreignKeys={['rule_id → automation_rules.id', 'contact_id → company_contacts.id']}
      />

      <TableSchema name="audit_trail" description="Change tracking for all major table operations"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'table_name', type: 'text', nullable: false, default_val: null },
          { name: 'record_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'action', type: 'text', nullable: false, default_val: null, note: 'INSERT, UPDATE, DELETE' },
          { name: 'old_data', type: 'jsonb', nullable: true, default_val: null },
          { name: 'new_data', type: 'jsonb', nullable: true, default_val: null },
          { name: 'changed_fields', type: 'text[]', nullable: true, default_val: null },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <TableSchema name="custom_reports" description="User-created custom report configurations"
        columns={[
          { name: 'id', type: 'uuid', nullable: false, default_val: 'gen_random_uuid()', note: 'PK' },
          { name: 'user_id', type: 'uuid', nullable: false, default_val: null },
          { name: 'name', type: 'text', nullable: false, default_val: null },
          { name: 'description', type: 'text', nullable: true, default_val: null },
          { name: 'report_type', type: 'text', nullable: false, default_val: 'bar', note: 'bar, line, pie, area, radar' },
          { name: 'data_source', type: 'text', nullable: false, default_val: 'company_contacts' },
          { name: 'metrics', type: 'jsonb', nullable: false, default_val: '{}' },
          { name: 'dimensions', type: 'jsonb', nullable: true, default_val: null },
          { name: 'filters', type: 'jsonb', nullable: true, default_val: null },
          { name: 'chart_config', type: 'jsonb', nullable: true, default_val: null },
          { name: 'is_pinned', type: 'boolean', nullable: true, default_val: 'false' },
          { name: 'created_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default_val: 'now()' },
        ]}
      />

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Additional Tables</h2>
        <p className="text-muted-foreground text-sm mb-4">The following tables also exist in the schema (see Backup SQL Scripts for full CREATE statements):</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            'campaign_invitations', 'content_posts', 'content_comments', 'content_reports',
            'contract_activity', 'contract_templates', 'conversations', 'creator_earnings',
            'creator_social_accounts', 'user_roles', 'user_credits', 'user_favorites',
            'tool_usage_analytics', 'saved_creators', 'saved_filters', 'page_views',
            'linkedin_leads', 'file_storage_tracking', 'email_warmup_schedules',
            'follow_up_sequences', 'follow_up_queue', 'messages'
          ].map(t => (
            <div key={t} className="p-2 bg-secondary/50 rounded font-mono text-primary">{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndexesViewsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Indexes & Views</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Primary Key Indexes (Auto-created)</h2>
        <p className="text-muted-foreground mb-4">Every table has an auto-created unique B-tree index on its <code className="text-primary">id</code> column (uuid PK). These are created by PostgreSQL automatically.</p>
        <SqlBlock>{`-- All PKs use gen_random_uuid() and have auto B-tree indexes:
-- contacts_pkey ON contacts (id)
-- campaigns_pkey ON campaigns (id)
-- companies_pkey ON companies (id)
-- company_contacts_pkey ON company_contacts (id)
-- campaign_contacts_pkey ON campaign_contacts (id)
-- templates_pkey ON templates (id)
-- email_inbox_pkey ON email_inbox (id)
-- activity_logs_pkey ON activity_logs (id)
-- ... (all 40+ tables)`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Unique Constraints</h2>
        <SqlBlock>{`-- user_roles: unique(user_id, role)
-- creator_social_accounts: unique(user_id, platform)
-- user_credits: unique(user_id)
-- user_favorites: unique(user_id, tool_id)`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Recommended Additional Indexes</h2>
        <p className="text-muted-foreground mb-4">For optimal query performance at scale, consider adding these indexes:</p>
        <SqlBlock>{`-- High-priority indexes for common queries:
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_contact_id ON campaign_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON campaign_contacts(status);
CREATE INDEX IF NOT EXISTS idx_email_inbox_user_id ON email_inbox(user_id);
CREATE INDEX IF NOT EXISTS idx_email_inbox_folder ON email_inbox(user_id, folder);
CREATE INDEX IF NOT EXISTS idx_email_events_campaign_contact_id ON email_events(campaign_contact_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_user_id ON company_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_company_id ON company_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_dm_campaigns_user_id ON dm_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);

-- GIN index for JSONB queries:
CREATE INDEX IF NOT EXISTS idx_companies_metadata ON companies USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_companies_extra_data ON companies USING gin(extra_data);

-- Text search indexes:
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Views</h2>
        <p className="text-muted-foreground mb-4">Currently no custom views are defined. Consider creating these for common reporting needs:</p>
        <SqlBlock>{`-- Example: Campaign performance view
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
  c.id, c.name, c.status, c.created_at,
  c.total_contacts, c.sent_count, c.open_count, c.click_count,
  CASE WHEN c.sent_count > 0 
    THEN ROUND((c.open_count::numeric / c.sent_count) * 100, 2) 
    ELSE 0 END AS open_rate,
  CASE WHEN c.open_count > 0 
    THEN ROUND((c.click_count::numeric / c.open_count) * 100, 2) 
    ELSE 0 END AS click_rate,
  c.user_id
FROM campaigns c;

-- Example: Contact engagement summary
CREATE OR REPLACE VIEW contact_engagement AS
SELECT 
  co.id, co.first_name, co.last_name, co.email,
  COUNT(DISTINCT cc.campaign_id) AS campaigns_count,
  COUNT(CASE WHEN cc.opened_at IS NOT NULL THEN 1 END) AS opens,
  COUNT(CASE WHEN cc.clicked_at IS NOT NULL THEN 1 END) AS clicks,
  co.user_id
FROM contacts co
LEFT JOIN campaign_contacts cc ON co.id = cc.contact_id
GROUP BY co.id;`}</SqlBlock>
      </div>
    </div>
  );
}

function DatabaseFunctionsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Database Functions & Stored Procedures</h1>
      
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">1. update_updated_at_column()</h2>
        <Badge className="mb-3">TRIGGER FUNCTION</Badge>
        <p className="text-muted-foreground mb-3">Auto-updates the <code className="text-primary">updated_at</code> column on any UPDATE. Attached to all tables with updated_at.</p>
        <SqlBlock>{`CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">2. handle_new_user()</h2>
        <Badge className="mb-3">TRIGGER FUNCTION</Badge>
        <p className="text-muted-foreground mb-3">Fires on INSERT into auth.users. Creates profile, assigns role, grants 300 credits, and optionally creates creator profile with social accounts.</p>
        <SqlBlock>{`CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  user_role TEXT;
  creator_record_id UUID;
  creator_name TEXT;
  generated_handle TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'user');
  creator_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 
                           split_part(COALESCE(NEW.email, ''), '@', 1), 'creator');
  generated_handle := LOWER(REGEXP_REPLACE(creator_name, '[^a-zA-Z0-9]+', '_', 'g')) 
                      || '_' || SUBSTRING(NEW.id::text, 1, 8);

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'))
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, 
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url), updated_at = now();

  -- Assign role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Grant starter credits
  INSERT INTO public.user_credits (user_id, balance, total_purchased) VALUES (NEW.id, 300, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Creator-specific setup (social accounts, etc.)
  IF user_role = 'creator' THEN
    INSERT INTO public.creators (user_id, name, handle, bio)
    VALUES (NEW.id, creator_name, generated_handle, '')
    RETURNING id INTO creator_record_id;
    -- ... links social accounts from OAuth metadata
  END IF;
  RETURN NEW;
END;
$$;`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">3. has_role(uuid, app_role)</h2>
        <Badge className="mb-3">SECURITY DEFINER</Badge>
        <p className="text-muted-foreground mb-3">Checks if a user has a specific role. Used in RLS policies to prevent recursive checks.</p>
        <SqlBlock>{`CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">4. deduct_credits(uuid, int, text, text)</h2>
        <Badge className="mb-3">SECURITY DEFINER</Badge>
        <p className="text-muted-foreground mb-3">Deducts credits from a user's balance. Admins bypass deduction. Returns boolean success.</p>
        <SqlBlock>{`CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid, p_amount int, p_tool text, p_description text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE current_balance INTEGER; is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles 
    WHERE user_id = p_user_id AND role = 'admin') INTO is_admin;
  IF is_admin THEN
    INSERT INTO credit_transactions (user_id, amount, type, tool_used, description)
    VALUES (p_user_id, 0, 'admin_usage', p_tool, p_description);
    RETURN TRUE;
  END IF;
  SELECT balance INTO current_balance FROM user_credits 
    WHERE user_id = p_user_id FOR UPDATE;
  IF current_balance IS NULL OR current_balance < p_amount THEN RETURN FALSE; END IF;
  UPDATE user_credits SET balance = balance - p_amount, updated_at = now() 
    WHERE user_id = p_user_id;
  INSERT INTO credit_transactions (user_id, amount, type, tool_used, description)
  VALUES (p_user_id, -p_amount, 'usage', p_tool, p_description);
  RETURN TRUE;
END;
$$;`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">5. toggle_favorite(uuid, text)</h2>
        <Badge className="mb-3">SECURITY DEFINER</Badge>
        <p className="text-muted-foreground mb-3">Toggles a tool favorite on/off for a user. Returns TRUE if favorited, FALSE if unfavorited.</p>
        <SqlBlock>{`CREATE OR REPLACE FUNCTION public.toggle_favorite(p_user_id uuid, p_tool_id text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE existing_id UUID;
BEGIN
  SELECT id INTO existing_id FROM user_favorites 
    WHERE user_id = p_user_id AND tool_id = p_tool_id;
  IF existing_id IS NOT NULL THEN
    DELETE FROM user_favorites WHERE id = existing_id;
    RETURN FALSE;
  ELSE
    INSERT INTO user_favorites (user_id, tool_id) VALUES (p_user_id, p_tool_id);
    RETURN TRUE;
  END IF;
END;
$$;`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">6. get_user_top_tools(uuid, int)</h2>
        <Badge className="mb-3">SECURITY DEFINER</Badge>
        <p className="text-muted-foreground mb-3">Returns the top N most-used tools for a user from tool_usage_analytics.</p>
        <SqlBlock>{`CREATE OR REPLACE FUNCTION public.get_user_top_tools(
  p_user_id uuid, p_limit integer DEFAULT 10
) RETURNS TABLE(tool_id text, tool_category text, usage_count bigint, last_used timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tool_id, tool_category, COUNT(*) as usage_count, MAX(created_at) as last_used
  FROM tool_usage_analytics WHERE user_id = p_user_id
  GROUP BY tool_id, tool_category ORDER BY usage_count DESC LIMIT p_limit;
$$;`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">7. create_sample_templates_for_user()</h2>
        <Badge className="mb-3">TRIGGER FUNCTION</Badge>
        <p className="text-muted-foreground mb-3">Creates starter email/DM templates and a sample campaign template when a new user is created.</p>
        <SqlBlock>{`-- Inserts 4 starter templates (Welcome, Follow Up, Instagram, TikTok)
-- and 1 campaign template (Cold Outreach - Starter) for new users`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">8. create_default_contract_templates()</h2>
        <Badge className="mb-3">TRIGGER FUNCTION</Badge>
        <p className="text-muted-foreground mb-3">Creates 3 default contract templates (Standard Collaboration, Influencer Campaign, Content License) for new users.</p>
      </div>
    </div>
  );
}

function TriggersEnumsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Triggers & Enums</h1>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Custom Enum Types</h2>
        <SqlBlock>{`CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
-- Used in: user_roles.role column and has_role() function`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Triggers</h2>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">on_auth_user_created</h3>
            <p className="text-muted-foreground text-sm">AFTER INSERT on auth.users → calls handle_new_user()</p>
            <p className="text-xs text-muted-foreground mt-1">Creates profile, assigns role, grants credits, sets up creator accounts</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">update_*_updated_at</h3>
            <p className="text-muted-foreground text-sm">BEFORE UPDATE on contacts, templates, campaigns, companies, company_contacts, etc. → calls update_updated_at_column()</p>
            <p className="text-xs text-muted-foreground mt-1">Auto-sets updated_at = now() on every row update</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">create_sample_templates_trigger</h3>
            <p className="text-muted-foreground text-sm">AFTER INSERT on profiles → calls create_sample_templates_for_user()</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">create_contract_templates_trigger</h3>
            <p className="text-muted-foreground text-sm">AFTER INSERT on profiles → calls create_default_contract_templates()</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Full Trigger SQL</h2>
        <SqlBlock>{`-- Auth user trigger (on auth schema)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers (applied to all major tables)
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_contacts_updated_at
  BEFORE UPDATE ON public.company_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sample data triggers
CREATE TRIGGER create_sample_templates_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_sample_templates_for_user();

CREATE TRIGGER create_contract_templates_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_contract_templates();`}</SqlBlock>
      </div>
    </div>
  );
}

function EdgeFunctionsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Supabase Edge Functions</h1>
      <p className="text-muted-foreground">All edge functions are deployed automatically. Located in <code className="text-primary">supabase/functions/</code>.</p>

      {[
        {
          name: 'send-campaign-emails',
          jwt: true,
          desc: 'Sends emails via Brevo/SendGrid/SMTP with tracking pixels. Reads email_settings for user credentials, updates campaign_contacts status, logs to campaign_send_logs.',
          input: '{ campaignId: string }',
          tables: 'campaigns, campaign_contacts, contacts, email_settings, templates, campaign_send_logs, activity_logs',
        },
        {
          name: 'track-email',
          jwt: false,
          desc: 'Handles open/click tracking pixel requests. Inserts into email_events, updates campaign_contacts (opened_at, clicked_at), updates campaign counters.',
          input: 'Query params: cc (campaign_contact_id), t (type: open|click)',
          tables: 'campaign_contacts, campaigns, email_events',
        },
        {
          name: 'inbound-email-webhook',
          jwt: false,
          desc: 'Webhook for inbound email providers (SendGrid, Mailgun). Parses incoming email, saves to email_inbox.',
          input: 'Provider-specific webhook payload',
          tables: 'email_inbox, contacts',
        },
        {
          name: 'match-email-replies',
          jwt: false,
          desc: 'Matches inbound emails to campaigns and contacts. Uses from_email and in_reply_to headers to link replies.',
          input: '{ from_email, to_email, subject, body_text, body_html, message_id, in_reply_to }',
          tables: 'email_inbox, contacts, campaign_contacts, activity_logs',
        },
        {
          name: 'process-follow-ups',
          jwt: false,
          desc: 'Processes follow_up_queue entries whose scheduled_at has passed. Sends follow-up emails based on trigger conditions.',
          input: 'None (cron-triggered)',
          tables: 'follow_up_queue, follow_up_sequences, campaign_contacts, email_settings',
        },
        {
          name: 'process-scheduled-campaigns',
          jwt: false,
          desc: 'Checks campaigns with status=scheduled and scheduled_at <= now(), then launches them automatically.',
          input: 'None (cron-triggered)',
          tables: 'campaigns',
        },
        {
          name: 'test-deliverability',
          jwt: true,
          desc: 'Tests SPF/DKIM/DMARC records and spam score for a given email address. Stores results in email_deliverability_tests.',
          input: '{ email: string }',
          tables: 'email_deliverability_tests',
        },
        {
          name: 'scrape-linkedin-profile',
          jwt: false,
          desc: 'Scrapes public LinkedIn profile data (name, headline, experience, skills) and stores in linkedin_leads.',
          input: '{ linkedin_url: string }',
          tables: 'linkedin_leads',
        },
        {
          name: 'track-website-visitor',
          jwt: false,
          desc: 'Processes website tracking events. Handles visitor identification, session tracking, and logs activities if contact is matched by email.',
          input: '{ user_id, event_type, page_url, referrer, visitor_id, email?, metadata? }',
          tables: 'contact_activities, company_contacts',
        },
      ].map(fn => (
        <div key={fn.name} className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold text-foreground font-mono">{fn.name}</h2>
            <Badge variant={fn.jwt ? 'default' : 'secondary'}>{fn.jwt ? 'JWT Required' : 'Public'}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mb-3">{fn.desc}</p>
          <div className="space-y-2 text-xs">
            <div className="flex gap-2"><span className="text-foreground font-semibold">Input:</span><span className="text-muted-foreground font-mono">{fn.input}</span></div>
            <div className="flex gap-2"><span className="text-foreground font-semibold">Tables:</span><span className="text-muted-foreground font-mono">{fn.tables}</span></div>
          </div>
        </div>
      ))}

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">config.toml</h2>
        <SqlBlock>{`project_id = "syqawvakxxfaohcgrenn"

[functions.send-campaign-emails]
verify_jwt = true

[functions.track-email]
verify_jwt = false

[functions.process-scheduled-campaigns]
verify_jwt = false

[functions.process-follow-ups]
verify_jwt = false

[functions.match-email-replies]
verify_jwt = false

[functions.inbound-email-webhook]
verify_jwt = false

[functions.test-deliverability]
verify_jwt = true

[functions.scrape-linkedin-profile]
verify_jwt = false`}</SqlBlock>
      </div>
    </div>
  );
}

function RLSPoliciesDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Row Level Security (RLS) Policies</h1>
      <p className="text-muted-foreground">All tables have RLS enabled. Policies enforce data isolation per authenticated user.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Pattern 1: Owner-based (Most Tables)</h2>
        <p className="text-muted-foreground mb-3">Used by: contacts, campaigns, companies, company_contacts, templates, email_settings, dm_campaigns, etc.</p>
        <SqlBlock>{`-- Full CRUD restricted to owner
CREATE POLICY "Users can view own" ON table_name FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own" ON table_name FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own" ON table_name FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own" ON table_name FOR DELETE USING (auth.uid() = user_id);`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Pattern 2: Join-based (Junction Tables)</h2>
        <p className="text-muted-foreground mb-3">Used by: campaign_contacts, dm_campaign_contacts, follow_up_queue</p>
        <SqlBlock>{`-- Access via parent table ownership
CREATE POLICY "Users can view campaign contacts" ON campaign_contacts
FOR SELECT USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_contacts.campaign_id 
          AND campaigns.user_id = auth.uid())
);`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Pattern 3: Public Insert (Webhooks/Tracking)</h2>
        <p className="text-muted-foreground mb-3">Used by: email_events, campaign_send_logs, activity_logs</p>
        <SqlBlock>{`-- Allow public inserts (for edge functions with service role)
CREATE POLICY "Public can insert" ON email_events FOR INSERT WITH CHECK (true);
-- But SELECT still restricted to owner via joins
CREATE POLICY "Users can view" ON email_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM campaign_contacts cc JOIN campaigns c ON cc.campaign_id = c.id
          WHERE cc.id = email_events.campaign_contact_id AND c.user_id = auth.uid())
);`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Pattern 4: Multi-party (Contracts)</h2>
        <p className="text-muted-foreground mb-3">Used by: collaboration_contracts, contract_activity, campaign_invitations</p>
        <SqlBlock>{`-- Brand can manage, creator can view/sign
CREATE POLICY "Brands can manage" ON collaboration_contracts FOR ALL 
  USING (brand_user_id = auth.uid());
CREATE POLICY "Creators can view" ON collaboration_contracts FOR SELECT 
  USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Read-only Tables</h2>
        <p className="text-muted-foreground">country_timezones: SELECT only, open to all authenticated users.</p>
      </div>
    </div>
  );
}

function N8nDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">n8n Automation</h1>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Setup Steps</h2>
        <div className="space-y-4">
          <Step number={1} title="Download Workflow">Go to n8n tab → click Download to get JSON file</Step>
          <Step number={2} title="Import to n8n">Add Workflow → Import from File → Select JSON</Step>
          <Step number={3} title="Add Supabase Credentials">Use your project URL and service role key</Step>
          <Step number={4} title="Configure Email Provider">Add Brevo, SendGrid, or SMTP credentials</Step>
          <Step number={5} title="Activate Workflow">Toggle Active to enable execution</Step>
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Tables Used by n8n</h2>
        <div className="space-y-2 font-mono text-sm">
          {['campaign_contacts', 'campaign_send_logs', 'activity_logs', 'email_events'].map(t => (
            <div key={t} className="p-3 bg-secondary/50 rounded-lg text-primary">{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseLoggingDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Database Logging</h1>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Logging Tables</h2>
        <div className="space-y-3">
          {[
            { name: 'activity_logs', desc: 'Every user action: campaign creation, contact imports, template edits' },
            { name: 'campaign_send_logs', desc: 'Detailed send events: success, failures, error codes, timestamps' },
            { name: 'email_events', desc: 'Tracking events: opens, clicks, IP addresses, user agents' },
            { name: 'page_views', desc: 'User navigation tracking' },
            { name: 'contract_activity', desc: 'Contract lifecycle events (viewed, signed, edited)' },
            { name: 'credit_transactions', desc: 'Credit usage and purchase history' },
            { name: 'tool_usage_analytics', desc: 'Which tools users interact with most' },
          ].map(t => (
            <div key={t.name} className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground font-mono mb-1">{t.name}</h3>
              <p className="text-muted-foreground text-sm">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Retention & Access</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />All logs retained indefinitely</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />Export via Supabase dashboard or API</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />RLS ensures users only see their own data</li>
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
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-warning" />Auth users are in Supabase's auth schema — need alternative auth system</li>
          <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-warning" />RLS policies use auth.uid() — adapt for your auth system</li>
          <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-warning" />Edge Functions need to be rewritten as backend APIs</li>
        </ul>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Export Steps</h2>
        <SqlBlock>{`# Export schema
pg_dump --schema=public --schema-only --no-owner --no-privileges \\
  "postgresql://postgres:[PASSWORD]@db.syqawvakxxfaohcgrenn.supabase.co:5432/postgres" > schema.sql

# Export data
pg_dump --schema=public --data-only --no-owner --no-privileges \\
  "postgresql://postgres:[PASSWORD]@db.syqawvakxxfaohcgrenn.supabase.co:5432/postgres" > data.sql

# Import to new PostgreSQL
createdb outreachcopilot
psql -d outreachcopilot -f schema.sql
psql -d outreachcopilot -f data.sql`}</SqlBlock>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Auth Alternatives</h2>
        <ul className="space-y-2 text-muted-foreground">
          {['Passport.js (Express)', 'Auth0 / Clerk (managed)', 'Custom JWT (bcrypt + jsonwebtoken)'].map(a => (
            <li key={a} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ApiSetupDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">API Setup</h1>
      {[
        { name: 'Brevo (Recommended)', steps: ['Sign up at brevo.com', 'Settings → SMTP & API → Create API Key', 'Add BREVO_API_KEY to settings', 'Free tier: 300 emails/day'] },
        { name: 'SendGrid', steps: ['Sign up at sendgrid.com', 'Verify sender domain', 'Create API key at Settings → API Keys', 'Free tier: 100 emails/day'] },
        { name: 'Custom SMTP', steps: ['Get SMTP host, port, user, password from provider', 'Enter in Settings → Email Configuration', 'Test with deliverability checker'] },
        { name: 'Twilio (Voice/SMS)', steps: ['Sign up at twilio.com', 'Get Account SID and Auth Token', 'Purchase phone number ($1/month)', 'Add credentials to settings'] },
      ].map(api => (
        <div key={api.name} className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{api.name}</h2>
          <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
            {api.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      ))}
    </div>
  );
}

function PageReferenceDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Page-by-Page Reference</h1>
      <p className="text-muted-foreground">How each page connects to the database and what hooks/functions it uses.</p>

      {[
        {
          page: '/ (Dashboard)',
          route: '/',
          desc: 'Main dashboard with stats cards, activity feed, and campaign analytics.',
          hooks: 'useCampaigns, useContacts, useActivityLog',
          tables: 'campaigns, contacts, activity_logs, campaign_contacts',
          component: 'Dashboard.tsx → StatsCard, ActivityFeed, CampaignAnalytics',
        },
        {
          page: 'Contacts',
          route: '/contacts (tab)',
          desc: 'Manage outreach contacts. Import via CSV, inline editing, bulk delete.',
          hooks: 'useContacts',
          tables: 'contacts',
          component: 'ContactsPage.tsx → ContactsTable, CSVUploader, ExternalImporter',
        },
        {
          page: 'Campaigns',
          route: '/campaigns (tab)',
          desc: 'Create, manage, and monitor email campaigns. Campaign wizard, A/B testing, calendar view.',
          hooks: 'useCampaigns, useContacts, useCampaignTemplates, useTemplates',
          tables: 'campaigns, campaign_contacts, contacts, templates, campaign_templates',
          component: 'CampaignsPage.tsx → CampaignWizard, CampaignList, CampaignCalendar',
        },
        {
          page: 'Templates',
          route: '/templates (tab)',
          desc: 'Template library for email, DM, and voicemail messages.',
          hooks: 'useTemplates, useCampaignTemplates',
          tables: 'templates, campaign_templates',
          component: 'TemplatesLibraryPage.tsx → RichTemplateEditor, SequenceBuilder',
        },
        {
          page: 'Companies',
          route: '/companies (tab)',
          desc: 'Manage organizations with 60+ data fields. Link person-level contacts. CSV import/export.',
          hooks: 'useCompanies, useCompanyContacts',
          tables: 'companies, company_contacts',
          component: 'CompaniesPage.tsx → CompanyFormDialog, CompanyContactsTab',
        },
        {
          page: 'Unified Inbox',
          route: '/inbox (tab)',
          desc: 'All inbound replies (email + DM) in one view. Filter, star, archive.',
          hooks: 'Custom queries on email_inbox',
          tables: 'email_inbox, contacts, campaigns',
          component: 'UnifiedInbox.tsx → EmailInbox',
        },
        {
          page: 'Social DMs',
          route: '/social-dms (tab)',
          desc: 'Instagram/TikTok DM outreach campaigns with A/B testing.',
          hooks: 'Custom queries on dm_campaigns, dm_campaign_contacts',
          tables: 'dm_campaigns, dm_campaign_contacts, creators, templates',
          component: 'SocialDMsPage.tsx → DMTemplates, DMAccountSetup, DMABTesting',
        },
        {
          page: 'Analytics',
          route: '/analytics (tab)',
          desc: 'Campaign performance metrics, send time heatmap, unified analytics.',
          hooks: 'useCampaigns, custom queries',
          tables: 'campaigns, campaign_contacts, email_events',
          component: 'AnalyticsDashboard.tsx → UnifiedAnalytics, SendTimeHeatmap',
        },
        {
          page: 'LinkedIn Scraper',
          route: '/linkedin (tab)',
          desc: 'Scrape LinkedIn profiles, find company links.',
          hooks: 'useLinkedinLeads',
          tables: 'linkedin_leads',
          component: 'LinkedInScraperPage.tsx, LinkFinderPage.tsx',
        },
        {
          page: 'Settings',
          route: '/settings (tab)',
          desc: 'Email provider configuration, CRM webhooks, email warmup.',
          hooks: 'useEmailSettings',
          tables: 'email_settings, email_warmup_schedules, email_deliverability_tests',
          component: 'SettingsPage.tsx → EmailWarmup, CRMWebhookIntegration',
        },
        {
          page: 'n8n Automation',
          route: '/n8n (tab)',
          desc: 'Export n8n workflow JSON for multi-channel automation.',
          hooks: 'None (static export)',
          tables: 'Referenced: campaign_contacts, campaign_send_logs, activity_logs',
          component: 'N8nWorkflow.tsx',
        },
        {
          page: 'Documentation',
          route: '/docs',
          desc: 'This page. Comprehensive technical reference.',
          hooks: 'None',
          tables: 'None',
          component: 'Documentation.tsx',
        },
      ].map(p => (
        <div key={p.page} className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold text-foreground">{p.page}</h2>
            <Badge variant="secondary" className="font-mono text-xs">{p.route}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mb-3">{p.desc}</p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex gap-2"><span className="text-foreground font-semibold min-w-[80px]">Hooks:</span><span className="text-muted-foreground font-mono">{p.hooks}</span></div>
            <div className="flex gap-2"><span className="text-foreground font-semibold min-w-[80px]">Tables:</span><span className="text-muted-foreground font-mono">{p.tables}</span></div>
            <div className="flex gap-2"><span className="text-foreground font-semibold min-w-[80px]">Components:</span><span className="text-muted-foreground font-mono">{p.component}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== NEW FEATURE DOCS ========== */

function LeadScoringDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Lead Scoring & Intelligence</h1>
      <p className="text-muted-foreground">Advanced engagement-based scoring with MQL/SQL tracking, seniority weighting, and duplicate detection.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Scoring Methodology</h2>
        <p className="text-muted-foreground mb-4">Lead scores are calculated using a weighted formula across multiple dimensions:</p>
        <div className="space-y-3">
          {[
            { category: 'Seniority', weight: '25 pts', desc: 'C-Level/VP/Director get highest scores' },
            { category: 'Email Available', weight: '20 pts', desc: 'Contacts with verified email addresses' },
            { category: 'Phone Available', weight: '15 pts', desc: 'Direct phone or mobile available' },
            { category: 'MQL Status', weight: '15 pts', desc: 'Marketing Qualified Lead designation' },
            { category: 'SQL Status', weight: '15 pts', desc: 'Sales Qualified Lead designation' },
            { category: 'LinkedIn Profile', weight: '10 pts', desc: 'Has LinkedIn URL for outreach' },
            { category: 'Engagement Score', weight: 'Variable', desc: 'Based on email opens, clicks, page visits (recency-weighted)' },
          ].map(s => (
            <div key={s.category} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <span className="font-semibold text-foreground">{s.category}</span>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Badge variant="secondary">{s.weight}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Database Functions</h2>
        <SqlBlock title="calculate_lead_score(p_contact_id uuid)">{`-- Calculates score for a single contact based on data completeness,
-- seniority, MQL/SQL status, and engagement history.
-- Returns integer score (0-100).
-- Updates company_contacts.lead_score and lead_score_breakdown.
SELECT calculate_lead_score('contact-uuid-here');`}</SqlBlock>
        <SqlBlock title="batch_calculate_lead_scores(p_user_id uuid)">{`-- Scores ALL contacts for a user. Returns count of scored contacts.
SELECT batch_calculate_lead_scores(auth.uid());`}</SqlBlock>
        <SqlBlock title="find_duplicate_contacts(p_user_id uuid)">{`-- Finds duplicate contacts by matching email or name+company.
-- Returns: contact_id, duplicate_of_id, match_type, match_value
SELECT * FROM find_duplicate_contacts(auth.uid());`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Hooks & Components</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Hook:</span><code className="text-primary">useLeadScoring()</code> — scoreContact, scoreAll, findDuplicates mutations</div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Component:</span><code className="text-primary">LeadScoringPanel.tsx</code> — Dashboard with score breakdown, MQL/SQL rates, contact detail dialog</div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Tables:</span><code className="text-muted-foreground">company_contacts (lead_score, lead_score_breakdown, mql, sql_status, ig_score)</code></div>
        </div>
      </div>
    </div>
  );
}

function AutomationRulesDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Workflow Automation Rules</h1>
      <p className="text-muted-foreground">Create IF/THEN automation rules to auto-move pipeline stages, send emails, add tags, and more.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Trigger Types</h2>
        <div className="space-y-2">
          {[
            { type: 'lead_score_threshold', desc: 'When a contact\'s lead score exceeds a threshold (e.g., > 70)' },
            { type: 'no_reply', desc: 'When no reply is received within N days of sending' },
            { type: 'stage_change', desc: 'When a contact moves to a specific pipeline stage' },
            { type: 'new_contact', desc: 'When a new contact is created' },
            { type: 'email_opened', desc: 'When a campaign email is opened by a contact' },
          ].map(t => (
            <div key={t.type} className="p-3 border border-border rounded-lg">
              <code className="text-primary font-mono text-sm">{t.type}</code>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Action Types</h2>
        <div className="space-y-2">
          {[
            { type: 'move_stage', desc: 'Move contact to a pipeline stage (e.g., Qualified, Negotiation)' },
            { type: 'send_email', desc: 'Send a template email to the contact' },
            { type: 'add_tag', desc: 'Add a tag to the contact (e.g., hot-lead, follow-up)' },
            { type: 'notify', desc: 'Send a notification to the user' },
            { type: 'create_task', desc: 'Create a follow-up task' },
          ].map(t => (
            <div key={t.type} className="p-3 border border-border rounded-lg">
              <code className="text-primary font-mono text-sm">{t.type}</code>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Tables & Hooks</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Tables:</span><code className="text-muted-foreground">automation_rules, automation_logs</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Hook:</span><code className="text-primary">useAutomationRules()</code> — CRUD for rules + logs query</div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Component:</span><code className="text-primary">AutomationRulesPage.tsx</code> — Rule builder UI with trigger/action config</div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">RLS:</span><code className="text-muted-foreground">Users manage own rules (ALL policy). Logs: public insert, user select.</code></div>
        </div>
      </div>
    </div>
  );
}

function ContactTrackingDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Contact Activity Tracking</h1>
      <p className="text-muted-foreground">Track every interaction with contacts: page visits, email opens, calls, meetings, and form submissions.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Activity Types</h2>
        <div className="grid grid-cols-2 gap-2">
          {['page_view', 'email_open', 'email_click', 'email_reply', 'form_submit', 'call', 'meeting', 'note', 'deal_created', 'stage_change'].map(t => (
            <div key={t} className="p-2 bg-secondary/50 rounded font-mono text-sm text-primary">{t}</div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Timeline</h2>
        <p className="text-muted-foreground mb-3">The <code className="text-primary">ContactTimeline.tsx</code> component displays a vertical timeline grouped by date, showing all activities for a contact with type-specific icons and metadata.</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Hook:</span><code className="text-primary">useContactActivities(contactId?)</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Table:</span><code className="text-muted-foreground">contact_activities</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">RLS:</span><code className="text-muted-foreground">Public insert (for tracking script), user manages own</code></div>
        </div>
      </div>
    </div>
  );
}

function WebsiteTrackingDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Website Visitor Tracking</h1>
      <p className="text-muted-foreground">Embed a JavaScript tracking script on your website to identify visitors and match them to contacts.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">How It Works</h2>
        <div className="space-y-4">
          <Step number={1} title="Embed Tracking Script">Copy the generated JavaScript snippet and add it to your website's HTML.</Step>
          <Step number={2} title="Track Page Views">The script automatically tracks page views, referrers, and session duration.</Step>
          <Step number={3} title="Identify Visitors">When a visitor fills a form or clicks a tracked link, they're matched to a contact by email.</Step>
          <Step number={4} title="View Activity">All matched activities appear in the contact's timeline and activity feed.</Step>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Edge Function: track-website-visitor</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Endpoint:</span><code className="text-primary">POST /functions/v1/track-website-visitor</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Auth:</span><code className="text-muted-foreground">Public (no JWT required)</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Input:</span><code className="text-muted-foreground">{'{ user_id, event_type, page_url, referrer, visitor_id, email?, metadata? }'}</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Tables:</span><code className="text-muted-foreground">contact_activities, company_contacts</code></div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Component</h2>
        <p className="text-muted-foreground text-sm"><code className="text-primary">TrackingScriptPage.tsx</code> — Generates the embeddable script, shows visitor sessions dashboard, and provides a copy-to-clipboard snippet.</p>
      </div>
    </div>
  );
}

function EnrichmentDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Contact Enrichment</h1>
      <p className="text-muted-foreground">Analyze data completeness and identify contacts with missing fields for enrichment.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Completeness Metrics</h2>
        <p className="text-muted-foreground mb-3">The enrichment dashboard calculates completeness percentages for key fields:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['Email', 'Phone', 'LinkedIn URL', 'Title/Role', 'City', 'State', 'Country', 'Seniority', 'Company', 'MQL Status'].map(f => (
            <div key={f} className="p-2 bg-secondary/50 rounded text-muted-foreground">{f}</div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Component</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Page:</span><code className="text-primary">EnrichmentPage.tsx</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Hook:</span><code className="text-primary">useCompanyContacts()</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Features:</span><span className="text-muted-foreground">Completeness bars, missing field identification, enrichment suggestions</span></div>
        </div>
      </div>
    </div>
  );
}

function AuditTrailDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Audit Trail</h1>
      <p className="text-muted-foreground">Track all changes to records across the system with before/after snapshots.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">What's Tracked</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Table name and record ID for every change</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Action type: INSERT, UPDATE, DELETE</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Old data snapshot (before change)</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />New data snapshot (after change)</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />List of changed fields</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Timestamp and user ID</li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Hooks & Components</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Hook:</span><code className="text-primary">useAuditTrail(tableName?, recordId?)</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Component:</span><code className="text-primary">AuditTrailPanel.tsx</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Table:</span><code className="text-muted-foreground">audit_trail</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">RLS:</span><code className="text-muted-foreground">Public insert (system), user select own</code></div>
        </div>
      </div>
    </div>
  );
}

function ReportBuilderDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Custom Report Builder</h1>
      <p className="text-muted-foreground">Build custom reports with drag-and-drop metrics, filters, and multiple chart types.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Supported Chart Types</h2>
        <div className="grid grid-cols-3 gap-2">
          {['Bar Chart', 'Line Chart', 'Pie Chart', 'Area Chart', 'Radar Chart', 'Funnel Chart'].map(t => (
            <div key={t} className="p-3 bg-secondary/50 rounded text-center text-sm text-foreground">{t}</div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sources & Dimensions</h2>
        <p className="text-muted-foreground mb-3">Reports can be grouped by these dimensions:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['Seniority', 'Department', 'Country', 'Pipeline Stage', 'MQL Status', 'SQL Status', 'Industry', 'Tags'].map(d => (
            <div key={d} className="p-2 bg-secondary/50 rounded text-muted-foreground">{d}</div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Hooks & Components</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Hook:</span><code className="text-primary">useCustomReports()</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Component:</span><code className="text-primary">ReportBuilderPage.tsx</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Table:</span><code className="text-muted-foreground">custom_reports</code></div>
        </div>
      </div>
    </div>
  );
}

function RevenueForecastDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Revenue Forecasting</h1>
      <p className="text-muted-foreground">Track deals by expected close date with weighted pipeline value forecasting.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Features</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Total pipeline value and weighted value (Value × Probability %)</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Monthly revenue projections with bar/area charts</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Pipeline funnel conversion visualization</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Deal stage distribution</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Win rate and average deal size metrics</li>
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Hooks & Components</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Hook:</span><code className="text-primary">usePipeline()</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Component:</span><code className="text-primary">RevenueForecastPage.tsx</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Table:</span><code className="text-muted-foreground">deals, pipeline_stages</code></div>
        </div>
      </div>
    </div>
  );
}

function EmailToolsDocs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-foreground">Email & Automation Tools</h1>
      <p className="text-muted-foreground">Dedicated page for SMTP configuration, email provider comparison, and automation alternatives beyond n8n.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">SMTP Configuration</h2>
        <p className="text-muted-foreground mb-3">Quick-setup for popular SMTP providers with pre-filled host/port values:</p>
        <div className="space-y-2">
          {[
            { name: 'Brevo', host: 'smtp-relay.brevo.com:587' },
            { name: 'Gmail', host: 'smtp.gmail.com:587' },
            { name: 'Outlook', host: 'smtp.office365.com:587' },
            { name: 'Mailgun', host: 'smtp.mailgun.org:587' },
            { name: 'SendGrid', host: 'smtp.sendgrid.net:587' },
            { name: 'Amazon SES', host: 'email-smtp.us-east-1.amazonaws.com:587' },
          ].map(p => (
            <div key={p.name} className="flex justify-between p-2 bg-secondary/50 rounded text-sm">
              <span className="text-foreground">{p.name}</span>
              <code className="text-muted-foreground">{p.host}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Email Providers (Free Tiers)</h2>
        <div className="space-y-2">
          {[
            { name: 'Brevo (Sendinblue)', free: '300 emails/day free', note: 'Recommended' },
            { name: 'SendGrid', free: '100 emails/day free forever', note: '' },
            { name: 'Resend', free: '100 emails/day, 3000/month', note: 'Modern API' },
            { name: 'Mailgun', free: '100 emails/day (sandbox)', note: '' },
            { name: 'Mailjet', free: '200 emails/day, 6000/month', note: '' },
          ].map(p => (
            <div key={p.name} className="flex justify-between p-2 bg-secondary/50 rounded text-sm">
              <span className="text-foreground">{p.name} {p.note && <Badge variant="secondary" className="ml-2 text-[10px]">{p.note}</Badge>}</span>
              <span className="text-primary text-xs">{p.free}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Automation Alternatives</h2>
        <p className="text-muted-foreground mb-3">Beyond n8n, these tools can be integrated for workflow automation:</p>
        <div className="space-y-2">
          {[
            { name: 'Supabase Edge Functions', desc: 'Built-in — custom triggers, webhooks, scheduling' },
            { name: 'Zapier', desc: '5000+ app integrations, 100 tasks/month free' },
            { name: 'Make (Integromat)', desc: '1000 ops/month free, visual builder' },
            { name: 'Pipedream', desc: 'Unlimited workflows, Node.js runtime' },
            { name: 'n8n (Self-hosted)', desc: 'Already integrated — 200+ integrations, code nodes' },
          ].map(t => (
            <div key={t.name} className="p-3 border border-border rounded-lg">
              <span className="font-semibold text-foreground text-sm">{t.name}</span>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Component</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Page:</span><code className="text-primary">EmailToolsPage.tsx</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Hook:</span><code className="text-primary">useEmailSettings()</code></div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Tabs:</span><code className="text-muted-foreground">SMTP, Providers, Automation, Testing</code></div>
        </div>
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
          {[
            { title: '❌ Emails not sending', items: ['Verify API key in settings', 'Check domain verification', 'Review Edge Function logs', 'Ensure "from" email matches verified domain'] },
            { title: '❌ CSV import fails', items: ['Ensure proper headers', 'Check encoding (use UTF-8)', 'Verify email format', 'Remove blank rows'] },
            { title: '❌ Data not appearing', items: ['Check RLS policies (must be logged in)', 'Verify user_id matches', 'Check Supabase 1000 row limit', 'Look at browser console for errors'] },
            { title: '❌ Edge function errors', items: ['Check function logs in Supabase dashboard', 'Verify secrets are configured', 'Check CORS headers', 'Test with curl first'] },
          ].map(issue => (
            <div key={issue.title} className="border-b border-border pb-4">
              <h3 className="text-lg font-medium text-foreground mb-2">{issue.title}</h3>
              <ul className="space-y-1 text-muted-foreground text-sm">
                {issue.items.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
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
      <p className="text-muted-foreground">Complete CREATE TABLE statements for restoring the entire schema.</p>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Core Tables</h2>
        <SqlBlock>{`-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text, full_name text, avatar_url text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, first_name text, last_name text,
  email text, business_name text, phone text,
  instagram text, tiktok text, linkedin text, job_title text,
  location text, city text, state text, country text,
  timezone text DEFAULT 'UTC', status text DEFAULT 'pending',
  tags text[] DEFAULT '{}', bounced boolean DEFAULT false,
  bounce_type text, bounced_at timestamptz,
  unsubscribed boolean DEFAULT false, unsubscribed_at timestamptz,
  email_sent boolean DEFAULT false, dm_sent boolean DEFAULT false,
  voicemail_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- companies (60+ columns)
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, name text NOT NULL,
  website text, linkedin_url text, industry text, size text,
  headquarters text, description text, short_description text,
  founded text, specialties text[], logo_url text, phone text, email text,
  employee_count int, annual_revenue text,
  company_name_for_emails text, company_phone text, phone_from_website text,
  instagram_url text, company_linkedin_url text, facebook_url text,
  twitter_url text, pinterest_url text,
  company_city text, company_state text, company_country text, company_address text,
  technologies text, keywords text,
  total_funding text, latest_funding text, latest_funding_amount text,
  subsidiary_of text, number_of_retail_locations text,
  extracted_from text, website_status text,
  d2c_presence text, e_commerce_presence text, social_media_presence text,
  integrated_videos text, integrated_video_urls text,
  ig_username text, ig_bio text, ig_followers_count text,
  total_post_in_3_months text, average_er text, total_collaborations text,
  ugc_example text, worked_with_creators text, hashtags text, mentions text,
  segmentation text, firmographic_score text, engagement_score text,
  ad_library_proof text,
  metadata jsonb DEFAULT '{}', extra_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- company_contacts (30+ columns)
CREATE TABLE IF NOT EXISTS public.company_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, company_id uuid REFERENCES companies(id),
  first_name text, last_name text, seniority text, departments text, title text,
  email text, secondary_email text, email_from_website text,
  work_direct_phone text, home_phone text, mobile_phone text,
  corporate_phone text, other_phone text, person_linkedin_url text,
  city text, state text, country text,
  job_tracking_link text, hiring_job_title text, salary_estimated text,
  job_location text, linkedin_job_link text, linkedin_job_title text, job_basedon text,
  mql text, sql_status text, ig_score text,
  notes_for_sdr text, notes_for_data text, date_of_filtration text,
  extra_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

-- campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, name text NOT NULL,
  status text DEFAULT 'draft', template_id uuid REFERENCES templates(id),
  scheduled_at timestamptz, started_at timestamptz, completed_at timestamptz,
  total_contacts int DEFAULT 0, sent_count int DEFAULT 0,
  open_count int DEFAULT 0, click_count int DEFAULT 0,
  ab_testing_enabled boolean DEFAULT false,
  variant_a_subject text, variant_a_content text,
  variant_a_sent int DEFAULT 0, variant_a_opens int DEFAULT 0, variant_a_clicks int DEFAULT 0,
  variant_b_subject text, variant_b_content text,
  variant_b_sent int DEFAULT 0, variant_b_opens int DEFAULT 0, variant_b_clicks int DEFAULT 0,
  use_recipient_timezone boolean DEFAULT false, optimal_send_hour int DEFAULT 9,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- campaign_contacts
CREATE TABLE IF NOT EXISTS public.campaign_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES campaigns(id),
  contact_id uuid NOT NULL REFERENCES contacts(id),
  status text DEFAULT 'pending', sent_at timestamptz, opened_at timestamptz,
  clicked_at timestamptz, bounced_at timestamptz, bounce_type text,
  error_message text, variant text
);
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;

-- email_inbox
CREATE TABLE IF NOT EXISTS public.email_inbox (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, from_email text NOT NULL, to_email text NOT NULL,
  from_name text, subject text, body_text text, body_html text,
  is_read boolean DEFAULT false, is_starred boolean DEFAULT false,
  folder text DEFAULT 'inbox', message_id text, in_reply_to text,
  campaign_id uuid REFERENCES campaigns(id),
  campaign_contact_id uuid REFERENCES campaign_contacts(id),
  contact_id uuid REFERENCES contacts(id),
  received_at timestamptz DEFAULT now(), created_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_inbox ENABLE ROW LEVEL SECURITY;`}</SqlBlock>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Functions & Triggers</h2>
        <SqlBlock>{`-- Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Role checker
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Credit deduction
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount int, p_tool text, p_description text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_balance INTEGER; is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'admin') INTO is_admin;
  IF is_admin THEN
    INSERT INTO credit_transactions (user_id, amount, type, tool_used, description)
    VALUES (p_user_id, 0, 'admin_usage', p_tool, p_description); RETURN TRUE;
  END IF;
  SELECT balance INTO current_balance FROM user_credits WHERE user_id = p_user_id FOR UPDATE;
  IF current_balance IS NULL OR current_balance < p_amount THEN RETURN FALSE; END IF;
  UPDATE user_credits SET balance = balance - p_amount, updated_at = now() WHERE user_id = p_user_id;
  INSERT INTO credit_transactions (user_id, amount, type, tool_used, description)
  VALUES (p_user_id, -p_amount, 'usage', p_tool, p_description); RETURN TRUE;
END; $$;`}</SqlBlock>
      </div>
    </div>
  );
}
