import { useState, useCallback } from 'react';
import {
  FileText, 
  Mail, 
  Clock, 
  Quote, 
  Image, 
  Globe,
  Plus,
  Search,
  Filter,
  Star,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Play,
  Check,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTemplates } from '@/hooks/useTemplates';
import { useCampaignTemplates, CampaignTemplate } from '@/hooks/useCampaignTemplates';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PageTemplateBuilder } from './PageTemplateBuilder';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { SequenceBuilder, type SequenceStep } from './SequenceBuilder';
import type { Tables } from '@/integrations/supabase/types';

interface TemplatesLibraryPageProps {
  onSelectTemplate?: (templateId: string) => void;
}

// Category options for campaign templates
const campaignCategories = ['All', 'Sales', 'Marketing', 'Recruiting'];

// Sample schedule templates
const scheduleTemplates = [
  { id: '1', name: 'Weekdays Only', description: 'Mon-Fri, 9 AM - 5 PM', timezone: 'America/New_York' },
  { id: '2', name: 'Business Hours', description: 'Mon-Fri, 8 AM - 6 PM', timezone: 'UTC' },
  { id: '3', name: 'Follow the Sun', description: '24/7 across all timezones', timezone: 'Auto' },
];

// Sample snippet templates
const snippetTemplates = [
  { id: '1', name: 'Value Proposition', content: 'Our solution helps companies like {{businessName}} increase revenue by 30%...', category: 'Sales' },
  { id: '2', name: 'Social Proof', content: 'Companies like Google, Amazon, and Meta use our platform...', category: 'Marketing' },
  { id: '3', name: 'CTA - Meeting', content: 'Would you be open to a 15-minute call next week?', category: 'Sales' },
];

export function TemplatesLibraryPage({ onSelectTemplate }: TemplatesLibraryPageProps) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPageBuilder, setShowPageBuilder] = useState(false);
  const [selectedPageTemplate, setSelectedPageTemplate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { templates: emailTemplates, isLoading: templatesLoading, deleteTemplate, createTemplate, updateTemplate } = useTemplates();
  const { 
    templates: campaignTemplates, 
    isLoading: campaignTemplatesLoading, 
    createTemplate: createCampaignTemplate,
    updateTemplate: updateCampaignTemplate,
    deleteTemplate: deleteCampaignTemplate 
  } = useCampaignTemplates();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Email template editor modal state
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{
    id?: string;
    name: string;
    subject: string;
    content: string;
    type: string;
  } | null>(null);

  // Campaign template editor modal state
  const [showCampaignEditor, setShowCampaignEditor] = useState(false);
  const [editingCampaignTemplate, setEditingCampaignTemplate] = useState<{
    id?: string;
    name: string;
    description: string;
    category: string;
    steps: number;
    featured: boolean;
    sequence_data: SequenceStep[];
  } | null>(null);

  // Template preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Tables<'templates'> | null>(null);

  const handlePreviewTemplate = (template: Tables<'templates'>) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = (templateId: string, templateName: string) => {
    onSelectTemplate?.(templateId);
    toast({ 
      title: 'Template selected', 
      description: `"${templateName}" will be used for your campaign` 
    });
  };

  const handleDuplicateTemplate = async (template: typeof emailTemplates[0]) => {
    createTemplate.mutate({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      content: template.content,
      type: template.type,
    });
  };

  const handleEditTemplate = (template: typeof emailTemplates[0]) => {
    setEditingTemplate({
      id: template.id,
      name: template.name,
      subject: template.subject || '',
      content: template.content,
      type: template.type,
    });
    setShowEditor(true);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate({
      name: '',
      subject: '',
      content: '',
      type: 'email',
    });
    setShowEditor(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (editingTemplate.id) {
      updateTemplate.mutate({
        id: editingTemplate.id,
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        content: editingTemplate.content,
        type: editingTemplate.type,
      });
    } else {
      createTemplate.mutate({
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        content: editingTemplate.content,
        type: editingTemplate.type,
      });
    }
    setShowEditor(false);
    setEditingTemplate(null);
  };

  // Campaign template handlers
  const handleCreateCampaignTemplate = () => {
    setEditingCampaignTemplate({
      name: '',
      description: '',
      category: 'Sales',
      steps: 1,
      featured: false,
      sequence_data: [],
    });
    setShowCampaignEditor(true);
  };

  const handleEditCampaignTemplate = (template: CampaignTemplate) => {
    const seqData = Array.isArray(template.sequence_data) ? template.sequence_data as SequenceStep[] : [];
    setEditingCampaignTemplate({
      id: template.id,
      name: template.name,
      description: template.description || '',
      category: template.category || 'Sales',
      steps: template.steps || 1,
      featured: template.featured || false,
      sequence_data: seqData,
    });
    setShowCampaignEditor(true);
  };

  const handleDuplicateCampaignTemplate = (template: CampaignTemplate) => {
    createCampaignTemplate.mutate({
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      steps: template.steps,
      sequence_data: template.sequence_data,
      featured: false,
    });
  };

  const handleSaveCampaignTemplate = () => {
    if (!editingCampaignTemplate) return;

    const sequenceData = editingCampaignTemplate.sequence_data;
    const stepCount = sequenceData.length || editingCampaignTemplate.steps;

    if (editingCampaignTemplate.id) {
      updateCampaignTemplate.mutate({
        id: editingCampaignTemplate.id,
        name: editingCampaignTemplate.name,
        description: editingCampaignTemplate.description,
        category: editingCampaignTemplate.category,
        steps: stepCount,
        featured: editingCampaignTemplate.featured,
        sequence_data: sequenceData,
      });
    } else {
      createCampaignTemplate.mutate({
        name: editingCampaignTemplate.name,
        description: editingCampaignTemplate.description,
        category: editingCampaignTemplate.category,
        steps: stepCount,
        featured: editingCampaignTemplate.featured,
        sequence_data: sequenceData,
      });
    }
    setShowCampaignEditor(false);
    setEditingCampaignTemplate(null);
  };

  // Filter campaign templates by category
  const filteredCampaignTemplates = campaignTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopySnippet = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied!', description: `"${name}" copied to clipboard` });
  };

  if (showPageBuilder) {
    return (
      <PageTemplateBuilder 
        templateId={selectedPageTemplate}
        onBack={() => {
          setShowPageBuilder(false);
          setSelectedPageTemplate(null);
        }}
        onSave={() => {
          setShowPageBuilder(false);
          setSelectedPageTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage your campaign, email, and page templates
          </p>
        </div>
        <Button 
          variant="gradient" 
          onClick={() => {
            if (activeTab === 'pages') {
              setShowPageBuilder(true);
            } else if (activeTab === 'emails') {
              handleCreateTemplate();
            } else if (activeTab === 'campaigns') {
              handleCreateCampaignTemplate();
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Campaigns
            {campaignTemplates.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {campaignTemplates.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="snippets" className="flex items-center gap-2">
            <Quote className="w-4 h-4" />
            Snippets
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Pages
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Campaign Templates */}
        <TabsContent value="campaigns" className="space-y-6">
          {authLoading || campaignTemplatesLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading campaign templates...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">Login Required</h3>
              <p className="text-sm text-muted-foreground mb-4">Please log in to view and manage your campaign templates.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                {campaignCategories.map(category => (
                  <Badge 
                    key={category}
                    variant={selectedCategory === category ? "secondary" : "outline"} 
                    className="px-3 py-1 cursor-pointer hover:bg-secondary"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              
              {filteredCampaignTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold text-foreground mb-2">No campaign templates yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first campaign template to get started.</p>
                  <Button variant="gradient" onClick={handleCreateCampaignTemplate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign Template
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCampaignTemplates.map(template => (
                    <Card key={template.id} className="hover:border-primary/50 transition-all cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {template.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUseTemplate(template.id, template.name)}>
                                <Play className="w-4 h-4 mr-2" />
                                Use Template
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateCampaignTemplate(template)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCampaignTemplate(template)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteCampaignTemplate.mutate(template.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{template.steps} steps</span>
                          <Button 
                            size="sm" 
                            variant="gradient"
                            onClick={() => handleUseTemplate(template.id, template.name)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="emails" className="space-y-6">
          {authLoading || templatesLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">Login Required</h3>
              <p className="text-sm text-muted-foreground mb-4">Please log in to view and manage your email templates.</p>
            </div>
          ) : emailTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">No email templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first email template to get started.</p>
              <Button variant="gradient" onClick={handleCreateTemplate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Email Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emailTemplates.map(template => (
                <Card key={template.id} className="hover:border-primary/50 transition-all cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUseTemplate(template.id, template.name)}>
                            <Play className="w-4 h-4 mr-2" />
                            Use Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteTemplate.mutate(template.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {template.subject}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {template.type}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="gradient"
                        onClick={() => handleUseTemplate(template.id, template.name)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Schedule Templates */}
        <TabsContent value="schedules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduleTemplates.map(template => (
              <Card key={template.id} className="hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="w-4 h-4 mr-2" />
                          Use Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {template.timezone}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Play className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed hover:border-primary/50 transition-all cursor-pointer">
              <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[180px]">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Create Schedule</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Snippet Templates */}
        <TabsContent value="snippets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {snippetTemplates.map(template => (
              <Card key={template.id} className="hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopySnippet(template.content, template.name)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-3 rounded-lg">
                    {template.content}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopySnippet(template.content, template.name)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Images */}
        <TabsContent value="images" className="space-y-6">
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">Upload Images</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop images here or click to browse
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          </div>
        </TabsContent>

        {/* Pages */}
        <TabsContent value="pages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
              className="border-dashed hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => setShowPageBuilder(true)}
            >
              <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Create New Page</p>
                <p className="text-xs text-muted-foreground mt-1">Build a custom landing page</p>
              </CardContent>
            </Card>
            
            {/* AI Page Builder Card */}
            <Card className="hover:border-primary/50 transition-all cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <Badge className="bg-primary/20 text-primary border-0">AI</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">AI Page Builder</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Let AI create a personalized landing page based on your campaign goals.
                </p>
                <Button size="sm" variant="gradient">
                  Generate with AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Editor Modal */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Create or modify your email template with personalization variables.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Welcome Email"
                value={editingTemplate?.name || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject Line</Label>
              <Input
                id="template-subject"
                placeholder="e.g., Hi {{firstName}}, let's connect!"
                value={editingTemplate?.subject || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content">Email Content</Label>
              <Textarea
                id="template-content"
                placeholder="Hi {{firstName}},&#10;&#10;I noticed your work at {{businessName}}..."
                className="min-h-[200px] font-mono"
                value={editingTemplate?.content || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Variables:</span>
              {['{{firstName}}', '{{lastName}}', '{{businessName}}', '{{email}}'].map(v => (
                <Badge 
                  key={v} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => setEditingTemplate(prev => prev ? { 
                    ...prev, 
                    content: prev.content + v 
                  } : null)}
                >
                  {v}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleSaveTemplate}
              disabled={!editingTemplate?.name || !editingTemplate?.content}
            >
              <Check className="w-4 h-4 mr-2" />
              {editingTemplate?.id ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        template={previewTemplate}
        onUseTemplate={(templateId) => {
          const template = emailTemplates.find(t => t.id === templateId);
          if (template) {
            handleUseTemplate(templateId, template.name);
          }
        }}
      />

      {/* Campaign Template Editor Modal */}
      <Dialog open={showCampaignEditor} onOpenChange={setShowCampaignEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaignTemplate?.id ? 'Edit Campaign Template' : 'Create Campaign Template'}
            </DialogTitle>
            <DialogDescription>
              Define a reusable campaign sequence with drag-and-drop steps.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Template Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Cold Outreach Sequence"
                  value={editingCampaignTemplate?.name || ''}
                  onChange={(e) => setEditingCampaignTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-category">Category</Label>
                <select
                  id="campaign-category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editingCampaignTemplate?.category || 'Sales'}
                  onChange={(e) => setEditingCampaignTemplate(prev => prev ? { ...prev, category: e.target.value } : null)}
                >
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Recruiting">Recruiting</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea
                id="campaign-description"
                placeholder="Brief description of when to use this template..."
                rows={2}
                value={editingCampaignTemplate?.description || ''}
                onChange={(e) => setEditingCampaignTemplate(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="campaign-featured"
                checked={editingCampaignTemplate?.featured || false}
                onChange={(e) => setEditingCampaignTemplate(prev => prev ? { ...prev, featured: e.target.checked } : null)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="campaign-featured" className="text-sm font-normal">
                Mark as featured template
              </Label>
            </div>

            {/* Sequence Builder */}
            <div className="border-t border-border pt-4">
              <SequenceBuilder
                steps={editingCampaignTemplate?.sequence_data || []}
                onChange={(newSteps) =>
                  setEditingCampaignTemplate(prev =>
                    prev ? { ...prev, sequence_data: newSteps, steps: newSteps.length || prev.steps } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignEditor(false)}>
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleSaveCampaignTemplate}
              disabled={!editingCampaignTemplate?.name}
            >
              <Check className="w-4 h-4 mr-2" />
              {editingCampaignTemplate?.id ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
