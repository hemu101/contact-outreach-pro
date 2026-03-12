
-- Enhanced visitor tracking with detailed analytics
CREATE TABLE IF NOT EXISTS public.visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.tracking_sessions(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- page_view, click, scroll, form_submit, video_play, download, identify, custom
  page_url TEXT,
  page_title TEXT,
  element_selector TEXT, -- CSS selector for clicks
  element_text TEXT, -- text of clicked element
  click_x INTEGER,
  click_y INTEGER,
  scroll_depth INTEGER, -- percentage 0-100
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  duration_on_page INTEGER, -- seconds
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social media visitor tracking
CREATE TABLE IF NOT EXISTS public.social_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.company_contacts(id) ON DELETE SET NULL,
  platform TEXT NOT NULL, -- instagram, tiktok, linkedin, twitter, facebook, youtube
  profile_url TEXT,
  username TEXT,
  follower_count INTEGER,
  engagement_rate NUMERIC(5,2),
  post_interactions JSONB DEFAULT '[]'::jsonb, -- [{post_url, type: like/comment/share, timestamp}]
  dm_status TEXT DEFAULT 'none', -- none, sent, replied, converted
  last_interaction_at TIMESTAMPTZ,
  source TEXT, -- organic, ad, referral
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live chat conversations
CREATE TABLE IF NOT EXISTS public.live_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  visitor_id TEXT,
  session_id UUID REFERENCES public.tracking_sessions(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.company_contacts(id) ON DELETE SET NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, waiting, resolved, missed
  channel TEXT DEFAULT 'website', -- website, whatsapp, messenger, instagram
  assigned_agent_id UUID,
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  rating INTEGER, -- 1-5
  tags TEXT[],
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.live_chats(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- agent, visitor, bot
  sender_id TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, image, file, audio, video, system
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Communication calls (audio/video)
CREATE TABLE IF NOT EXISTS public.communication_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.company_contacts(id) ON DELETE SET NULL,
  chat_id UUID REFERENCES public.live_chats(id) ON DELETE SET NULL,
  call_type TEXT NOT NULL, -- audio, video
  direction TEXT NOT NULL DEFAULT 'outbound', -- inbound, outbound
  status TEXT NOT NULL DEFAULT 'initiated', -- initiated, ringing, connected, ended, missed, failed
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  notes TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Visitor page analytics (aggregated)
CREATE TABLE IF NOT EXISTS public.page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  unique_visitors INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0, -- seconds
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  exit_rate NUMERIC(5,2) DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  top_click_elements JSONB DEFAULT '[]'::jsonb,
  scroll_depth_avg INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns to tracking_sessions for richer data
ALTER TABLE public.tracking_sessions 
  ADD COLUMN IF NOT EXISTS device_type TEXT,
  ADD COLUMN IF NOT EXISTS browser TEXT,
  ADD COLUMN IF NOT EXISTS os TEXT,
  ADD COLUMN IF NOT EXISTS screen_resolution TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_scroll_depth INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS social_source TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage own visitor_events" ON public.visitor_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own social_visitors" ON public.social_visitors FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own live_chats" ON public.live_chats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own chat_messages" ON public.chat_messages FOR ALL USING (EXISTS (SELECT 1 FROM public.live_chats WHERE id = chat_messages.chat_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage own calls" ON public.communication_calls FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own page_analytics" ON public.page_analytics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitor_events_session ON public.visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_user_type ON public.visitor_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created ON public.visitor_events(created_at);
CREATE INDEX IF NOT EXISTS idx_social_visitors_user ON public.social_visitors(user_id);
CREATE INDEX IF NOT EXISTS idx_live_chats_user_status ON public.live_chats(user_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_user_date ON public.page_analytics(user_id, date);
