import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { EmailSettings } from '@/types/contact';

export function useEmailSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['email-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          smtpHost: data.smtp_host || '',
          smtpPort: data.smtp_port || '587',
          smtpUser: data.smtp_user || '',
          smtpPassword: data.smtp_password || '',
          sendgridKey: data.sendgrid_key || '',
          brevoApiKey: data.brevo_api_key || '',
          twilioSid: data.twilio_sid || '',
          twilioToken: data.twilio_token || '',
          twilioNumber: data.twilio_number || '',
        } as EmailSettings;
      }
      
      return null;
    },
    enabled: !!user,
  });

  const saveSettings = useMutation({
    mutationFn: async (settings: EmailSettings) => {
      if (!user) throw new Error('Not authenticated');

      const payload = {
        user_id: user.id,
        smtp_host: settings.smtpHost,
        smtp_port: settings.smtpPort,
        smtp_user: settings.smtpUser,
        smtp_password: settings.smtpPassword,
        sendgrid_key: settings.sendgridKey,
        brevo_api_key: settings.brevoApiKey,
        twilio_sid: settings.twilioSid,
        twilio_token: settings.twilioToken,
        twilio_number: settings.twilioNumber,
      };

      // Check if settings exist
      const { data: existing } = await supabase
        .from('email_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('email_settings')
          .update(payload)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_settings')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      toast({ title: 'Settings saved', description: 'Your API credentials have been saved securely.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    saveSettings,
  };
}
