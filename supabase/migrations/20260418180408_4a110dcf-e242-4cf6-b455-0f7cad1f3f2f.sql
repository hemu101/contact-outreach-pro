-- Email OTP codes for custom verification (replaces Supabase magic link)
CREATE TABLE IF NOT EXISTS public.email_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  purpose text NOT NULL DEFAULT 'signup', -- signup | login | reset
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  consumed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_email_otp_codes_email ON public.email_otp_codes (lower(email), expires_at DESC);

ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;

-- Restrict direct table access. All access must go through edge functions (service role).
CREATE POLICY "no direct read otp" ON public.email_otp_codes FOR SELECT USING (false);
CREATE POLICY "no direct write otp" ON public.email_otp_codes FOR ALL USING (false) WITH CHECK (false);

-- People discovery jobs (LeadIQ-style finder)
CREATE TABLE IF NOT EXISTS public.people_discovery_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  input_url text NOT NULL,
  company_id uuid,
  status text NOT NULL DEFAULT 'pending',
  sources_used text[] DEFAULT '{}',
  results jsonb DEFAULT '[]'::jsonb,
  result_count int DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.people_discovery_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see their discovery jobs" ON public.people_discovery_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users create their discovery jobs" ON public.people_discovery_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update their discovery jobs" ON public.people_discovery_jobs FOR UPDATE USING (auth.uid() = user_id);

-- Cleanup expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.email_otp_codes WHERE expires_at < now() - interval '1 day';
$$;