import { useState } from 'react';
import { Copy, Download, ExternalLink, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const n8nWorkflow = {
  "name": "Outreach Automation Flow",
  "nodes": [
    {
      "parameters": {
        "operation": "fromFile",
        "fileFormat": "csv",
        "options": {}
      },
      "id": "read-csv",
      "name": "Read CSV",
      "type": "n8n-nodes-base.spreadsheetFile",
      "position": [250, 300],
      "notes": "Upload your CSV file here or trigger from Google Drive/Dropbox"
    },
    {
      "parameters": {
        "jsCode": `// Parse and validate contact data
const contacts = [];
for (const item of $input.all()) {
  const contact = {
    firstName: item.json['First Name'] || item.json['firstName'] || '',
    lastName: item.json['Last Name'] || item.json['lastName'] || '',
    businessName: item.json['Business Name'] || item.json['businessName'] || item.json['Company'] || '',
    email: item.json['Email'] || item.json['email'] || '',
    instagram: item.json['Instagram'] || item.json['instagram'] || '',
    tiktok: item.json['TikTok'] || item.json['tiktok'] || '',
    phone: item.json['Phone'] || item.json['phone'] || ''
  };
  
  // Only include if has at least one contact method
  if (contact.email || contact.instagram || contact.tiktok || contact.phone) {
    contacts.push({ json: contact });
  }
}
return contacts;`
      },
      "id": "parse-contacts",
      "name": "Parse Contacts",
      "type": "n8n-nodes-base.code",
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.email }}",
            "operation": "isNotEmpty"
          }]
        }
      },
      "id": "has-email",
      "name": "Has Email?",
      "type": "n8n-nodes-base.if",
      "position": [650, 200]
    },
    {
      "parameters": {
        "fromEmail": "your-email@example.com",
        "toEmail": "={{ $json.email }}",
        "subject": "Hi {{ $json.firstName }}, Opportunity for {{ $json.businessName }}",
        "emailType": "html",
        "message": `<p>Hi {{ $json.firstName }},</p>
<p>I came across your work with {{ $json.businessName }} and was impressed by what you're building.</p>
<p>I'd love to connect and discuss a potential collaboration opportunity.</p>
<p>Best regards</p>`
      },
      "id": "send-email",
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [850, 100],
      "notes": "Configure SMTP credentials"
    },
    {
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.phone }}",
            "operation": "isNotEmpty"
          }]
        }
      },
      "id": "has-phone",
      "name": "Has Phone?",
      "type": "n8n-nodes-base.if",
      "position": [650, 400]
    },
    {
      "parameters": {
        "resource": "call",
        "operation": "make",
        "from": "YOUR_TWILIO_NUMBER",
        "to": "={{ $json.phone }}",
        "message": "Hi {{ $json.firstName }}, this is a quick message about an opportunity for {{ $json.businessName }}."
      },
      "id": "send-voicemail",
      "name": "Twilio Voicemail",
      "type": "n8n-nodes-base.twilio",
      "position": [850, 400],
      "notes": "Configure Twilio credentials"
    },
    {
      "parameters": {
        "jsCode": `// Log results
const results = {
  contactName: $json.firstName + ' ' + $json.lastName,
  email: $json.email,
  status: 'processed',
  timestamp: new Date().toISOString()
};
return [{ json: results }];`
      },
      "id": "log-results",
      "name": "Log Results",
      "type": "n8n-nodes-base.code",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "YOUR_GOOGLE_SHEET_ID",
        "sheetName": "Logs"
      },
      "id": "google-sheets-log",
      "name": "Log to Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "position": [1250, 300],
      "notes": "Optional: Log to Google Sheets"
    }
  ],
  "connections": {
    "Read CSV": { "main": [[{ "node": "Parse Contacts", "type": "main", "index": 0 }]] },
    "Parse Contacts": { "main": [[{ "node": "Has Email?", "type": "main", "index": 0 }, { "node": "Has Phone?", "type": "main", "index": 0 }]] },
    "Has Email?": { "main": [[{ "node": "Send Email", "type": "main", "index": 0 }], []] },
    "Has Phone?": { "main": [[{ "node": "Twilio Voicemail", "type": "main", "index": 0 }], []] },
    "Send Email": { "main": [[{ "node": "Log Results", "type": "main", "index": 0 }]] },
    "Twilio Voicemail": { "main": [[{ "node": "Log Results", "type": "main", "index": 0 }]] },
    "Log Results": { "main": [[{ "node": "Log to Google Sheets", "type": "main", "index": 0 }]] }
  },
  "settings": { "executionOrder": "v1" },
  "staticData": null
};

const setupSteps = [
  {
    title: "1. Email (SMTP/SendGrid)",
    content: `Configure your email provider credentials:
- Go to Credentials → Add Credential → SMTP or SendGrid
- SMTP: Host, Port, User, Password
- SendGrid: API Key from sendgrid.com/settings/api_keys`,
    type: "email"
  },
  {
    title: "2. Twilio (Voicemail)",
    content: `Get Twilio credentials from twilio.com/console:
- Account SID
- Auth Token
- Phone Number (buy one from Twilio)
- Cost: ~$0.01-0.02 per call`,
    type: "phone"
  },
  {
    title: "3. Instagram DM (Unofficial)",
    content: `⚠️ Instagram API doesn't officially support DMs.
Options:
- Use Instagram Business API (limited)
- Third-party: ManyChat, PhantomBuster
- Manual: Export contact list, use scheduled posts`,
    type: "warning"
  },
  {
    title: "4. TikTok DM (Unofficial)",
    content: `⚠️ TikTok doesn't have a public DM API.
Options:
- Use TikTok Business Center for ads
- PhantomBuster for automation (use carefully)
- Manual outreach recommended`,
    type: "warning"
  },
  {
    title: "5. Scheduling",
    content: `Set up triggers:
- Cron: Schedule → Add Cron (e.g., 0 9 * * * for 9 AM daily)
- Google Drive: On File Upload trigger
- Webhook: HTTP Request trigger for API calls`,
    type: "info"
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
    a.download = 'outreach-automation-n8n.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">n8n Workflow</h1>
          <p className="text-muted-foreground mt-1">Export and configure your automation workflow</p>
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
                  step.type === 'info' ? 'bg-primary/10' : 'bg-success/10'
                }`}>
                  {step.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  ) : step.type === 'info' ? (
                    <Info className="w-5 h-5 text-primary" />
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

      {/* Rate Limits Warning */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-warning animate-slide-up">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground">Important: Rate Limits & API Restrictions</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Email:</strong> Most providers limit 100-500 emails/hour. Use warmup tools.</li>
              <li>• <strong>Instagram:</strong> No official DM API. Third-party tools risk account bans.</li>
              <li>• <strong>TikTok:</strong> No public DM API. Business Center for ads only.</li>
              <li>• <strong>Twilio:</strong> ~$0.015/call. Verify numbers to avoid spam flags.</li>
              <li>• <strong>Best Practice:</strong> Add delays (2-5 seconds) between actions. Use error handling nodes.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
