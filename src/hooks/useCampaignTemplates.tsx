import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CampaignTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  steps: number | null;
  sequence_data: any;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignTemplateInsert {
  name: string;
  description?: string | null;
  category?: string | null;
  steps?: number | null;
  sequence_data?: any;
  featured?: boolean | null;
}

export interface CampaignTemplateUpdate {
  id: string;
  name?: string;
  description?: string | null;
  category?: string | null;
  steps?: number | null;
  sequence_data?: any;
  featured?: boolean | null;
}

export function useCampaignTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['campaign-templates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('campaign_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CampaignTemplate[];
    },
    enabled: !!user,
  });

  const createTemplate = useMutation({
    mutationFn: async (template: CampaignTemplateInsert) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('campaign_templates')
        .insert({ ...template, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] });
      toast({ title: 'Campaign template created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create campaign template', description: error.message, variant: 'destructive' });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: CampaignTemplateUpdate) => {
      const { data, error } = await supabase
        .from('campaign_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] });
      toast({ title: 'Campaign template updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update campaign template', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('campaign_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] });
      toast({ title: 'Campaign template deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete campaign template', description: error.message, variant: 'destructive' });
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
