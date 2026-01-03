import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = async (
    actionType: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
}
