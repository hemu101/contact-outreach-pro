
-- Fix: only create tables that don't exist yet
-- Revenue attribution
CREATE TABLE IF NOT EXISTS public.revenue_attribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.company_contacts(id) ON DELETE SET NULL,
  touchpoint_type TEXT NOT NULL,
  touchpoint_date TIMESTAMPTZ NOT NULL,
  attribution_model TEXT DEFAULT 'multi_touch',
  attributed_value NUMERIC DEFAULT 0,
  attributed_percent NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_attribution ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own attribution" ON public.revenue_attribution;
CREATE POLICY "Users manage own attribution" ON public.revenue_attribution FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own saved searches" ON public.saved_searches;
CREATE POLICY "Users manage own saved searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add columns to company_contacts (IF NOT EXISTS handles gracefully)
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS buyer_intent_score INTEGER DEFAULT 0;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Calculate buyer intent score function
CREATE OR REPLACE FUNCTION public.calculate_buyer_intent_score(p_contact_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  score integer := 0;
  signal_rec RECORD;
  activity_count integer;
  recent_signals integer;
BEGIN
  SELECT COALESCE(lead_score, 0) INTO score FROM company_contacts WHERE id = p_contact_id;
  FOR signal_rec IN 
    SELECT signal_type, score_impact FROM intent_signals 
    WHERE contact_id = p_contact_id AND detected_at > now() - interval '30 days'
  LOOP
    score := score + COALESCE(signal_rec.score_impact, 5);
  END LOOP;
  SELECT COUNT(*) INTO activity_count FROM contact_activities 
    WHERE contact_id = p_contact_id AND created_at > now() - interval '14 days';
  score := score + LEAST(activity_count * 3, 30);
  SELECT COUNT(*) INTO recent_signals FROM intent_signals 
    WHERE contact_id = p_contact_id AND detected_at > now() - interval '7 days';
  IF recent_signals > 0 THEN score := score + 15; END IF;
  IF score > 100 THEN score := 100; END IF;
  UPDATE company_contacts SET buyer_intent_score = score WHERE id = p_contact_id;
  RETURN score;
END;
$$;

-- Update triggers
DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON public.saved_searches;
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
