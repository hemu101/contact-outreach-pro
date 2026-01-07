-- Create social_accounts table for managing multiple DM accounts with scheduling
CREATE TABLE public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'rate_limited', 'error')),
  daily_limit INTEGER NOT NULL DEFAULT 50,
  messages_sent_today INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  send_delay_min INTEGER NOT NULL DEFAULT 30,
  send_delay_max INTEGER NOT NULL DEFAULT 120,
  active_hours_start INTEGER NOT NULL DEFAULT 9,
  active_hours_end INTEGER NOT NULL DEFAULT 21,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own social accounts"
ON public.social_accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social accounts"
ON public.social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts"
ON public.social_accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts"
ON public.social_accounts FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_social_accounts_user_platform ON public.social_accounts(user_id, platform);
CREATE INDEX idx_social_accounts_status ON public.social_accounts(status);

-- Create timezone lookup table for country-based detection
CREATE TABLE public.country_timezones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  utc_offset INTEGER NOT NULL
);

-- Insert common country timezone mappings
INSERT INTO public.country_timezones (country_code, country_name, timezone, utc_offset) VALUES
('US', 'United States', 'America/New_York', -5),
('CA', 'Canada', 'America/Toronto', -5),
('GB', 'United Kingdom', 'Europe/London', 0),
('AU', 'Australia', 'Australia/Sydney', 11),
('DE', 'Germany', 'Europe/Berlin', 1),
('FR', 'France', 'Europe/Paris', 1),
('JP', 'Japan', 'Asia/Tokyo', 9),
('CN', 'China', 'Asia/Shanghai', 8),
('IN', 'India', 'Asia/Kolkata', 5),
('BR', 'Brazil', 'America/Sao_Paulo', -3),
('MX', 'Mexico', 'America/Mexico_City', -6),
('ES', 'Spain', 'Europe/Madrid', 1),
('IT', 'Italy', 'Europe/Rome', 1),
('NL', 'Netherlands', 'Europe/Amsterdam', 1),
('SE', 'Sweden', 'Europe/Stockholm', 1),
('NO', 'Norway', 'Europe/Oslo', 1),
('DK', 'Denmark', 'Europe/Copenhagen', 1),
('FI', 'Finland', 'Europe/Helsinki', 2),
('PL', 'Poland', 'Europe/Warsaw', 1),
('RU', 'Russia', 'Europe/Moscow', 3),
('KR', 'South Korea', 'Asia/Seoul', 9),
('SG', 'Singapore', 'Asia/Singapore', 8),
('NZ', 'New Zealand', 'Pacific/Auckland', 13),
('ZA', 'South Africa', 'Africa/Johannesburg', 2),
('AE', 'United Arab Emirates', 'Asia/Dubai', 4),
('SA', 'Saudi Arabia', 'Asia/Riyadh', 3),
('TH', 'Thailand', 'Asia/Bangkok', 7),
('ID', 'Indonesia', 'Asia/Jakarta', 7),
('PH', 'Philippines', 'Asia/Manila', 8),
('VN', 'Vietnam', 'Asia/Ho_Chi_Minh', 7);

-- Enable RLS on country_timezones (public read)
ALTER TABLE public.country_timezones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Country timezones are readable by authenticated users"
ON public.country_timezones FOR SELECT TO authenticated USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_social_accounts_updated_at
BEFORE UPDATE ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();