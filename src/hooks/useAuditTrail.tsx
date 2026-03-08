import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AuditEntry {
  id: string;
  user_id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_data: any;
  new_data: any;
  changed_fields: string[] | null;
  created_at: string;
}

export function useAuditTrail(tableName?: string, recordId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['audit-trail', user?.id, tableName, recordId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('audit_trail')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (tableName) query = query.eq('table_name', tableName);
      if (recordId) query = query.eq('record_id', recordId);
      const { data, error } = await query;
      if (error) throw error;
      return data as AuditEntry[];
    },
    enabled: !!user,
  });
}
