import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ContactsPage } from '@/components/contacts/ContactsPage';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { CampaignBuilder } from '@/components/campaigns/CampaignBuilder';
import { N8nWorkflow } from '@/components/n8n/N8nWorkflow';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { Contact, Template, Campaign, ActivityLog } from '@/types/contact';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const handleUploadContacts = (newContacts: Contact[]) => {
    setContacts(prev => [...prev, ...newContacts]);
    
    // Add activity log
    setActivities(prev => [{
      id: crypto.randomUUID(),
      type: 'email',
      contactName: 'System',
      status: 'success',
      message: `Imported ${newContacts.length} contacts`,
      timestamp: new Date(),
    }, ...prev]);
  };

  const handleSaveTemplate = (template: Template) => {
    setTemplates(prev => {
      const existing = prev.findIndex(t => t.id === template.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = template;
        return updated;
      }
      return [...prev, template];
    });
  };

  const handleCreateCampaign = (campaign: Campaign) => {
    setCampaigns(prev => [...prev, campaign]);
    
    setActivities(prev => [{
      id: crypto.randomUUID(),
      type: 'email',
      contactName: 'System',
      status: 'success',
      message: `Campaign "${campaign.name}" created with ${campaign.stats.total} contacts`,
      timestamp: new Date(),
    }, ...prev]);
  };

  const stats = {
    totalContacts: contacts.length,
    emailsSent: contacts.filter(c => c.emailSent).length,
    dmsSent: contacts.filter(c => c.dmSent).length,
    pending: contacts.filter(c => c.status === 'pending').length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} activities={activities} />;
      case 'contacts':
        return <ContactsPage contacts={contacts} onUpload={handleUploadContacts} />;
      case 'templates':
        return <TemplateEditor templates={templates} onSave={handleSaveTemplate} />;
      case 'campaigns':
        return (
          <CampaignBuilder 
            contacts={contacts} 
            templates={templates} 
            campaigns={campaigns}
            onCreateCampaign={handleCreateCampaign}
          />
        );
      case 'n8n':
        return <N8nWorkflow />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard stats={stats} activities={activities} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto relative">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <Toaster />
    </div>
  );
};

export default Index;
