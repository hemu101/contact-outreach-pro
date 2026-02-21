
-- LinkedIn Leads table
CREATE TABLE public.linkedin_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  linkedin_url TEXT NOT NULL,
  company_name TEXT,
  first_name TEXT,
  last_name TEXT,
  headline TEXT,
  location TEXT,
  about TEXT,
  profile_image_url TEXT,
  working_status TEXT DEFAULT 'UNPROCESSED',
  experience JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  scraped_data JSONB DEFAULT '{}'::jsonb,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.linkedin_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.linkedin_leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.linkedin_leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.linkedin_leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.linkedin_leads FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_linkedin_leads_user ON public.linkedin_leads(user_id);
CREATE INDEX idx_linkedin_leads_status ON public.linkedin_leads(working_status);

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  linkedin_url TEXT,
  industry TEXT,
  size TEXT,
  headquarters TEXT,
  description TEXT,
  founded TEXT,
  specialties TEXT[],
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  employee_count INTEGER,
  annual_revenue TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own companies" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own companies" ON public.companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own companies" ON public.companies FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_companies_user ON public.companies(user_id);
CREATE INDEX idx_companies_industry ON public.companies(industry);
