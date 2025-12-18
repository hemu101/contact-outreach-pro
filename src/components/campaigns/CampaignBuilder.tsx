import { useState } from 'react';
import { Calendar, Clock, Play, Pause, Mail, MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { Contact, Template, Campaign } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CampaignBuilderProps {
  contacts: Contact[];
  templates: Template[];
  campaigns: Campaign[];
  onCreateCampaign: (campaign: Campaign) => void;
}

export function CampaignBuilder({ contacts, templates, campaigns, onCreateCampaign }: CampaignBuilderProps) {
  const [campaignName, setCampaignName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, string>>({});
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleToggleContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    const selectedContactObjects = contacts.filter(c => selectedContacts.includes(c.id));
    
    const campaign: Campaign = {
      id: crypto.randomUUID(),
      name: campaignName || `Campaign ${campaigns.length + 1}`,
      contacts: selectedContactObjects,
      templates: {
        email: templates.find(t => t.type === 'email' && selectedTemplates.email === t.id),
        instagram: templates.find(t => t.type === 'instagram' && selectedTemplates.instagram === t.id),
        tiktok: templates.find(t => t.type === 'tiktok' && selectedTemplates.tiktok === t.id),
        voicemail: templates.find(t => t.type === 'voicemail' && selectedTemplates.voicemail === t.id),
      },
      scheduledAt: scheduleDate && scheduleTime 
        ? new Date(`${scheduleDate}T${scheduleTime}`)
        : undefined,
      status: scheduleDate ? 'scheduled' : 'draft',
      stats: {
        total: selectedContactObjects.length,
        sent: 0,
        failed: 0,
      },
      createdAt: new Date(),
    };

    onCreateCampaign(campaign);
    setCampaignName('');
    setSelectedContacts([]);
    setSelectedTemplates({});
    setScheduleDate('');
    setScheduleTime('');
  };

  const templatesByType = {
    email: templates.filter(t => t.type === 'email'),
    instagram: templates.filter(t => t.type === 'instagram'),
    tiktok: templates.filter(t => t.type === 'tiktok'),
    voicemail: templates.filter(t => t.type === 'voicemail'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Build and schedule outreach campaigns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Name */}
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-4">Campaign Details</h3>
            <Input
              placeholder="Campaign name (e.g., Q1 Outreach)"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          {/* Contact Selection */}
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Select Contacts ({selectedContacts.length} / {contacts.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={handleSelectAllContacts}>
                {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            {contacts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Upload contacts first to create a campaign
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleToggleContact(contact.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedContacts.includes(contact.id)
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center",
                      selectedContacts.includes(contact.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}>
                      {selectedContacts.includes(contact.id) && (
                        <CheckCircle className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {contact.email && <Mail className="w-4 h-4 text-primary" />}
                      {contact.instagram && <MessageCircle className="w-4 h-4 text-pink-500" />}
                      {contact.phone && <Phone className="w-4 h-4 text-success" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-4">Select Templates</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(templatesByType).map(([type, typeTemplates]) => (
                <div key={type}>
                  <label className="text-sm text-muted-foreground mb-2 block capitalize">
                    {type} Template
                  </label>
                  <select
                    value={selectedTemplates[type] || ''}
                    onChange={(e) => setSelectedTemplates(prev => ({ ...prev, [type]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
                  >
                    <option value="">None</option>
                    {typeTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule & Launch */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-4">Schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contacts</span>
                <span className="text-foreground font-medium">{selectedContacts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Templates</span>
                <span className="text-foreground font-medium">
                  {Object.values(selectedTemplates).filter(Boolean).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schedule</span>
                <span className="text-foreground font-medium">
                  {scheduleDate ? `${scheduleDate} ${scheduleTime}` : 'Immediate'}
                </span>
              </div>
            </div>

            <Button 
              variant="gradient" 
              className="w-full mt-6"
              onClick={handleLaunch}
              disabled={selectedContacts.length === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              {scheduleDate ? 'Schedule Campaign' : 'Launch Now'}
            </Button>
          </div>

          {/* Existing Campaigns */}
          {campaigns.length > 0 && (
            <div className="glass-card rounded-xl p-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Campaigns</h3>
              <div className="space-y-3">
                {campaigns.slice(0, 3).map((campaign) => (
                  <div 
                    key={campaign.id}
                    className="p-3 rounded-lg bg-secondary/50"
                  >
                    <p className="font-medium text-foreground">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.stats.sent}/{campaign.stats.total} sent • {campaign.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
