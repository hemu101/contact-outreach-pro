
-- Expand companies table with additional org-level columns
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS company_name_for_emails text,
  ADD COLUMN IF NOT EXISTS company_phone text,
  ADD COLUMN IF NOT EXISTS phone_from_website text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS company_linkedin_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS pinterest_url text,
  ADD COLUMN IF NOT EXISTS company_city text,
  ADD COLUMN IF NOT EXISTS company_state text,
  ADD COLUMN IF NOT EXISTS company_country text,
  ADD COLUMN IF NOT EXISTS company_address text,
  ADD COLUMN IF NOT EXISTS technologies text,
  ADD COLUMN IF NOT EXISTS keywords text,
  ADD COLUMN IF NOT EXISTS total_funding text,
  ADD COLUMN IF NOT EXISTS latest_funding text,
  ADD COLUMN IF NOT EXISTS latest_funding_amount text,
  ADD COLUMN IF NOT EXISTS subsidiary_of text,
  ADD COLUMN IF NOT EXISTS number_of_retail_locations text,
  ADD COLUMN IF NOT EXISTS extracted_from text,
  ADD COLUMN IF NOT EXISTS website_status text,
  ADD COLUMN IF NOT EXISTS d2c_presence text,
  ADD COLUMN IF NOT EXISTS e_commerce_presence text,
  ADD COLUMN IF NOT EXISTS social_media_presence text,
  ADD COLUMN IF NOT EXISTS integrated_videos text,
  ADD COLUMN IF NOT EXISTS integrated_video_urls text,
  ADD COLUMN IF NOT EXISTS ig_username text,
  ADD COLUMN IF NOT EXISTS ig_bio text,
  ADD COLUMN IF NOT EXISTS ig_followers_count text,
  ADD COLUMN IF NOT EXISTS total_post_in_3_months text,
  ADD COLUMN IF NOT EXISTS average_er text,
  ADD COLUMN IF NOT EXISTS total_collaborations text,
  ADD COLUMN IF NOT EXISTS ugc_example text,
  ADD COLUMN IF NOT EXISTS worked_with_creators text,
  ADD COLUMN IF NOT EXISTS hashtags text,
  ADD COLUMN IF NOT EXISTS mentions text,
  ADD COLUMN IF NOT EXISTS segmentation text,
  ADD COLUMN IF NOT EXISTS firmographic_score text,
  ADD COLUMN IF NOT EXISTS engagement_score text,
  ADD COLUMN IF NOT EXISTS ad_library_proof text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS extra_data jsonb DEFAULT '{}'::jsonb;

-- Create company_contacts table for person-level data
CREATE TABLE IF NOT EXISTS public.company_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  seniority text,
  departments text,
  title text,
  email text,
  secondary_email text,
  email_from_website text,
  work_direct_phone text,
  home_phone text,
  mobile_phone text,
  corporate_phone text,
  other_phone text,
  person_linkedin_url text,
  city text,
  state text,
  country text,
  job_tracking_link text,
  hiring_job_title text,
  salary_estimated text,
  job_location text,
  linkedin_job_link text,
  linkedin_job_title text,
  job_basedon text,
  mql text,
  sql_status text,
  ig_score text,
  notes_for_sdr text,
  notes_for_data text,
  date_of_filtration text,
  extra_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for company_contacts
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company contacts" ON public.company_contacts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company contacts" ON public.company_contacts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company contacts" ON public.company_contacts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company contacts" ON public.company_contacts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_company_contacts_updated_at
  BEFORE UPDATE ON public.company_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
