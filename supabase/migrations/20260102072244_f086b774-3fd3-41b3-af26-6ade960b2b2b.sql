-- Create email_deliverability_tests table
CREATE TABLE public.email_deliverability_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'inbox_placement',
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB DEFAULT '{}',
  spam_score NUMERIC(3,2),
  inbox_placement TEXT,
  authentication_results JSONB DEFAULT '{}',
  warnings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create campaign_send_logs table for detailed logging
CREATE TABLE public.campaign_send_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  campaign_contact_id UUID NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT,
  message_id TEXT,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_deliverability_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_send_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_deliverability_tests
CREATE POLICY "Users can view own deliverability tests" 
ON public.email_deliverability_tests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deliverability tests" 
ON public.email_deliverability_tests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deliverability tests" 
ON public.email_deliverability_tests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deliverability tests" 
ON public.email_deliverability_tests 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for campaign_send_logs
CREATE POLICY "Users can view campaign send logs" 
ON public.campaign_send_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM campaigns 
  WHERE campaigns.id = campaign_send_logs.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Public can insert campaign send logs" 
ON public.campaign_send_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_deliverability_tests_user_id ON public.email_deliverability_tests(user_id);
CREATE INDEX idx_deliverability_tests_status ON public.email_deliverability_tests(status);
CREATE INDEX idx_campaign_send_logs_campaign_id ON public.campaign_send_logs(campaign_id);
CREATE INDEX idx_campaign_send_logs_event_type ON public.campaign_send_logs(event_type);
CREATE INDEX idx_campaign_send_logs_created_at ON public.campaign_send_logs(created_at DESC);