-- Add new columns to contacts table for additional fields
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS country text;

-- Create email_settings table for storing SMTP configuration
CREATE TABLE IF NOT EXISTS public.email_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  smtp_host text,
  smtp_port text DEFAULT '587',
  smtp_user text,
  smtp_password text,
  sendgrid_key text,
  brevo_api_key text,
  twilio_sid text,
  twilio_token text,
  twilio_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_settings
CREATE POLICY "Users can view own email settings" 
ON public.email_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email settings" 
ON public.email_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email settings" 
ON public.email_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email settings" 
ON public.email_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_settings_updated_at
BEFORE UPDATE ON public.email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();