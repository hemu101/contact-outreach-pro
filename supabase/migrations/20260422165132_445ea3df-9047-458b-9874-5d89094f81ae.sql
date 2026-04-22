ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS channel_config jsonb NOT NULL DEFAULT '{}'::jsonb;