import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ContactActivity {
  id: string;
  user_id: string;
  contact_id: string | null;
  activity_type: string;
  title: string | null;
  description: string | null;
  metadata: any;
  source: string;
  ip_address: string | null;
  user_agent: string | null;
  page_url: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export function useContactActivities(contactId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contact-activities', user?.id, contactId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('contact_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);
      if (contactId) query = query.eq('contact_id', contactId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ContactActivity[];
    },
    enabled: !!user,
  });
}
