import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useLinkedinLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ['linkedin_leads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('linkedin_leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createLead = useMutation({
    mutationFn: async (lead: { linkedin_url: string; company_name?: string; first_name?: string; last_name?: string; headline?: string; location?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('linkedin_leads')
        .insert({ ...lead, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin_leads'] });
      toast({ title: 'Lead added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add lead', description: error.message, variant: 'destructive' });
    },
  });

  const createManyLeads = useMutation({
    mutationFn: async (leads: { linkedin_url: string; company_name?: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      const withUser = leads.map(l => ({ ...l, user_id: user.id }));
      const { data, error } = await supabase
        .from('linkedin_leads')
        .insert(withUser)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['linkedin_leads'] });
      toast({ title: `${data.length} leads imported successfully` });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to import leads', description: error.message, variant: 'destructive' });
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('linkedin_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin_leads'] });
      toast({ title: 'Lead updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update lead', description: error.message, variant: 'destructive' });
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('linkedin_leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin_leads'] });
      toast({ title: 'Lead deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete lead', description: error.message, variant: 'destructive' });
    },
  });

  return {
    leads: leadsQuery.data ?? [],
    isLoading: leadsQuery.isLoading,
    createLead,
    createManyLeads,
    updateLead,
    deleteLead,
  };
}
