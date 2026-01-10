import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTemplates } from '@/hooks/useTemplates';
import { PageTemplateBuilder } from './PageTemplateBuilder';

interface TemplatesLibraryPageProps {
  onSelectTemplate?: (templateId: string) => void;
}

// Sample campaign templates
const campaignTemplates = [
  { 
    id: '1', 
    name: 'Cold Outreach - SaaS', 
    description: 'Multi-step sequence for B2B SaaS companies',
    steps: 5,
    category: 'Sales',
    featured: true 
  },
  { 
    id: '2', 
    name: 'Link Building Outreach', 
    description: 'Perfect for SEO and content marketing teams',
    steps: 3,
    category: 'Marketing',
    featured: false 
  },
  { 
    id: '3', 
    name: 'Influencer Outreach', 
    description: 'Connect with influencers for brand collaborations',
    steps: 4,
    category: 'Marketing',
    featured: true 
  },
  { 
    id: '4', 
    name: 'Product Launch', 
    description: 'Announce your new product to prospects',
    steps: 6,
    category: 'Sales',
    featured: false 
  },
];

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
  const { templates: emailTemplates, deleteTemplate } = useTemplates();

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
            <Badge variant="secondary" className="ml-1 text-xs">
              +100
            </Badge>
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
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="px-3 py-1">All</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-secondary">Sales</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-secondary">Marketing</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-secondary">Recruiting</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignTemplates.map(template => (
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
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
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
                      variant="outline"
                      onClick={() => onSelectTemplate?.(template.id)}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="emails" className="space-y-6">
          {emailTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">No email templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first email template to get started.</p>
              <Button variant="gradient">
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
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
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
                    <Badge variant="secondary" className="text-xs">
                      {template.type}
                    </Badge>
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
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {template.timezone}
                  </Badge>
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
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
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
    </div>
  );
}
