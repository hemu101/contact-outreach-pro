import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePageTracking(pageName: string, path?: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const trackPageView = async () => {
      try {
        await supabase.from('page_views').insert({
          user_id: user.id,
          page_name: pageName,
          path: path || window.location.pathname,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [user, pageName, path]);
}
