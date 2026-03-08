import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CustomReport {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  report_type: string;
  data_source: string;
  metrics: any[];
  dimensions: any[];
  filters: any[];
  chart_config: any;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function useCustomReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['custom-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as CustomReport[];
    },
    enabled: !!user,
  });

  const createReport = useMutation({
    mutationFn: async (report: Partial<CustomReport> & { name: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('custom_reports')
        .insert({ ...report, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-reports'] });
      toast({ title: 'Report created' });
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-reports'] });
      toast({ title: 'Report deleted' });
    },
  });

  return {
    reports: query.data ?? [],
    isLoading: query.isLoading,
    createReport,
    deleteReport,
  };
}
