import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useLeadScoring() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const scoreContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { data, error } = await supabase.rpc('calculate_lead_score', { p_contact_id: contactId });
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company-contacts'] }),
  });

  const scoreAll = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('batch_calculate_lead_scores', { p_user_id: user.id });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['company-contacts'] });
      toast({ title: `Scored ${count} contacts` });
    },
  });

  const findDuplicates = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('find_duplicate_contacts', { p_user_id: user.id });
      if (error) throw error;
      return data as { contact_id: string; duplicate_of_id: string; match_type: string; match_value: string }[];
    },
  });

  return { scoreContact, scoreAll, findDuplicates };
}
