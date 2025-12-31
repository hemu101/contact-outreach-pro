import { useState, useRef } from 'react';
import { Mail, MessageCircle, Phone, Eye, Save, Image, Video, Music, Link, Bold, Italic, List } from 'lucide-react';
import { Template } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RichTemplateEditorProps {
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
  city: 'New York',
  jobTitle: 'CEO',
};

const variables = [
  '{{firstName}}', 
  '{{lastName}}', 
  '{{businessName}}', 
  '{{city}}',
  '{{state}}',
  '{{country}}',
  '{{jobTitle}}',
  '{{linkedin}}',
];

export function RichTemplateEditor({ templates, onSave }: RichTemplateEditorProps) {
  const [activeType, setActiveType] = useState<Template['type']>('email');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        return 'Hi {{firstName}},\n\nI came across your work with {{businessName}} and was impressed by what you are building.\n\nI would love to connect and discuss a potential collaboration opportunity.\n\nBest regards';
      case 'instagram':
        return 'Hey {{firstName}} 👋\n\nI saw your profile and think you might be interested in what we are working on.\n\nWould love to chat!';
      case 'tiktok':
        return 'Hi {{firstName}} 🎥\n\nLoved your content! I wanted to share something that might interest you and {{businessName}}...';
      case 'voicemail':
        return 'Hi {{firstName}}, this is [Your Name]. I am reaching out about an exciting opportunity for {{businessName}}. Please give me a call back when you get a chance.';
    }
  };

  const parseTemplate = (text: string) => {
    return text
      .replace(/\{\{firstName\}\}/g, sampleContact.firstName)
      .replace(/\{\{lastName\}\}/g, sampleContact.lastName)
      .replace(/\{\{businessName\}\}/g, sampleContact.businessName)
      .replace(/\{\{city\}\}/g, sampleContact.city)
      .replace(/\{\{jobTitle\}\}/g, sampleContact.jobTitle)
      .replace(/\{\{state\}\}/g, 'NY')
      .replace(/\{\{country\}\}/g, 'USA')
      .replace(/\{\{linkedin\}\}/g, 'linkedin.com/in/johnsmith');
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

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.substring(0, start) + text + body.substring(end);
      setBody(newBody);
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    } else {
      setBody(prev => prev + text);
    }
  };

  const insertMediaTag = (type: 'image' | 'video' | 'audio' | 'link') => {
    const placeholders = {
      image: '\n[IMAGE: https://your-image-url.jpg alt="Description"]\n',
      video: '\n[VIDEO: https://your-video-url.mp4]\n',
      audio: '\n[AUDIO: https://your-audio-url.mp3]\n',
      link: '[LINK: https://your-url.com text="Click here"]',
    };
    insertAtCursor(placeholders[type]);
  };

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = body.substring(start, end);
      const newBody = body.substring(0, start) + before + selectedText + after + body.substring(end);
      setBody(newBody);
    }
  };

  // Initialize on mount
  useState(() => {
    handleTypeChange('email');
  });

  const renderHtmlPreview = (text: string) => {
    let html = parseTemplate(text);
    
    // Convert markdown-like formatting to HTML
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[IMAGE: (.*?) alt="(.*?)"\]/g, '<img src="$1" alt="$2" style="max-width:100%;border-radius:8px;margin:8px 0;" />')
      .replace(/\[VIDEO: (.*?)\]/g, '<video src="$1" controls style="max-width:100%;border-radius:8px;margin:8px 0;"></video>')
      .replace(/\[AUDIO: (.*?)\]/g, '<audio src="$1" controls style="width:100%;margin:8px 0;"></audio>')
      .replace(/\[LINK: (.*?) text="(.*?)"\]/g, '<a href="$1" style="color:#3b82f6;text-decoration:underline;">$2</a>')
      .replace(/\n/g, '<br>');
    
    return html;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-1">Create rich email templates with images, videos, and links</p>
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
                <div 
                  className="bg-secondary/50 rounded-lg p-4 text-foreground"
                  dangerouslySetInnerHTML={{ __html: renderHtmlPreview(body) }}
                />
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

              {/* Rich Text Toolbar */}
              {activeType === 'email' && (
                <div className="flex flex-wrap gap-2 p-2 bg-secondary/50 rounded-lg">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => wrapSelection('**', '**')}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => wrapSelection('*', '*')}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-border" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => insertMediaTag('image')}
                    title="Insert Image"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => insertMediaTag('video')}
                    title="Insert Video"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => insertMediaTag('audio')}
                    title="Insert Audio"
                  >
                    <Music className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => insertMediaTag('link')}
                    title="Insert Link"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Message Body</label>
                <Textarea
                  ref={textareaRef}
                  placeholder="Write your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[250px] font-mono text-sm"
                />
              </div>

              {/* Variables */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Insert Variable</p>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <button
                      key={variable}
                      onClick={() => insertAtCursor(variable)}
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

        {/* Live Preview */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Live Preview</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Preview with: {sampleContact.firstName} {sampleContact.lastName}, {sampleContact.jobTitle} at {sampleContact.businessName}
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
            <div 
              className="text-foreground text-sm"
              dangerouslySetInnerHTML={{ __html: renderHtmlPreview(body) || 'Start typing to see preview...' }}
            />
          </div>

          {/* Media Format Help */}
          {activeType === 'email' && (
            <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Media Format Guide:</p>
              <ul className="space-y-1">
                <li><code>[IMAGE: url alt="text"]</code> - Insert image</li>
                <li><code>[VIDEO: url]</code> - Insert video</li>
                <li><code>[AUDIO: url]</code> - Insert audio</li>
                <li><code>[LINK: url text="text"]</code> - Insert link</li>
                <li><code>**text**</code> - Bold text</li>
                <li><code>*text*</code> - Italic text</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
