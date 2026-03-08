import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SmartList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  table_target: string;
  filters: any[];
  sort_by: string | null;
  sort_order: string;
  is_pinned: boolean;
  contact_count: number;
  created_at: string;
  updated_at: string;
}

export function useSmartLists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['smart-lists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('smart_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as SmartList[];
    },
    enabled: !!user,
  });

  const createList = useMutation({
    mutationFn: async (list: { name: string; filters: any[]; table_target?: string; description?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('smart_lists')
        .insert({ ...list, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['smart-lists'] });
      toast({ title: 'Smart list created' });
    },
  });

  const updateList = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('smart_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['smart-lists'] }),
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('smart_lists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['smart-lists'] });
      toast({ title: 'Smart list deleted' });
    },
  });

  return {
    lists: query.data ?? [],
    isLoading: query.isLoading,
    createList,
    updateList,
    deleteList,
  };
}
