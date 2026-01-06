-- Add timezone to contacts for optimal send time scheduling
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Create page_views table for tracking user navigation
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_name TEXT NOT NULL,
  path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_views
CREATE POLICY "Users can view own page views" ON public.page_views
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own page views" ON public.page_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create dm_campaigns table for social DM tracking
CREATE TABLE IF NOT EXISTS public.dm_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  template_id UUID REFERENCES public.templates(id),
  status TEXT DEFAULT 'draft',
  total_contacts INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on dm_campaigns
ALTER TABLE public.dm_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for dm_campaigns
CREATE POLICY "Users can view own DM campaigns" ON public.dm_campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own DM campaigns" ON public.dm_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own DM campaigns" ON public.dm_campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own DM campaigns" ON public.dm_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Create dm_campaign_contacts for tracking DM sends to creators
CREATE TABLE IF NOT EXISTS public.dm_campaign_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dm_campaign_id UUID NOT NULL REFERENCES public.dm_campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on dm_campaign_contacts
ALTER TABLE public.dm_campaign_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for dm_campaign_contacts (via dm_campaigns ownership)
CREATE POLICY "Users can view own DM campaign contacts" ON public.dm_campaign_contacts
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.dm_campaigns WHERE id = dm_campaign_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own DM campaign contacts" ON public.dm_campaign_contacts
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.dm_campaigns WHERE id = dm_campaign_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own DM campaign contacts" ON public.dm_campaign_contacts
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.dm_campaigns WHERE id = dm_campaign_id AND user_id = auth.uid()));

-- Add optimal_send_hour to campaigns for timezone-based scheduling
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS optimal_send_hour INTEGER DEFAULT 9;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS use_recipient_timezone BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_campaigns_user_id ON public.dm_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_dm_campaign_contacts_campaign_id ON public.dm_campaign_contacts(dm_campaign_id);
CREATE INDEX IF NOT EXISTS idx_contacts_timezone ON public.contacts(timezone);