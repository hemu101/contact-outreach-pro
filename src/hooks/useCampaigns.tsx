import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Campaign = Tables<'campaigns'>;
type CampaignInsert = TablesInsert<'campaigns'>;
type CampaignUpdate = TablesUpdate<'campaigns'>;
type CampaignContact = Tables<'campaign_contacts'>;

export function useCampaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ['campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });

  const getCampaignContacts = async (campaignId: string) => {
    const { data, error } = await supabase
      .from('campaign_contacts')
      .select('*, contacts(*)')
      .eq('campaign_id', campaignId);

    if (error) throw error;
    return data;
  };

  const createCampaign = useMutation({
    mutationFn: async ({
      campaign,
      contactIds,
    }: {
      campaign: Omit<CampaignInsert, 'user_id'>;
      contactIds: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Create campaign
      const { data: newCampaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          ...campaign,
          user_id: user.id,
          total_contacts: contactIds.length,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Add contacts to campaign
      if (contactIds.length > 0) {
        const campaignContacts = contactIds.map((contactId) => ({
          campaign_id: newCampaign.id,
          contact_id: contactId,
          status: 'pending',
        }));

        const { error: contactsError } = await supabase
          .from('campaign_contacts')
          .insert(campaignContacts);

        if (contactsError) throw contactsError;
      }

      // Log campaign creation
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'campaign_created',
        entity_type: 'campaign',
        entity_id: newCampaign.id,
        metadata: { 
          name: campaign.name,
          contacts_count: contactIds.length,
          use_timezone: campaign.use_recipient_timezone,
        },
      });

      return newCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create campaign', description: error.message, variant: 'destructive' });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: CampaignUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update campaign', description: error.message, variant: 'destructive' });
    },
  });

  const launchCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.functions.invoke('send-campaign-emails', {
        body: { campaignId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign launched! Emails are being sent.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to launch campaign', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      // Delete campaign contacts first
      await supabase.from('campaign_contacts').delete().eq('campaign_id', id);
      // Then delete campaign
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete campaign', description: error.message, variant: 'destructive' });
    },
  });

  return {
    campaigns: campaignsQuery.data ?? [],
    isLoading: campaignsQuery.isLoading,
    error: campaignsQuery.error,
    getCampaignContacts,
    createCampaign,
    updateCampaign,
    launchCampaign,
    deleteCampaign,
  };
}
