import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, List, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignList } from './CampaignList';
import { CampaignCalendar } from './CampaignCalendar';
import { CampaignCreationModal } from './CampaignCreationModal';
import { CampaignWizard } from './CampaignWizard';
import { CampaignDetails } from './CampaignDetails';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCampaigns } from '@/hooks/useCampaigns';
import { usePageTracking } from '@/hooks/usePageTracking';
import type { Tables } from '@/integrations/supabase/types';

type Contact = Tables<'contacts'>;
type Template = { id: string; name: string; type: string; subject?: string; body: string };

interface CampaignsPageProps {
  contacts: Contact[];
  templates: Template[];
}

type ViewMode = 'list' | 'calendar';
type CreationMode = 'select' | 'ai' | 'manual' | null;

export function CampaignsPage({ contacts, templates }: CampaignsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [creationMode, setCreationMode] = useState<CreationMode>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { campaigns, createCampaign, launchCampaign, deleteCampaign } = useCampaigns();
  
  usePageTracking('campaigns');

  const handleCreateComplete = (data: any) => {
    createCampaign.mutate({
      campaign: {
        name: data.companyName ? `${data.companyName} Campaign` : 'New Campaign',
        status: 'draft',
        template_id: data.selectedTemplate,
        use_recipient_timezone: false,
      },
      contactIds: data.selectedContacts,
    });
    setCreationMode(null);
    setShowCreateDialog(false);
  };

  const handleBrowseTemplates = () => {
    setShowCreateDialog(false);
    // Navigate to templates - this would be handled by parent
  };

  if (selectedCampaignId) {
    return (
      <CampaignDetails 
        campaignId={selectedCampaignId} 
        onBack={() => setSelectedCampaignId(null)} 
      />
    );
  }

  if (creationMode === 'ai' || creationMode === 'manual') {
    return (
      <CampaignWizard
        mode={creationMode}
        contacts={contacts}
        templates={templates}
        onComplete={handleCreateComplete}
        onBack={() => setCreationMode(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and schedule your outreach campaigns
          </p>
        </div>
        <Button variant="gradient" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create campaign
        </Button>
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <CampaignList
            campaigns={campaigns}
            onViewCampaign={(id) => setSelectedCampaignId(id)}
            onLaunchCampaign={(id) => launchCampaign.mutate(id)}
            onDeleteCampaign={(id) => deleteCampaign.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <CampaignCalendar
            campaigns={campaigns}
            onViewCampaign={(id) => setSelectedCampaignId(id)}
          />
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Create Campaign</DialogTitle>
          </DialogHeader>
          <CampaignCreationModal 
            onSelectMode={(mode) => {
              setCreationMode(mode);
              setShowCreateDialog(false);
            }}
            onBrowseTemplates={handleBrowseTemplates}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
