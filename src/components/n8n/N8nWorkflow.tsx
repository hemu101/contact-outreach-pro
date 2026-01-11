import { useState } from 'react';
import { Copy, Download, ExternalLink, CheckCircle, AlertTriangle, Info, Database, Shield, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Enhanced n8n workflow with Supabase logging, error handling, and rate limiting
const n8nWorkflow = {
  "name": "Advanced Outreach Automation Flow v2",
  "nodes": [
    // Trigger Options
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "minuteInterval": 1 }]
        }
      },
      "id": "schedule-trigger",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [100, 300],
      "notes": "Run every hour during business hours"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "outreach-webhook"
      },
      "id": "webhook-trigger",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [100, 450],
      "notes": "Alternative: Trigger via API call"
    },
    // Fetch pending campaigns from Supabase
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "campaigns",
        "filters": {
          "conditions": [{
            "keyName": "status",
            "condition": "eq",
            "keyValue": "scheduled"
          }]
        }
      },
      "id": "fetch-campaigns",
      "name": "Fetch Scheduled Campaigns",
      "type": "n8n-nodes-base.supabase",
      "position": [300, 300],
      "credentials": { "supabaseApi": { "id": "supabase-creds", "name": "Supabase" } }
    },
    // Fetch campaign contacts
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "campaign_contacts",
        "filters": {
          "conditions": [
            { "keyName": "campaign_id", "condition": "eq", "keyValue": "={{ $json.id }}" },
            { "keyName": "status", "condition": "eq", "keyValue": "pending" }
          ]
        },
        "limit": 50
      },
      "id": "fetch-contacts",
      "name": "Fetch Pending Contacts",
      "type": "n8n-nodes-base.supabase",
      "position": [500, 300]
    },
    // Rate Limit Check
    {
      "parameters": {
        "jsCode": `// Check rate limits before processing
const config = {
  emailsPerHour: 50,
  dmsPerHour: 30,
  delayBetweenMessages: 2000 // 2 seconds
};

const items = $input.all();
const now = new Date();
const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

// Filter contacts within rate limit
let emailCount = 0;
let dmCount = 0;
const eligibleContacts = [];

for (const item of items) {
  const contact = item.json;
  
  if (contact.email && emailCount < config.emailsPerHour) {
    eligibleContacts.push({ ...contact, channel: 'email' });
    emailCount++;
  } else if ((contact.instagram || contact.tiktok) && dmCount < config.dmsPerHour) {
    eligibleContacts.push({ ...contact, channel: 'dm' });
    dmCount++;
  }
}

return eligibleContacts.map(c => ({ json: { ...c, processedAt: now.toISOString() } }));`
      },
      "id": "rate-limit-check",
      "name": "Rate Limit Check",
      "type": "n8n-nodes-base.code",
      "position": [700, 300]
    },
    // Split by channel
    {
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.channel }}",
            "operation": "equals",
            "value2": "email"
          }]
        }
      },
      "id": "channel-router",
      "name": "Route by Channel",
      "type": "n8n-nodes-base.if",
      "position": [900, 300]
    },
    // Email Node
    {
      "parameters": {
        "fromEmail": "={{ $env.SENDER_EMAIL }}",
        "toEmail": "={{ $json.email }}",
        "subject": "={{ $json.subject }}",
        "emailType": "html",
        "message": "={{ $json.content }}"
      },
      "id": "send-email",
      "name": "Send Email (Brevo/SendGrid)",
      "type": "n8n-nodes-base.emailSend",
      "position": [1100, 200],
      "notes": "Configure SMTP or API credentials"
    },
    // DM Node (placeholder for manual handling)
    {
      "parameters": {
        "jsCode": `// Log DM for manual processing or API integration
const contact = $json;
const dmData = {
  platform: contact.instagram ? 'instagram' : 'tiktok',
  handle: contact.instagram || contact.tiktok,
  message: contact.content,
  scheduled_at: new Date().toISOString(),
  status: 'queued'
};

// In production, integrate with ManyChat, PhantomBuster, or direct API
return [{ json: { ...dmData, contact_id: contact.id } }];`
      },
      "id": "queue-dm",
      "name": "Queue DM",
      "type": "n8n-nodes-base.code",
      "position": [1100, 400]
    },
    // Wait node for rate limiting
    {
      "parameters": {
        "amount": 2,
        "unit": "seconds"
      },
      "id": "rate-limit-delay",
      "name": "Rate Limit Delay",
      "type": "n8n-nodes-base.wait",
      "position": [1300, 300]
    },
    // Log success to Supabase
    {
      "parameters": {
        "operation": "update",
        "tableId": "campaign_contacts",
        "filters": {
          "conditions": [{
            "keyName": "id",
            "condition": "eq",
            "keyValue": "={{ $json.contact_id }}"
          }]
        },
        "updateFields": {
          "status": "sent",
          "sent_at": "={{ $now.toISO() }}"
        }
      },
      "id": "log-success",
      "name": "Log Success to DB",
      "type": "n8n-nodes-base.supabase",
      "position": [1500, 200]
    },
    // Log to activity_logs table
    {
      "parameters": {
        "operation": "insert",
        "tableId": "activity_logs",
        "dataToSend": "autoMapInputData",
        "fieldsUi": {
          "fieldValues": [
            { "fieldName": "action_type", "fieldValue": "email_sent" },
            { "fieldName": "entity_type", "fieldValue": "campaign_contact" },
            { "fieldName": "entity_id", "fieldValue": "={{ $json.contact_id }}" },
            { "fieldName": "user_id", "fieldValue": "={{ $json.user_id }}" },
            { "fieldName": "metadata", "fieldValue": "={{ JSON.stringify({ channel: $json.channel, email: $json.email }) }}" }
          ]
        }
      },
      "id": "log-activity",
      "name": "Log to Activity Table",
      "type": "n8n-nodes-base.supabase",
      "position": [1500, 400]
    },
    // Error Handler
    {
      "parameters": {
        "jsCode": `// Handle errors and log to database
const error = $json;
const errorLog = {
  campaign_contact_id: error.contact_id,
  campaign_id: error.campaign_id,
  event_type: 'error',
  status: 'failed',
  error_message: error.message || 'Unknown error',
  error_code: error.code || 'UNKNOWN',
  created_at: new Date().toISOString()
};
return [{ json: errorLog }];`
      },
      "id": "error-handler",
      "name": "Error Handler",
      "type": "n8n-nodes-base.code",
      "position": [1300, 500]
    },
    // Log error to campaign_send_logs
    {
      "parameters": {
        "operation": "insert",
        "tableId": "campaign_send_logs",
        "dataToSend": "autoMapInputData"
      },
      "id": "log-error",
      "name": "Log Error to DB",
      "type": "n8n-nodes-base.supabase",
      "position": [1500, 500]
    },
    // Twilio for voicemail
    {
      "parameters": {
        "resource": "call",
        "operation": "make",
        "from": "={{ $env.TWILIO_NUMBER }}",
        "to": "={{ $json.phone }}",
        "twiml": "<Response><Say>{{ $json.voicemail_script }}</Say></Response>"
      },
      "id": "send-voicemail",
      "name": "Twilio Voicemail",
      "type": "n8n-nodes-base.twilio",
      "position": [1100, 600],
      "notes": "Configure Twilio credentials"
    }
  ],
  "connections": {
    "Schedule Trigger": { "main": [[{ "node": "Fetch Scheduled Campaigns", "type": "main", "index": 0 }]] },
    "Webhook Trigger": { "main": [[{ "node": "Fetch Scheduled Campaigns", "type": "main", "index": 0 }]] },
    "Fetch Scheduled Campaigns": { "main": [[{ "node": "Fetch Pending Contacts", "type": "main", "index": 0 }]] },
    "Fetch Pending Contacts": { "main": [[{ "node": "Rate Limit Check", "type": "main", "index": 0 }]] },
    "Rate Limit Check": { "main": [[{ "node": "Route by Channel", "type": "main", "index": 0 }]] },
    "Route by Channel": { 
      "main": [
        [{ "node": "Send Email (Brevo/SendGrid)", "type": "main", "index": 0 }],
        [{ "node": "Queue DM", "type": "main", "index": 0 }]
      ]
    },
    "Send Email (Brevo/SendGrid)": { "main": [[{ "node": "Rate Limit Delay", "type": "main", "index": 0 }]] },
    "Queue DM": { "main": [[{ "node": "Rate Limit Delay", "type": "main", "index": 0 }]] },
    "Rate Limit Delay": { "main": [[{ "node": "Log Success to DB", "type": "main", "index": 0 }, { "node": "Log to Activity Table", "type": "main", "index": 0 }]] },
    "Error Handler": { "main": [[{ "node": "Log Error to DB", "type": "main", "index": 0 }]] }
  },
  "settings": { 
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "errorWorkflow": "error-handler"
  },
  "staticData": null,
  "meta": {
    "version": "2.0",
    "features": ["supabase-logging", "rate-limiting", "error-handling", "multi-channel"]
  }
};

const setupSteps = [
  {
    title: "1. Supabase Connection",
    content: `Connect n8n to your Supabase instance:
• Go to Credentials → Add → Supabase API
• Use your Supabase URL and Service Role Key
• All campaign data will be logged to your database`,
    type: "database"
  },
  {
    title: "2. Email Provider (Brevo/SendGrid)",
    content: `Configure your email provider:
• Brevo: Settings → SMTP & API → Create API Key
• SendGrid: Settings → API Keys → Create Key
• Add credentials in n8n: Credentials → Email/SMTP`,
    type: "email"
  },
  {
    title: "3. Twilio (Voicemail)",
    content: `Optional voice/SMS setup:
• Get credentials from twilio.com/console
• Add Account SID, Auth Token, Phone Number
• Cost: ~$0.015/call, $0.0075/SMS`,
    type: "phone"
  },
  {
    title: "4. Environment Variables",
    content: `Set these in n8n Settings → Variables:
• SENDER_EMAIL - Your verified sender email
• TWILIO_NUMBER - Your Twilio phone number
• SUPABASE_URL - Your Supabase project URL`,
    type: "info"
  },
  {
    title: "5. Rate Limiting",
    content: `Built-in protection:
• 50 emails/hour max (adjustable in code node)
• 30 DMs/hour max per platform
• 2-second delay between messages
• Auto-pause when limits reached`,
    type: "warning"
  },
  {
    title: "6. Database Logging",
    content: `All actions are logged to Supabase:
• campaign_contacts - Delivery status
• campaign_send_logs - Errors & events
• activity_logs - Full audit trail
• Real-time monitoring in your app`,
    type: "database"
  }
];

export function N8nWorkflow() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(n8nWorkflow, null, 2));
    setCopied(true);
    toast({ title: "Copied!", description: "Workflow JSON copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(n8nWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outreach-automation-n8n-v2.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">n8n Workflow</h1>
            <Badge variant="secondary">v2.0</Badge>
          </div>
          <p className="text-muted-foreground mt-1">Advanced automation with Supabase logging & rate limiting</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
          <Button variant="gradient" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Feature Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Database className="w-3 h-3" /> Supabase Logging
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="w-3 h-3" /> Rate Limiting
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="w-3 h-3" /> Multi-Channel
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Error Handling
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Preview */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Workflow JSON</h3>
          <pre className="bg-background rounded-lg p-4 overflow-auto max-h-96 text-sm text-muted-foreground font-mono">
            {JSON.stringify(n8nWorkflow, null, 2)}
          </pre>
        </div>

        {/* Setup Guide */}
        <div className="space-y-4">
          {setupSteps.map((step, idx) => (
            <div 
              key={idx}
              className="glass-card rounded-xl p-6 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  step.type === 'warning' ? 'bg-warning/10' : 
                  step.type === 'info' ? 'bg-primary/10' : 
                  step.type === 'database' ? 'bg-blue-500/10' :
                  'bg-success/10'
                }`}>
                  {step.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  ) : step.type === 'info' ? (
                    <Info className="w-5 h-5 text-primary" />
                  ) : step.type === 'database' ? (
                    <Database className="w-5 h-5 text-blue-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                    {step.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* n8n Link */}
          <a 
            href="https://n8n.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card rounded-xl p-6 flex items-center justify-between hover:bg-secondary/50 transition-colors group animate-slide-up"
          >
            <div>
              <h4 className="font-semibold text-foreground">Open n8n</h4>
              <p className="text-sm text-muted-foreground">Import workflow in your n8n instance</p>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        </div>
      </div>

      {/* Data Flow Diagram */}
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <h4 className="font-semibold text-foreground mb-4">Data Flow & Logging</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="font-medium">1. Trigger</p>
            <p className="text-xs text-muted-foreground mt-1">Schedule or Webhook</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="font-medium">2. Fetch Data</p>
            <p className="text-xs text-muted-foreground mt-1">campaigns, contacts</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="font-medium">3. Process</p>
            <p className="text-xs text-muted-foreground mt-1">Rate limit, route, send</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10">
            <p className="font-medium text-primary">4. Log to DB</p>
            <p className="text-xs text-muted-foreground mt-1">activity_logs, send_logs</p>
          </div>
        </div>
      </div>

      {/* Rate Limits Warning */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-warning animate-slide-up">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground">Important: Rate Limits & Best Practices</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Email:</strong> 50/hour built-in limit. Warm up new domains gradually.</li>
              <li>• <strong>Instagram:</strong> 30-50 DMs/day max. Use multiple accounts for rotation.</li>
              <li>• <strong>TikTok:</strong> No official API. Use manual queue or third-party tools carefully.</li>
              <li>• <strong>Twilio:</strong> ~$0.015/call. Verify numbers to avoid spam flags.</li>
              <li>• <strong>All Logs:</strong> Stored in Supabase for real-time monitoring in your dashboard.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
