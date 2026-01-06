import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, CheckCircle, XCircle, Clock, Eye, MousePointer, RefreshCw, Settings2, FlaskConical, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { RealTimeMonitor } from './RealTimeMonitor';
import { FollowUpConfig } from './FollowUpConfig';
import { EmailQueue } from './EmailQueue';
import { ABTestingResults } from './ABTestingResults';
interface CampaignContact {
  id: string;
  status: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  contacts: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    business_name: string | null;
  } | null;
}

interface CampaignData {
  id: string;
  name: string;
  status: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  total_contacts: number | null;
  sent_count: number | null;
  open_count: number | null;
  click_count: number | null;
  ab_testing_enabled: boolean | null;
  variant_a_subject: string | null;
  variant_a_content: string | null;
  variant_a_sent: number | null;
  variant_a_opens: number | null;
  variant_a_clicks: number | null;
  variant_b_subject: string | null;
  variant_b_content: string | null;
  variant_b_sent: number | null;
  variant_b_opens: number | null;
  variant_b_clicks: number | null;
  use_recipient_timezone: boolean | null;
  optimal_send_hour: number | null;
  templates: {
    name: string;
    subject: string | null;
  } | null;
}

interface CampaignDetailsProps {
  campaignId: string;
  onBack: () => void;
}

export function CampaignDetails({ campaignId, onBack }: CampaignDetailsProps) {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaignData = async () => {
    setRefreshing(true);
    try {
      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*, templates(name, subject)')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Fetch campaign contacts with contact details
      const { data: contactsData, error: contactsError } = await supabase
        .from('campaign_contacts')
        .select('*, contacts(id, first_name, last_name, email, business_name)')
        .eq('campaign_id', campaignId)
        .order('sent_at', { ascending: false, nullsFirst: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Campaign not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const stats = {
    total: campaign.total_contacts || contacts.length,
    sent: campaign.sent_count || contacts.filter(c => c.status === 'sent').length,
    opened: campaign.open_count || contacts.filter(c => c.opened_at).length,
    clicked: campaign.click_count || contacts.filter(c => c.clicked_at).length,
    failed: contacts.filter(c => c.status === 'failed').length,
    pending: contacts.filter(c => c.status === 'pending').length,
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0';
  const clickRate = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : '0';

  const getStatusBadge = (contact: CampaignContact) => {
    if (contact.clicked_at) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-0">Clicked</Badge>;
    }
    if (contact.opened_at) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-0">Opened</Badge>;
    }
    if (contact.status === 'sent') {
      return <Badge className="bg-success/20 text-success border-0">Sent</Badge>;
    }
    if (contact.status === 'failed') {
      return <Badge variant="destructive">{contact.error_message?.slice(0, 30) || 'Failed'}</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
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
            <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
            <p className="text-sm text-muted-foreground">
              {campaign.templates?.name && `Template: ${campaign.templates.name}`}
              {campaign.started_at && ` • Started: ${format(new Date(campaign.started_at), 'PPp')}`}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchCampaignData} disabled={refreshing}>
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <Mail className="w-6 h-6 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto text-success mb-2" />
          <p className="text-2xl font-bold text-success">{stats.sent}</p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Eye className="w-6 h-6 mx-auto text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-blue-400">{stats.opened}</p>
          <p className="text-xs text-muted-foreground">{openRate}% Opened</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <MousePointer className="w-6 h-6 mx-auto text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-purple-400">{stats.clicked}</p>
          <p className="text-xs text-muted-foreground">{clickRate}% Clicked</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <XCircle className="w-6 h-6 mx-auto text-destructive mb-2" />
          <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto text-warning mb-2" />
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="recipients" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="queue">
            <ListOrdered className="w-4 h-4 mr-1" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="live">Live Monitor</TabsTrigger>
          {campaign.ab_testing_enabled && (
            <TabsTrigger value="ab-results">
              <FlaskConical className="w-4 h-4 mr-1" />
              A/B Results
            </TabsTrigger>
          )}
          <TabsTrigger value="followups">
            <Settings2 className="w-4 h-4 mr-1" />
            Follow-ups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipients" className="mt-4">
          {/* Contacts Table */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Email Recipients ({contacts.length})
            </h3>
            
            {contacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No contacts in this campaign</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Contact</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Sent At</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Opened At</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Clicked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((cc) => (
                      <tr key={cc.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">
                            {cc.contacts?.first_name} {cc.contacts?.last_name}
                          </p>
                          {cc.contacts?.business_name && (
                            <p className="text-xs text-muted-foreground">{cc.contacts.business_name}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {cc.contacts?.email}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(cc)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {cc.sent_at ? format(new Date(cc.sent_at), 'PP p') : '-'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {cc.opened_at ? format(new Date(cc.opened_at), 'PP p') : '-'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {cc.clicked_at ? format(new Date(cc.clicked_at), 'PP p') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          <EmailQueue 
            campaignId={campaignId}
            useRecipientTimezone={campaign.use_recipient_timezone || false}
            optimalSendHour={campaign.optimal_send_hour || 9}
            onComplete={fetchCampaignData}
          />
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <RealTimeMonitor campaignId={campaignId} />
        </TabsContent>

        {campaign.ab_testing_enabled && (
          <TabsContent value="ab-results" className="mt-4">
            <ABTestingResults
              variantA={{
                subject: campaign.variant_a_subject || '',
                content: campaign.variant_a_content || '',
                sent: campaign.variant_a_sent || 0,
                opens: campaign.variant_a_opens || 0,
                clicks: campaign.variant_a_clicks || 0,
              }}
              variantB={{
                subject: campaign.variant_b_subject || '',
                content: campaign.variant_b_content || '',
                sent: campaign.variant_b_sent || 0,
                opens: campaign.variant_b_opens || 0,
                clicks: campaign.variant_b_clicks || 0,
              }}
            />
          </TabsContent>
        )}

        <TabsContent value="followups" className="mt-4">
          <div className="glass-card rounded-xl p-6">
            <FollowUpConfig campaignId={campaignId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
