import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Play, Mail, MessageCircle, Phone, CheckCircle, Eye } from 'lucide-react';
import { Template, Campaign } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { EmailPreview } from './EmailPreview';
import { ContactFilter } from './ContactFilter';
import { ABTestingConfig } from './ABTestingConfig';
import { TimezoneScheduler } from './TimezoneScheduler';
import { usePageTracking } from '@/hooks/usePageTracking';
import type { Tables } from '@/integrations/supabase/types';

type Contact = Tables<'contacts'>;

interface CampaignBuilderProps {
  contacts: Contact[];
  templates: Template[];
  campaigns: Campaign[];
  onCreateCampaign: (campaign: Campaign & { abTesting?: { enabled: boolean; variantA: { subject: string; content: string }; variantB: { subject: string; content: string } } }) => void;
}

export function CampaignBuilder({ contacts, templates, campaigns, onCreateCampaign }: CampaignBuilderProps) {
  const [campaignName, setCampaignName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, string>>({});
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  
  // A/B Testing state
  const [abTestingEnabled, setAbTestingEnabled] = useState(false);
  const [variantA, setVariantA] = useState({ subject: '', content: '' });
  const [variantB, setVariantB] = useState({ subject: '', content: '' });

  // Timezone scheduling state
  const [useRecipientTimezone, setUseRecipientTimezone] = useState(false);
  const [optimalSendHour, setOptimalSendHour] = useState(9);

  usePageTracking('campaign-builder');

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
    
    let scheduledAt: Date | undefined;
    if (scheduleDate) {
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      scheduledAt = new Date(scheduleDate);
      scheduledAt.setHours(hours, minutes, 0, 0);
    }

    // Convert DB contacts to Campaign format
    const campaignContacts = selectedContactObjects.map(c => ({
      id: c.id,
      firstName: c.first_name || '',
      lastName: c.last_name || '',
      businessName: c.business_name || '',
      email: c.email || '',
      phone: c.phone || undefined,
      instagram: c.instagram || undefined,
      tiktok: c.tiktok || undefined,
      linkedin: c.linkedin || undefined,
      location: c.location || undefined,
      jobTitle: c.job_title || undefined,
      city: c.city || undefined,
      state: c.state || undefined,
      country: c.country || undefined,
      status: (c.status || 'pending') as 'pending' | 'sent' | 'failed',
      emailSent: c.email_sent || false,
      dmSent: c.dm_sent || false,
      voicemailSent: c.voicemail_sent || false,
      createdAt: new Date(c.created_at),
    }));

    const campaign = {
      id: crypto.randomUUID(),
      name: campaignName || `Campaign ${campaigns.length + 1}`,
      contacts: campaignContacts,
      templates: {
        email: templates.find(t => t.type === 'email' && selectedTemplates.email === t.id),
        instagram: templates.find(t => t.type === 'instagram' && selectedTemplates.instagram === t.id),
        tiktok: templates.find(t => t.type === 'tiktok' && selectedTemplates.tiktok === t.id),
        voicemail: templates.find(t => t.type === 'voicemail' && selectedTemplates.voicemail === t.id),
      },
      scheduledAt,
      status: (scheduleDate ? 'scheduled' : 'draft') as 'draft' | 'scheduled' | 'running' | 'completed',
      stats: {
        total: campaignContacts.length,
        sent: 0,
        failed: 0,
      },
      createdAt: new Date(),
      abTesting: abTestingEnabled ? {
        enabled: true,
        variantA,
        variantB,
      } : undefined,
      useRecipientTimezone,
      optimalSendHour,
    };

    onCreateCampaign(campaign);
    setCampaignName('');
    setSelectedContacts([]);
    setSelectedTemplates({});
    setScheduleDate(undefined);
    setScheduleTime('09:00');
    setAbTestingEnabled(false);
    setVariantA({ subject: '', content: '' });
    setVariantB({ subject: '', content: '' });
    setUseRecipientTimezone(false);
    setOptimalSendHour(9);
  };

  const templatesByType = {
    email: templates.filter(t => t.type === 'email'),
    instagram: templates.filter(t => t.type === 'instagram'),
    tiktok: templates.filter(t => t.type === 'tiktok'),
    voicemail: templates.filter(t => t.type === 'voicemail'),
  };

  const selectedEmailTemplate = templates.find(t => t.type === 'email' && selectedTemplates.email === t.id);
  const selectedContactObjects = contacts.filter(c => selectedContacts.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Build and schedule outreach campaigns</p>
        </div>
        {selectedEmailTemplate && selectedContacts.length > 0 && (
          <Button variant="outline" onClick={() => setShowEmailPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview Email
          </Button>
        )}
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

          {/* Contact Selection with Filtering */}
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
              <>
                <ContactFilter
                  contacts={contacts}
                  selectedIds={selectedContacts}
                  onFilteredContactsChange={setSelectedContacts}
                />
                
                <div className="max-h-64 overflow-y-auto space-y-2 mt-4">
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
                          {contact.first_name} {contact.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                        {(contact.job_title || contact.city) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {[contact.job_title, contact.city].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {contact.email && <Mail className="w-4 h-4 text-primary" />}
                        {contact.instagram && <MessageCircle className="w-4 h-4 text-pink-500" />}
                        {contact.phone && <Phone className="w-4 h-4 text-success" />}
                      </div>
                    </div>
                  ))}
                </div>
              </>
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

            {/* Quick Preview Button */}
            {selectedEmailTemplate && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEmailPreview(true)}
                  disabled={selectedContacts.length === 0}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview "{selectedEmailTemplate.name}"
                </Button>
              </div>
            )}
          </div>

          {/* A/B Testing Configuration */}
          <ABTestingConfig
            enabled={abTestingEnabled}
            onEnabledChange={setAbTestingEnabled}
            variantA={variantA}
            variantB={variantB}
            onVariantAChange={setVariantA}
            onVariantBChange={setVariantB}
          />

          {/* Timezone Scheduler */}
          <TimezoneScheduler
            useRecipientTimezone={useRecipientTimezone}
            onUseRecipientTimezoneChange={setUseRecipientTimezone}
            optimalSendHour={optimalSendHour}
            onOptimalSendHourChange={setOptimalSendHour}
            contactCount={selectedContacts.length}
          />
        </div>

        {/* Schedule & Launch */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-4">Schedule</h3>
            
            <div className="space-y-4">
              {/* Date Picker */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
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

              {/* Quick Schedule Options */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Quick schedule:</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setScheduleDate(tomorrow);
                      setScheduleTime('09:00');
                    }}
                  >
                    Tomorrow 9 AM
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      setScheduleDate(nextWeek);
                      setScheduleTime('09:00');
                    }}
                  >
                    Next Week
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setScheduleDate(undefined);
                      setScheduleTime('09:00');
                    }}
                  >
                    Clear
                  </Button>
                </div>
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
                  {scheduleDate 
                    ? `${format(scheduleDate, 'MMM d, yyyy')} at ${scheduleTime}`
                    : 'Immediate'}
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

      {/* Email Preview Dialog */}
      <EmailPreview
        open={showEmailPreview}
        onOpenChange={setShowEmailPreview}
        template={selectedEmailTemplate}
        contacts={selectedContactObjects.length > 0 ? selectedContactObjects : contacts.slice(0, 5)}
      />
    </div>
  );
}
