import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ContactsPage } from '@/components/contacts/ContactsPage';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { CampaignBuilder } from '@/components/campaigns/CampaignBuilder';
import { N8nWorkflow } from '@/components/n8n/N8nWorkflow';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useTemplates } from '@/hooks/useTemplates';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Loader2, LogOut, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const { contacts, createManyContacts } = useContacts();
  const { templates, createTemplate, updateTemplate } = useTemplates();
  const { campaigns, createCampaign } = useCampaigns();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleUploadContacts = (newContacts: any[]) => {
    const formattedContacts = newContacts.map(c => ({
      first_name: c.firstName,
      last_name: c.lastName,
      business_name: c.businessName,
      email: c.email,
      phone: c.phone,
      instagram: c.instagram,
      tiktok: c.tiktok,
      status: 'pending' as const,
    }));
    createManyContacts.mutate(formattedContacts);
  };

  const handleSaveTemplate = (template: any) => {
    const templateData = {
      name: template.name,
      type: template.type,
      subject: template.subject,
      content: template.body,
    };
    
    if (template.id && templates.find(t => t.id === template.id)) {
      updateTemplate.mutate({ id: template.id, ...templateData });
    } else {
      createTemplate.mutate(templateData);
    }
  };

  const handleCreateCampaign = (campaign: any) => {
    createCampaign.mutate({
      campaign: {
        name: campaign.name,
        status: campaign.scheduledAt ? 'scheduled' : 'draft',
        scheduled_at: campaign.scheduledAt?.toISOString(),
        template_id: campaign.templates?.email?.id,
      },
      contactIds: campaign.contacts.map((c: any) => c.id),
    });
  };

  // Convert DB contacts to UI format
  const uiContacts = contacts.map(c => ({
    id: c.id,
    firstName: c.first_name || '',
    lastName: c.last_name || '',
    businessName: c.business_name || '',
    email: c.email || '',
    phone: c.phone,
    instagram: c.instagram,
    tiktok: c.tiktok,
    status: (c.status || 'pending') as 'pending' | 'sent' | 'failed',
    emailSent: c.email_sent,
    dmSent: c.dm_sent,
    voicemailSent: c.voicemail_sent,
    createdAt: new Date(c.created_at),
  }));

  const uiTemplates = templates.map(t => ({
    id: t.id,
    name: t.name,
    type: t.type as 'email' | 'instagram' | 'tiktok' | 'voicemail',
    subject: t.subject,
    body: t.content,
    createdAt: new Date(t.created_at),
  }));

  const stats = {
    totalContacts: contacts.length,
    emailsSent: contacts.filter(c => c.email_sent).length,
    dmsSent: contacts.filter(c => c.dm_sent).length,
    pending: contacts.filter(c => c.status === 'pending').length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} activities={[]} />;
      case 'contacts':
        return <ContactsPage contacts={uiContacts} onUpload={handleUploadContacts} />;
      case 'templates':
        return <TemplateEditor templates={uiTemplates} onSave={handleSaveTemplate} />;
      case 'campaigns':
        return (
          <CampaignBuilder 
            contacts={uiContacts} 
            templates={uiTemplates} 
            campaigns={[]}
            onCreateCampaign={handleCreateCampaign}
          />
        );
      case 'n8n':
        return <N8nWorkflow />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard stats={stats} activities={[]} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-8 overflow-auto relative">
        {/* Top bar */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/docs')}>
            <Book className="w-4 h-4 mr-2" />
            Docs
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="max-w-7xl mx-auto pt-8">
          {renderContent()}
        </div>
      </main>

      <Toaster />
    </div>
  );
};

export default Index;
