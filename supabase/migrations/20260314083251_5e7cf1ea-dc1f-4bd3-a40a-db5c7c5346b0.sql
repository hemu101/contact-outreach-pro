
-- Add credential columns to social_accounts for DM automation
ALTER TABLE public.social_accounts 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS api_key TEXT,
ADD COLUMN IF NOT EXISTS cookies TEXT,
ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'session_cookie',
ADD COLUMN IF NOT EXISTS proxy_url TEXT,
ADD COLUMN IF NOT EXISTS last_tested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS test_status TEXT;

-- Add extra fields to team_members
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT now();
