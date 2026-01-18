import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Mail, MessageCircle, User, Building, AtSign } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Template = Tables<'templates'>;

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onUseTemplate?: (templateId: string) => void;
}

// Sample contact data for preview
const sampleContacts = [
  {
    id: '1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    business_name: 'TechCorp Inc.',
    email: 'sarah@techcorp.com',
    handle: '@sarahjohnson',
    platform: 'Instagram',
    followers: '25.4K',
  },
  {
    id: '2',
    first_name: 'Michael',
    last_name: 'Chen',
    business_name: 'StartupXYZ',
    email: 'michael@startupxyz.com',
    handle: '@michaelchen',
    platform: 'TikTok',
    followers: '150K',
  },
  {
    id: '3',
    first_name: 'Emily',
    last_name: 'Williams',
    business_name: 'Creative Agency Co.',
    email: 'emily@creativeagency.co',
    handle: '@emilywilliams',
    platform: 'LinkedIn',
    followers: '5.2K',
  },
];

export function TemplatePreviewModal({ 
  open, 
  onOpenChange, 
  template,
  onUseTemplate 
}: TemplatePreviewModalProps) {
  const [selectedContactId, setSelectedContactId] = useState(sampleContacts[0].id);
  
  const selectedContact = sampleContacts.find(c => c.id === selectedContactId) || sampleContacts[0];

  if (!template) return null;

  const parseTemplate = (text: string) => {
    if (!text) return '';
    
    return text
      .replace(/\{\{first_name\}\}/gi, selectedContact.first_name)
      .replace(/\{\{firstName\}\}/gi, selectedContact.first_name)
      .replace(/\{\{last_name\}\}/gi, selectedContact.last_name)
      .replace(/\{\{lastName\}\}/gi, selectedContact.last_name)
      .replace(/\{\{business_name\}\}/gi, selectedContact.business_name)
      .replace(/\{\{businessName\}\}/gi, selectedContact.business_name)
      .replace(/\{\{email\}\}/gi, selectedContact.email)
      .replace(/\{\{handle\}\}/gi, selectedContact.handle)
      .replace(/\{\{platform\}\}/gi, selectedContact.platform)
      .replace(/\{\{followers\}\}/gi, selectedContact.followers)
      .replace(/\{\{company_name\}\}/gi, 'Your Company')
      .replace(/\{\{sender_name\}\}/gi, 'Your Name');
  };

  const getTypeIcon = () => {
    switch (template.type) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'instagram':
      case 'tiktok':
      case 'linkedin':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (template.type) {
      case 'email':
        return 'bg-blue-500/10 text-blue-500';
      case 'instagram':
        return 'bg-pink-500/10 text-pink-500';
      case 'tiktok':
        return 'bg-purple-500/10 text-purple-500';
      case 'linkedin':
        return 'bg-sky-500/10 text-sky-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor()}`}>
                {getTypeIcon()}
              </div>
              <div>
                <DialogTitle className="text-lg">{template.name}</DialogTitle>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {template.type}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4 space-y-4">
          {/* Contact Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Preview with sample contact:
            </label>
            <Select value={selectedContactId} onValueChange={setSelectedContactId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sampleContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.first_name} {contact.last_name}</span>
                      <span className="text-muted-foreground">- {contact.business_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sample Contact Info */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{selectedContact.first_name} {selectedContact.last_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Company:</span>
              <span className="font-medium">{selectedContact.business_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <AtSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Handle:</span>
              <span className="font-medium">{selectedContact.handle}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Followers:</span>
              <span className="font-medium">{selectedContact.followers}</span>
            </div>
          </div>

          {/* Email Preview */}
          <div className="border rounded-lg overflow-hidden">
            {/* Email Header */}
            {template.type === 'email' && template.subject && (
              <div className="bg-muted/50 px-4 py-3 border-b">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="font-medium">{parseTemplate(template.subject)}</span>
                </div>
              </div>
            )}

            {/* Message Body */}
            <div className="p-4 bg-card">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {parseTemplate(template.content)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onUseTemplate && (
            <Button 
              variant="gradient" 
              onClick={() => {
                onUseTemplate(template.id);
                onOpenChange(false);
              }}
            >
              Use This Template
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
