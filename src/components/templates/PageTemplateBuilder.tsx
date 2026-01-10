import { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings,
  Image,
  Video,
  Type,
  Link,
  MessageCircle,
  Upload,
  Trash2,
  Plus,
  GripVertical,
  Globe,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PageTemplateBuilderProps {
  templateId?: string | null;
  onBack: () => void;
  onSave: () => void;
}

interface PageSection {
  id: string;
  type: 'logo' | 'video' | 'text' | 'cta' | 'image';
  content: Record<string, string>;
}

export function PageTemplateBuilder({ templateId, onBack, onSave }: PageTemplateBuilderProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('info');
  const [previewMode, setPreviewMode] = useState(false);
  
  const [pageData, setPageData] = useState({
    name: '',
    title: '',
    description: '',
    url: '',
    favicon: '',
    ogImage: '',
    // Logo section
    logo: '',
    logoAlt: '',
    // Video section
    videoUrl: '',
    videoThumbnail: '',
    autoplay: false,
    // Text content
    headline: '',
    subheadline: '',
    bodyContent: '',
    // Bottom section
    ctaText: 'Get Started',
    ctaUrl: '',
    footerText: '',
    // Live chat
    enableLiveChat: false,
    chatProvider: 'intercom',
    chatId: '',
  });

  const [sections, setSections] = useState<PageSection[]>([
    { id: '1', type: 'logo', content: { url: '', alt: '' } },
    { id: '2', type: 'video', content: { url: '', thumbnail: '' } },
    { id: '3', type: 'text', content: { headline: '', body: '' } },
    { id: '4', type: 'cta', content: { text: 'Get Started', url: '' } },
  ]);

  const handleSave = () => {
    toast({
      title: 'Template saved',
      description: 'Your page template has been saved successfully.',
    });
    onSave();
  };

  const updatePageData = (key: string, value: string | boolean) => {
    setPageData(prev => ({ ...prev, [key]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Page Information</h3>
              <div className="grid gap-4">
                <div>
                  <Label>Template Name</Label>
                  <Input 
                    value={pageData.name}
                    onChange={(e) => updatePageData('name', e.target.value)}
                    placeholder="My Landing Page"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Page Title</Label>
                  <Input 
                    value={pageData.title}
                    onChange={(e) => updatePageData('title', e.target.value)}
                    placeholder="Welcome to Our Platform"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">This appears in the browser tab</p>
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea 
                    value={pageData.description}
                    onChange={(e) => updatePageData('description', e.target.value)}
                    placeholder="Describe your page for search engines..."
                    className="mt-1.5 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Page URL Slug</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm text-muted-foreground">yourapp.com/p/</span>
                    <Input 
                      value={pageData.url}
                      onChange={(e) => updatePageData('url', e.target.value)}
                      placeholder="my-page"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">SEO Settings</h3>
              <div className="grid gap-4">
                <div>
                  <Label>Favicon URL</Label>
                  <Input 
                    value={pageData.favicon}
                    onChange={(e) => updatePageData('favicon', e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Social Share Image (OG Image)</Label>
                  <Input 
                    value={pageData.ogImage}
                    onChange={(e) => updatePageData('ogImage', e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 1200x630px</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'logos':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Logo & Branding</h3>
            
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">Upload your logo</p>
              <p className="text-xs text-muted-foreground mb-4">PNG, JPG, or SVG (max 2MB)</p>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
            
            <div className="grid gap-4">
              <div>
                <Label>Logo URL</Label>
                <Input 
                  value={pageData.logo}
                  onChange={(e) => updatePageData('logo', e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Alt Text</Label>
                <Input 
                  value={pageData.logoAlt}
                  onChange={(e) => updatePageData('logoAlt', e.target.value)}
                  placeholder="Company Logo"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Video Content</h3>
            
            <div className="grid gap-4">
              <div>
                <Label>Video URL</Label>
                <Input 
                  value={pageData.videoUrl}
                  onChange={(e) => updatePageData('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">Supports YouTube, Vimeo, or direct video URLs</p>
              </div>
              
              <div>
                <Label>Custom Thumbnail</Label>
                <Input 
                  value={pageData.videoThumbnail}
                  onChange={(e) => updatePageData('videoThumbnail', e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Autoplay Video</p>
                  <p className="text-xs text-muted-foreground">Video will start playing automatically (muted)</p>
                </div>
                <Switch 
                  checked={pageData.autoplay}
                  onCheckedChange={(checked) => updatePageData('autoplay', checked)}
                />
              </div>
            </div>
            
            {/* Video preview placeholder */}
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
              <Video className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Text Content</h3>
            
            <div className="grid gap-4">
              <div>
                <Label>Headline</Label>
                <Input 
                  value={pageData.headline}
                  onChange={(e) => updatePageData('headline', e.target.value)}
                  placeholder="Your compelling headline here"
                  className="mt-1.5 text-lg font-semibold"
                />
              </div>
              
              <div>
                <Label>Subheadline</Label>
                <Input 
                  value={pageData.subheadline}
                  onChange={(e) => updatePageData('subheadline', e.target.value)}
                  placeholder="A supporting statement"
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label>Body Content</Label>
                <Textarea 
                  value={pageData.bodyContent}
                  onChange={(e) => updatePageData('bodyContent', e.target.value)}
                  placeholder="Write your main content here. You can use {{firstName}}, {{businessName}} for personalization..."
                  className="mt-1.5 min-h-[200px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available variables: {"{{firstName}}"}, {"{{lastName}}"}, {"{{businessName}}"}, {"{{email}}"}
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'bottom':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Call to Action & Footer</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Primary CTA Button</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Button Text</Label>
                  <Input 
                    value={pageData.ctaText}
                    onChange={(e) => updatePageData('ctaText', e.target.value)}
                    placeholder="Get Started"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Button Link</Label>
                  <Input 
                    value={pageData.ctaUrl}
                    onChange={(e) => updatePageData('ctaUrl', e.target.value)}
                    placeholder="https://calendly.com/..."
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>
            
            <div>
              <Label>Footer Text</Label>
              <Textarea 
                value={pageData.footerText}
                onChange={(e) => updatePageData('footerText', e.target.value)}
                placeholder="© 2024 Your Company. All rights reserved."
                className="mt-1.5 resize-none"
                rows={2}
              />
            </div>
          </div>
        );
      
      case 'chat':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Live Chat Integration</h3>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Live Chat</p>
                <p className="text-xs text-muted-foreground">Show a chat widget on your page</p>
              </div>
              <Switch 
                checked={pageData.enableLiveChat}
                onCheckedChange={(checked) => updatePageData('enableLiveChat', checked)}
              />
            </div>
            
            {pageData.enableLiveChat && (
              <div className="grid gap-4">
                <div>
                  <Label>Chat Provider</Label>
                  <select
                    value={pageData.chatProvider}
                    onChange={(e) => updatePageData('chatProvider', e.target.value)}
                    className="w-full h-10 px-3 mt-1.5 rounded-lg bg-background border border-input text-foreground"
                  >
                    <option value="intercom">Intercom</option>
                    <option value="crisp">Crisp</option>
                    <option value="drift">Drift</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="custom">Custom Script</option>
                  </select>
                </div>
                
                <div>
                  <Label>Widget ID / App ID</Label>
                  <Input 
                    value={pageData.chatId}
                    onChange={(e) => updatePageData('chatId', e.target.value)}
                    placeholder="Your chat widget ID"
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {templateId ? 'Edit Page Template' : 'Create Page Template'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Build a custom landing page for your campaigns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="gradient" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[280px,1fr] gap-6">
        {/* Left Sidebar - Tabs */}
        <div className="space-y-2">
          {[
            { id: 'info', label: 'Info & Template', icon: Settings },
            { id: 'logos', label: 'Logos', icon: Image },
            { id: 'video', label: 'Video', icon: Video },
            { id: 'text', label: 'Text Content', icon: Type },
            { id: 'bottom', label: 'Bottom', icon: Link },
            { id: 'chat', label: 'Live Chat', icon: MessageCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content */}
        <Card className="p-6">
          {previewMode ? (
            <div className="min-h-[600px] bg-muted/30 rounded-xl p-8 flex flex-col items-center justify-center">
              <div className="max-w-2xl w-full text-center space-y-6">
                {pageData.logo && (
                  <img src={pageData.logo} alt={pageData.logoAlt || 'Logo'} className="h-12 mx-auto" />
                )}
                <h1 className="text-3xl font-bold text-foreground">
                  {pageData.headline || 'Your Headline Here'}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {pageData.subheadline || 'Your subheadline goes here'}
                </p>
                <div className="prose max-w-none text-muted-foreground">
                  {pageData.bodyContent || 'Your body content will appear here...'}
                </div>
                <Button size="lg" variant="gradient">
                  {pageData.ctaText || 'Get Started'}
                </Button>
                {pageData.footerText && (
                  <p className="text-sm text-muted-foreground mt-8">
                    {pageData.footerText}
                  </p>
                )}
              </div>
            </div>
          ) : (
            renderTabContent()
          )}
        </Card>
      </div>
    </div>
  );
}
