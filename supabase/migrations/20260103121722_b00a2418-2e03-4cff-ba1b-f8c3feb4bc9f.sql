-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create email warmup schedules table
CREATE TABLE public.email_warmup_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  current_daily_limit INTEGER NOT NULL DEFAULT 10,
  target_daily_limit INTEGER NOT NULL DEFAULT 500,
  increment_per_day INTEGER NOT NULL DEFAULT 10,
  warmup_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  emails_sent_today INTEGER NOT NULL DEFAULT 0,
  last_send_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email inbox/replies table
CREATE TABLE public.email_inbox (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id),
  campaign_contact_id UUID REFERENCES public.campaign_contacts(id),
  contact_id UUID REFERENCES public.contacts(id),
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  message_id TEXT,
  in_reply_to TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  folder TEXT NOT NULL DEFAULT 'inbox',
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity log table for all actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_warmup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_warmup_schedules
CREATE POLICY "Users can view own warmup schedules" ON public.email_warmup_schedules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own warmup schedules" ON public.email_warmup_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own warmup schedules" ON public.email_warmup_schedules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own warmup schedules" ON public.email_warmup_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for email_inbox
CREATE POLICY "Users can view own inbox" ON public.email_inbox
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to inbox" ON public.email_inbox
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inbox" ON public.email_inbox
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from inbox" ON public.email_inbox
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can insert to inbox" ON public.email_inbox
  FOR INSERT WITH CHECK (true);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view own activity" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can insert activity" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Enable realtime for inbox
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_inbox;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- Create indexes
CREATE INDEX idx_email_warmup_user ON public.email_warmup_schedules(user_id);
CREATE INDEX idx_email_inbox_user ON public.email_inbox(user_id);
CREATE INDEX idx_email_inbox_campaign ON public.email_inbox(campaign_id);
CREATE INDEX idx_email_inbox_contact ON public.email_inbox(contact_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Add trigger for updated_at
CREATE TRIGGER update_email_warmup_updated_at
  BEFORE UPDATE ON public.email_warmup_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();