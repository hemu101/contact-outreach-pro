-- 1. Reserve khemale05@gmail.com as admin (now and on future signup)
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = 'khemale05@gmail.com' LIMIT 1;
  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF lower(COALESCE(NEW.email, '')) = 'khemale05@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN NEW;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Add scoring & verification columns to company_contacts
ALTER TABLE public.company_contacts
  ADD COLUMN IF NOT EXISTS is_hiring_ugc boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_running_ads boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recent_campaign_launch boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_team_exists boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_ecom_dtc_agency boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS industry_category text,
  ADD COLUMN IF NOT EXISTS company_size_band text;

-- 3. Add verification columns to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS website_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS website_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS website_verification_data jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_hiring_ugc boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_running_ads boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recent_campaign_launch boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_team_exists boolean DEFAULT false;

-- 4. Website verification log table
CREATE TABLE IF NOT EXISTS public.website_verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  website text NOT NULL,
  status text NOT NULL,
  method text,
  response_data jsonb DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.website_verification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own verification logs" ON public.website_verification_logs
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own verification logs" ON public.website_verification_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. People search log
CREATE TABLE IF NOT EXISTS public.people_search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query jsonb NOT NULL,
  result_count integer DEFAULT 0,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.people_search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own search logs" ON public.people_search_logs
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own search logs" ON public.people_search_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 6. Rewrite calculate_lead_score with Quality / Behavior / Fit
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_contact_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  c RECORD;
  co RECORD;
  quality int := 0;
  behavior int := 0;
  fit int := 0;
  total int := 0;
  breakdown jsonb := '{}'::jsonb;
  q jsonb := '{}'::jsonb;
  b jsonb := '{}'::jsonb;
  f jsonb := '{}'::jsonb;
  ind text;
  size_n int;
BEGIN
  SELECT * INTO c FROM public.company_contacts WHERE id = p_contact_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  SELECT * INTO co FROM public.companies WHERE id = c.company_id;

  -- ============ QUALITY (max 70) ============
  IF c.email IS NOT NULL AND c.email <> '' THEN quality := quality + 15; q := q || '{"email":15}'; END IF;
  IF COALESCE(c.work_direct_phone, c.mobile_phone, c.corporate_phone) IS NOT NULL THEN quality := quality + 10; q := q || '{"phone":10}'; END IF;
  IF c.person_linkedin_url IS NOT NULL AND c.person_linkedin_url <> '' THEN quality := quality + 10; q := q || '{"linkedin":10}'; END IF;
  IF c.seniority IN ('C-Suite','VP') THEN quality := quality + 25; q := q || '{"seniority":25}';
  ELSIF c.seniority IN ('Director','Manager') THEN quality := quality + 15; q := q || '{"seniority":15}';
  ELSIF c.seniority IS NOT NULL THEN quality := quality + 5; q := q || '{"seniority":5}'; END IF;
  IF c.title IS NOT NULL AND c.title <> '' THEN quality := quality + 5; q := q || '{"title":5}'; END IF;
  IF c.mql IS NOT NULL AND c.mql <> '' THEN quality := quality + 5; q := q || '{"mql":5}'; END IF;
  IF c.sql_status IS NOT NULL AND c.sql_status <> '' THEN quality := quality + 5; q := q || '{"sql":5}'; END IF;
  IF quality > 70 THEN quality := 70; END IF;

  -- ============ BEHAVIOR (max 30) ============
  IF COALESCE(c.is_hiring_ugc, COALESCE(co.is_hiring_ugc, false)) THEN behavior := behavior + 10; b := b || '{"hiring_ugc":10}'; END IF;
  IF COALESCE(c.is_running_ads, COALESCE(co.is_running_ads, false)) THEN behavior := behavior + 10; b := b || '{"running_ads":10}'; END IF;
  IF COALESCE(c.recent_campaign_launch, COALESCE(co.recent_campaign_launch, false)) THEN behavior := behavior + 10; b := b || '{"campaign_launch":10}'; END IF;
  IF behavior > 30 THEN behavior := 30; END IF;

  -- ============ FIT (max 30) ============
  ind := lower(COALESCE(c.industry_category, co.industry, ''));
  IF ind ~ 'beauty|cpg|apparel|fashion|wellness|cosmet|skincare' THEN fit := fit + 10; f := f || '{"industry":10}'; END IF;

  size_n := COALESCE(co.employee_count, NULL);
  IF size_n BETWEEN 20 AND 500 THEN fit := fit + 10; f := f || '{"size":10}';
  ELSIF c.company_size_band IN ('20-50','50-200','200-500') THEN fit := fit + 10; f := f || '{"size":10}'; END IF;

  IF COALESCE(c.is_ecom_dtc_agency, false) OR lower(COALESCE(co.e_commerce_presence,'')) = 'yes' OR lower(COALESCE(co.d2c_presence,'')) = 'yes' THEN
    fit := fit + 5; f := f || '{"ecom_dtc":5}';
  END IF;

  IF COALESCE(c.marketing_team_exists, COALESCE(co.marketing_team_exists, false)) THEN fit := fit + 5; f := f || '{"marketing_team":5}'; END IF;
  IF fit > 30 THEN fit := 30; END IF;

  total := quality + behavior + fit;
  IF total > 100 THEN total := 100; END IF;

  breakdown := jsonb_build_object(
    'quality', quality, 'quality_detail', q,
    'behavior', behavior, 'behavior_detail', b,
    'fit', fit, 'fit_detail', f,
    'total', total
  );

  UPDATE public.company_contacts
  SET lead_score = total, lead_score_breakdown = breakdown, updated_at = now()
  WHERE id = p_contact_id;

  RETURN total;
END;
$function$;