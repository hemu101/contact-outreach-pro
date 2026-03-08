
-- =============================================
-- 1. PIPELINE / DEAL STAGES
-- =============================================
CREATE TABLE public.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own stages" ON public.pipeline_stages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_contact_id uuid REFERENCES public.company_contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  stage_id uuid REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  title text NOT NULL,
  value numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  probability integer DEFAULT 50,
  expected_close_date date,
  notes text,
  position integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deals" ON public.deals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 2. AUDIT TRAIL / CHANGE LOG
-- =============================================
CREATE TABLE public.audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL, -- insert, update, delete
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own audit" ON public.audit_trail FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit" ON public.audit_trail FOR INSERT WITH CHECK (true);

-- =============================================
-- 3. SMART LISTS (Saved Filters)
-- =============================================
CREATE TABLE public.smart_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  table_target text NOT NULL DEFAULT 'company_contacts', -- which table
  filters jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_by text,
  sort_order text DEFAULT 'desc',
  is_pinned boolean DEFAULT false,
  contact_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.smart_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own smart lists" ON public.smart_lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. WEBHOOK EVENT LOG
-- =============================================
CREATE TABLE public.webhook_event_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  webhook_url text NOT NULL,
  direction text NOT NULL DEFAULT 'outbound', -- inbound / outbound
  event_type text,
  payload jsonb,
  response_status integer,
  response_body text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  next_retry_at timestamptz,
  status text DEFAULT 'pending', -- pending, success, failed, retrying
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own webhook logs" ON public.webhook_event_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert webhook logs" ON public.webhook_event_log FOR INSERT WITH CHECK (true);

-- =============================================
-- 5. LEAD SCORE COLUMN on company_contacts
-- =============================================
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS lead_score_breakdown jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS is_duplicate boolean DEFAULT false;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS duplicate_of uuid REFERENCES public.company_contacts(id) ON DELETE SET NULL;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS pipeline_stage text;

-- =============================================
-- 6. PERFORMANCE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_company_contacts_user_id ON public.company_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_company_id ON public.company_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_email ON public.company_contacts(email);
CREATE INDEX IF NOT EXISTS idx_company_contacts_lead_score ON public.company_contacts(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_deals_user_stage ON public.deals(user_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_contact ON public.deals(company_contact_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_record ON public.audit_trail(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON public.audit_trail(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON public.campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_user_email ON public.contacts(user_id, email);
CREATE INDEX IF NOT EXISTS idx_webhook_event_log_status ON public.webhook_event_log(status, next_retry_at);

-- =============================================
-- 7. LEAD SCORING FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_contact_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contact_rec RECORD;
  score integer := 0;
  breakdown jsonb := '{}'::jsonb;
BEGIN
  SELECT * INTO contact_rec FROM public.company_contacts WHERE id = p_contact_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- Email presence (+15)
  IF contact_rec.email IS NOT NULL AND contact_rec.email <> '' THEN
    score := score + 15;
    breakdown := breakdown || '{"email": 15}'::jsonb;
  END IF;

  -- Phone presence (+10)
  IF COALESCE(contact_rec.work_direct_phone, contact_rec.mobile_phone, contact_rec.corporate_phone) IS NOT NULL THEN
    score := score + 10;
    breakdown := breakdown || '{"phone": 10}'::jsonb;
  END IF;

  -- LinkedIn presence (+10)
  IF contact_rec.person_linkedin_url IS NOT NULL AND contact_rec.person_linkedin_url <> '' THEN
    score := score + 10;
    breakdown := breakdown || '{"linkedin": 10}'::jsonb;
  END IF;

  -- Seniority scoring
  IF contact_rec.seniority IN ('C-Suite', 'VP') THEN
    score := score + 25;
    breakdown := breakdown || '{"seniority": 25}'::jsonb;
  ELSIF contact_rec.seniority IN ('Director', 'Manager') THEN
    score := score + 15;
    breakdown := breakdown || '{"seniority": 15}'::jsonb;
  ELSIF contact_rec.seniority IS NOT NULL THEN
    score := score + 5;
    breakdown := breakdown || '{"seniority": 5}'::jsonb;
  END IF;

  -- MQL status (+15)
  IF contact_rec.mql IS NOT NULL AND contact_rec.mql <> '' THEN
    score := score + 15;
    breakdown := breakdown || '{"mql": 15}'::jsonb;
  END IF;

  -- SQL status (+20)
  IF contact_rec.sql_status IS NOT NULL AND contact_rec.sql_status <> '' THEN
    score := score + 20;
    breakdown := breakdown || '{"sql_status": 20}'::jsonb;
  END IF;

  -- Title presence (+5)
  IF contact_rec.title IS NOT NULL AND contact_rec.title <> '' THEN
    score := score + 5;
    breakdown := breakdown || '{"title": 5}'::jsonb;
  END IF;

  -- Cap at 100
  IF score > 100 THEN score := 100; END IF;

  UPDATE public.company_contacts 
  SET lead_score = score, lead_score_breakdown = breakdown 
  WHERE id = p_contact_id;

  RETURN score;
END;
$$;

-- =============================================
-- 8. DUPLICATE DETECTION FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.find_duplicate_contacts(p_user_id uuid)
RETURNS TABLE(contact_id uuid, duplicate_of_id uuid, match_type text, match_value text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Email duplicates
  RETURN QUERY
  SELECT c1.id, c2.id, 'email'::text, c1.email
  FROM public.company_contacts c1
  JOIN public.company_contacts c2 ON c1.email = c2.email AND c1.id <> c2.id AND c2.user_id = p_user_id
  WHERE c1.user_id = p_user_id AND c1.email IS NOT NULL AND c1.email <> ''
  AND c1.id < c2.id;

  -- LinkedIn duplicates  
  RETURN QUERY
  SELECT c1.id, c2.id, 'linkedin'::text, c1.person_linkedin_url
  FROM public.company_contacts c1
  JOIN public.company_contacts c2 ON c1.person_linkedin_url = c2.person_linkedin_url AND c1.id <> c2.id AND c2.user_id = p_user_id
  WHERE c1.user_id = p_user_id AND c1.person_linkedin_url IS NOT NULL AND c1.person_linkedin_url <> ''
  AND c1.id < c2.id;

  -- Phone duplicates
  RETURN QUERY
  SELECT c1.id, c2.id, 'phone'::text, c1.mobile_phone
  FROM public.company_contacts c1
  JOIN public.company_contacts c2 ON c1.mobile_phone = c2.mobile_phone AND c1.id <> c2.id AND c2.user_id = p_user_id
  WHERE c1.user_id = p_user_id AND c1.mobile_phone IS NOT NULL AND c1.mobile_phone <> ''
  AND c1.id < c2.id;
END;
$$;

-- =============================================
-- 9. BATCH LEAD SCORE FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.batch_calculate_lead_scores(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contact_rec RECORD;
  count integer := 0;
BEGIN
  FOR contact_rec IN SELECT id FROM public.company_contacts WHERE user_id = p_user_id
  LOOP
    PERFORM public.calculate_lead_score(contact_rec.id);
    count := count + 1;
  END LOOP;
  RETURN count;
END;
$$;

-- =============================================
-- 10. CREATE DEFAULT PIPELINE STAGES FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.create_default_pipeline_stages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.pipeline_stages (user_id, name, color, position) VALUES
    (NEW.id, 'New', '#6366f1', 0),
    (NEW.id, 'Contacted', '#f59e0b', 1),
    (NEW.id, 'Qualified', '#3b82f6', 2),
    (NEW.id, 'Proposal', '#8b5cf6', 3),
    (NEW.id, 'Won', '#10b981', 4),
    (NEW.id, 'Lost', '#ef4444', 5)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- =============================================
-- 11. VIEW: campaign_performance
-- =============================================
CREATE OR REPLACE VIEW public.campaign_performance AS
SELECT 
  c.id,
  c.name,
  c.user_id,
  c.status,
  c.created_at,
  c.total_contacts,
  c.sent_count,
  c.open_count,
  c.click_count,
  CASE WHEN c.sent_count > 0 THEN ROUND((c.open_count::numeric / c.sent_count) * 100, 2) ELSE 0 END as open_rate,
  CASE WHEN c.sent_count > 0 THEN ROUND((c.click_count::numeric / c.sent_count) * 100, 2) ELSE 0 END as click_rate,
  CASE WHEN c.open_count > 0 THEN ROUND((c.click_count::numeric / c.open_count) * 100, 2) ELSE 0 END as click_to_open_rate
FROM public.campaigns c;

-- =============================================
-- 12. VIEW: contact_engagement_summary
-- =============================================
CREATE OR REPLACE VIEW public.contact_engagement_summary AS
SELECT
  cc.contact_id,
  co.first_name,
  co.last_name,
  co.email,
  COUNT(DISTINCT cc.campaign_id) as campaigns_received,
  COUNT(cc.opened_at) as total_opens,
  COUNT(cc.clicked_at) as total_clicks,
  MAX(cc.sent_at) as last_sent_at,
  MAX(cc.opened_at) as last_opened_at
FROM public.campaign_contacts cc
JOIN public.contacts co ON co.id = cc.contact_id
GROUP BY cc.contact_id, co.first_name, co.last_name, co.email;

-- Trigger for updated_at on deals
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_lists_updated_at BEFORE UPDATE ON public.smart_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
