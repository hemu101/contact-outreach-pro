import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  company_contact_id: string | null;
  company_id: string | null;
  stage_id: string | null;
  title: string;
  value: number;
  currency: string;
  probability: number;
  expected_close_date: string | null;
  notes: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export function usePipeline() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const stagesQuery = useQuery({
    queryKey: ['pipeline-stages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      if (error) throw error;
      return data as PipelineStage[];
    },
    enabled: !!user,
  });

  const dealsQuery = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!user,
  });

  const createStage = useMutation({
    mutationFn: async (stage: { name: string; color?: string; position?: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert({ ...stage, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline-stages'] }),
  });

  const createDeal = useMutation({
    mutationFn: async (deal: Partial<Deal> & { title: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('deals')
        .insert({ ...deal, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Deal created' });
    },
  });

  const updateDeal = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });

  const deleteDeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Deal deleted' });
    },
  });

  const initDefaultStages = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const defaults = [
        { name: 'New', color: '#6366f1', position: 0 },
        { name: 'Contacted', color: '#f59e0b', position: 1 },
        { name: 'Qualified', color: '#3b82f6', position: 2 },
        { name: 'Proposal', color: '#8b5cf6', position: 3 },
        { name: 'Won', color: '#10b981', position: 4 },
        { name: 'Lost', color: '#ef4444', position: 5 },
      ];
      const { error } = await supabase
        .from('pipeline_stages')
        .insert(defaults.map(s => ({ ...s, user_id: user.id })));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline-stages'] }),
  });

  return {
    stages: stagesQuery.data ?? [],
    deals: dealsQuery.data ?? [],
    isLoading: stagesQuery.isLoading || dealsQuery.isLoading,
    createStage,
    createDeal,
    updateDeal,
    deleteDeal,
    initDefaultStages,
  };
}
