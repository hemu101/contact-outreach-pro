import { Mail, X } from 'lucide-react';
import { Template } from '@/types/contact';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import type { Tables } from '@/integrations/supabase/types';

type Contact = Tables<'contacts'>;

interface EmailPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | undefined;
  contacts: Contact[];
}

export function EmailPreview({ open, onOpenChange, template, contacts }: EmailPreviewProps) {
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || '');

  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  const parseTemplate = (text: string, contact: Contact | undefined) => {
    if (!text || !contact) return text || '';
    return text
      .replace(/\{\{firstName\}\}/g, contact.first_name || '')
      .replace(/\{\{lastName\}\}/g, contact.last_name || '')
      .replace(/\{\{businessName\}\}/g, contact.business_name || '')
      .replace(/\{\{email\}\}/g, contact.email || '')
      .replace(/\{\{phone\}\}/g, contact.phone || '')
      .replace(/\{\{city\}\}/g, contact.city || '')
      .replace(/\{\{state\}\}/g, contact.state || '')
      .replace(/\{\{country\}\}/g, contact.country || '')
      .replace(/\{\{jobTitle\}\}/g, contact.job_title || '')
      .replace(/\{\{linkedin\}\}/g, contact.linkedin || '');
  };

  const renderHtmlPreview = (text: string, contact: Contact | undefined) => {
    let html = parseTemplate(text, contact);
    
    // Convert markdown-like formatting to HTML
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[IMAGE: (.*?) alt="(.*?)"\]/g, '<img src="$1" alt="$2" style="max-width:100%;border-radius:8px;margin:8px 0;" />')
      .replace(/\[VIDEO: (.*?)\]/g, '<div style="background:#f0f0f0;padding:20px;border-radius:8px;text-align:center;margin:8px 0;">▶️ Video: <a href="$1" style="color:#3b82f6;">Watch Video</a></div>')
      .replace(/\[AUDIO: (.*?)\]/g, '<div style="background:#f0f0f0;padding:10px;border-radius:8px;margin:8px 0;">🎵 Audio: <a href="$1" style="color:#3b82f6;">Listen</a></div>')
      .replace(/\[LINK: (.*?) text="(.*?)"\]/g, '<a href="$1" style="color:#3b82f6;text-decoration:underline;">$2</a>')
      .replace(/\n/g, '<br>');
    
    return html;
  };

  if (!template) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Selector */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Preview as contact:</label>
            <Select value={selectedContactId} onValueChange={setSelectedContactId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name} - {contact.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email Preview */}
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-secondary/50 p-4 border-b border-border">
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-muted-foreground w-16">From:</span>
                  <span className="text-foreground">OutreachAI &lt;noreply@example.com&gt;</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-16">To:</span>
                  <span className="text-foreground">{selectedContact?.email || 'recipient@example.com'}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-16">Subject:</span>
                  <span className="text-foreground font-medium">
                    {parseTemplate(template.subject || '', selectedContact)}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-6 bg-background">
              <div 
                className="text-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: renderHtmlPreview(template.body || '', selectedContact) 
                }}
              />
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground">
            This is a preview of how the email will appear to the selected contact. 
            Template variables are replaced with the contact's actual data.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
