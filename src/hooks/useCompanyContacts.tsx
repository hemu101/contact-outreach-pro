import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CompanyContact {
  id: string;
  user_id: string;
  company_id: string | null;
  first_name: string | null;
  last_name: string | null;
  seniority: string | null;
  departments: string | null;
  title: string | null;
  email: string | null;
  secondary_email: string | null;
  email_from_website: string | null;
  work_direct_phone: string | null;
  home_phone: string | null;
  mobile_phone: string | null;
  corporate_phone: string | null;
  other_phone: string | null;
  person_linkedin_url: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  job_tracking_link: string | null;
  hiring_job_title: string | null;
  salary_estimated: string | null;
  job_location: string | null;
  linkedin_job_link: string | null;
  linkedin_job_title: string | null;
  job_basedon: string | null;
  mql: string | null;
  sql_status: string | null;
  ig_score: string | null;
  notes_for_sdr: string | null;
  notes_for_data: string | null;
  date_of_filtration: string | null;
  extra_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

type CompanyContactInsert = Omit<CompanyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useCompanyContacts(companyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ['company-contacts', user?.id, companyId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('company_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (companyId) query = query.eq('company_id', companyId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CompanyContact[];
    },
    enabled: !!user,
  });

  const createContact = useMutation({
    mutationFn: async (contact: CompanyContactInsert) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('company_contacts')
        .insert({ ...contact, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-contacts'] });
      toast({ title: 'Contact added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add contact', description: error.message, variant: 'destructive' });
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('company_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-contacts'] });
      toast({ title: 'Contact updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update contact', description: error.message, variant: 'destructive' });
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-contacts'] });
      toast({ title: 'Contact deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete contact', description: error.message, variant: 'destructive' });
    },
  });

  return {
    contacts: contactsQuery.data ?? [],
    isLoading: contactsQuery.isLoading,
    createContact,
    updateContact,
    deleteContact,
  };
}
