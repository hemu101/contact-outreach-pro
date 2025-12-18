import { useState } from 'react';
import { Mail, MessageCircle, Phone, Eye, Save } from 'lucide-react';
import { Template } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TemplateEditorProps {
  templates: Template[];
  onSave: (template: Template) => void;
}

const templateTypes = [
  { id: 'email', label: 'Email', icon: Mail, color: 'text-primary' },
  { id: 'instagram', label: 'Instagram DM', icon: MessageCircle, color: 'text-pink-500' },
  { id: 'tiktok', label: 'TikTok DM', icon: MessageCircle, color: 'text-cyan-400' },
  { id: 'voicemail', label: 'Voicemail', icon: Phone, color: 'text-success' },
] as const;

const sampleContact = {
  firstName: 'John',
  lastName: 'Smith',
  businessName: 'Acme Corp',
};

const variables = ['{{firstName}}', '{{lastName}}', '{{businessName}}'];

export function TemplateEditor({ templates, onSave }: TemplateEditorProps) {
  const [activeType, setActiveType] = useState<Template['type']>('email');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const existingTemplate = templates.find(t => t.type === activeType);

  const handleTypeChange = (type: Template['type']) => {
    setActiveType(type);
    const existing = templates.find(t => t.type === type);
    if (existing) {
      setName(existing.name);
      setSubject(existing.subject || '');
      setBody(existing.body);
    } else {
      setName('');
      setSubject('');
      setBody(getDefaultTemplate(type));
    }
  };

  const getDefaultTemplate = (type: Template['type']) => {
    switch (type) {
      case 'email':
        return 'Hi {{firstName}},\n\nI came across your work with {{businessName}} and was impressed by what you\'re building.\n\nI\'d love to connect and discuss a potential collaboration opportunity.\n\nBest regards';
      case 'instagram':
        return 'Hey {{firstName}} 👋\n\nI saw your profile and think you might be interested in what we\'re working on at our company.\n\nWould love to chat!';
      case 'tiktok':
        return 'Hi {{firstName}} 🎥\n\nLoved your content! I wanted to share something that might interest you and {{businessName}}...';
      case 'voicemail':
        return 'Hi {{firstName}}, this is [Your Name]. I\'m reaching out about an exciting opportunity for {{businessName}}. Please give me a call back when you get a chance.';
    }
  };

  const parseTemplate = (text: string) => {
    return text
      .replace(/\{\{firstName\}\}/g, sampleContact.firstName)
      .replace(/\{\{lastName\}\}/g, sampleContact.lastName)
      .replace(/\{\{businessName\}\}/g, sampleContact.businessName);
  };

  const handleSave = () => {
    onSave({
      id: existingTemplate?.id || crypto.randomUUID(),
      name: name || `${activeType} Template`,
      type: activeType,
      subject: activeType === 'email' ? subject : undefined,
      body,
      createdAt: existingTemplate?.createdAt || new Date(),
    });
  };

  const insertVariable = (variable: string) => {
    setBody(prev => prev + variable);
  };

  // Initialize on mount
  useState(() => {
    handleTypeChange('email');
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-1">Create personalized message templates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="gradient" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {templateTypes.map((type) => {
          const Icon = type.icon;
          const isActive = activeType === type.id;
          const hasTemplate = templates.some(t => t.type === type.id);
          
          return (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <Icon className={cn("w-4 h-4", !isActive && type.color)} />
              {type.label}
              {hasTemplate && !isActive && (
                <span className="w-2 h-2 rounded-full bg-success" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="glass-card rounded-xl p-6 space-y-4 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground">
            {showPreview ? 'Preview' : 'Editor'}
          </h3>

          {showPreview ? (
            <div className="space-y-4">
              {activeType === 'email' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Subject</p>
                  <p className="text-foreground font-medium">{parseTemplate(subject)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <div className="bg-secondary/50 rounded-lg p-4 whitespace-pre-wrap text-foreground">
                  {parseTemplate(body)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Template Name</label>
                <Input
                  placeholder="e.g., Welcome Email"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {activeType === 'email' && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Subject Line</label>
                  <Input
                    placeholder="Hi {{firstName}}, Opportunity for {{businessName}}"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Message Body</label>
                <Textarea
                  placeholder="Write your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              {/* Variables */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Insert Variable</p>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <button
                      key={variable}
                      onClick={() => insertVariable(variable)}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-mono hover:bg-primary/20 transition-colors"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sample Preview */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Live Preview</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Preview with sample data: {sampleContact.firstName} {sampleContact.lastName} from {sampleContact.businessName}
          </p>
          
          <div className="bg-background rounded-lg border border-border p-4">
            {activeType === 'email' && (
              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-xs text-muted-foreground">Subject:</p>
                <p className="font-medium text-foreground">
                  {parseTemplate(subject) || 'No subject'}
                </p>
              </div>
            )}
            <div className="whitespace-pre-wrap text-foreground text-sm">
              {parseTemplate(body) || 'Start typing to see preview...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
