
-- =============================================
-- 1. CONTACT ACTIVITIES (HubSpot-style tracking)
-- =============================================
CREATE TABLE public.contact_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid REFERENCES public.company_contacts(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- page_view, email_open, email_click, form_submit, call, note, meeting, deal_change, task
  title text,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  source text DEFAULT 'manual', -- manual, tracking_script, email_event, automation
  ip_address text,
  user_agent text,
  page_url text,
  duration_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contact activities" ON public.contact_activities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can insert activities" ON public.contact_activities FOR INSERT WITH CHECK (true);
CREATE INDEX idx_contact_activities_contact ON public.contact_activities(contact_id, created_at DESC);
CREATE INDEX idx_contact_activities_user ON public.contact_activities(user_id, created_at DESC);
CREATE INDEX idx_contact_activities_type ON public.contact_activities(activity_type);

-- =============================================
-- 2. TRACKING SESSIONS (Website Visitor Tracking)
-- =============================================
CREATE TABLE public.tracking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- the account owner
  visitor_id text NOT NULL, -- anonymous cookie-based ID
  contact_id uuid REFERENCES public.company_contacts(id) ON DELETE SET NULL,
  email text,
  ip_address text,
  user_agent text,
  referrer text,
  landing_page text,
  pages_viewed jsonb DEFAULT '[]'::jsonb,
  total_page_views integer DEFAULT 0,
  total_duration_seconds integer DEFAULT 0,
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  is_identified boolean DEFAULT false,
  country text,
  city text,
  device_type text,
  browser text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tracking sessions" ON public.tracking_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert tracking sessions" ON public.tracking_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update tracking sessions" ON public.tracking_sessions FOR UPDATE WITH CHECK (true);
CREATE INDEX idx_tracking_sessions_visitor ON public.tracking_sessions(visitor_id);
CREATE INDEX idx_tracking_sessions_contact ON public.tracking_sessions(contact_id);
CREATE INDEX idx_tracking_sessions_user ON public.tracking_sessions(user_id, last_seen_at DESC);

-- =============================================
-- 3. AUTOMATION RULES (Workflow Automation)
-- =============================================
CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  trigger_type text NOT NULL, -- lead_score_change, no_reply, email_opened, page_visited, form_submitted, deal_stage_change
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"threshold": 70, "days": 7}
  action_type text NOT NULL, -- move_to_stage, send_email, add_tag, create_task, webhook, assign_owner
  action_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"stage_id": "...", "template_id": "..."}
  execution_count integer DEFAULT 0,
  last_executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own automation rules" ON public.automation_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_automation_rules_user ON public.automation_rules(user_id, is_active);

CREATE TABLE public.automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rule_id uuid REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.company_contacts(id) ON DELETE SET NULL,
  trigger_data jsonb,
  action_result jsonb,
  status text DEFAULT 'success', -- success, failed, skipped
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own automation logs" ON public.automation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert automation logs" ON public.automation_logs FOR INSERT WITH CHECK (true);
CREATE INDEX idx_automation_logs_rule ON public.automation_logs(rule_id, created_at DESC);

-- =============================================
-- 4. ENRICHMENT LOGS
-- =============================================
CREATE TABLE public.enrichment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid REFERENCES public.company_contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  source text NOT NULL, -- clearbit, apollo, linkedin, manual
  fields_enriched text[],
  data_before jsonb,
  data_after jsonb,
  status text DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.enrichment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own enrichment logs" ON public.enrichment_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert enrichment logs" ON public.enrichment_logs FOR INSERT WITH CHECK (true);

-- =============================================
-- 5. CUSTOM REPORTS
-- =============================================
CREATE TABLE public.custom_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  report_type text NOT NULL DEFAULT 'table', -- table, bar, line, pie, funnel
  data_source text NOT NULL DEFAULT 'contacts', -- contacts, companies, deals, campaigns, activities
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{field, aggregation}]
  dimensions jsonb DEFAULT '[]'::jsonb, -- [{field}] for grouping
  filters jsonb DEFAULT '[]'::jsonb,
  chart_config jsonb DEFAULT '{}'::jsonb,
  is_pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reports" ON public.custom_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 6. ENGAGEMENT SCORING FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(p_contact_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score integer := 0;
  activity_count integer;
  page_views integer;
  email_opens integer;
  email_clicks integer;
  recent_activity integer;
BEGIN
  -- Count activities in last 30 days
  SELECT COUNT(*) INTO activity_count 
  FROM public.contact_activities 
  WHERE contact_id = p_contact_id AND created_at > now() - interval '30 days';

  -- Page views score (max 25)
  SELECT COUNT(*) INTO page_views
  FROM public.contact_activities
  WHERE contact_id = p_contact_id AND activity_type = 'page_view' AND created_at > now() - interval '30 days';
  score := score + LEAST(page_views * 5, 25);

  -- Email opens (max 20)
  SELECT COUNT(*) INTO email_opens
  FROM public.contact_activities
  WHERE contact_id = p_contact_id AND activity_type = 'email_open' AND created_at > now() - interval '30 days';
  score := score + LEAST(email_opens * 10, 20);

  -- Email clicks (max 25)
  SELECT COUNT(*) INTO email_clicks
  FROM public.contact_activities
  WHERE contact_id = p_contact_id AND activity_type = 'email_click' AND created_at > now() - interval '30 days';
  score := score + LEAST(email_clicks * 15, 25);

  -- Recency bonus (max 15)
  SELECT COUNT(*) INTO recent_activity
  FROM public.contact_activities
  WHERE contact_id = p_contact_id AND created_at > now() - interval '7 days';
  IF recent_activity > 0 THEN score := score + 15; END IF;

  -- Form submissions (max 15)
  IF EXISTS (SELECT 1 FROM public.contact_activities WHERE contact_id = p_contact_id AND activity_type = 'form_submit' AND created_at > now() - interval '30 days') THEN
    score := score + 15;
  END IF;

  IF score > 100 THEN score := 100; END IF;
  RETURN score;
END;
$$;

-- Triggers
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON public.custom_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
