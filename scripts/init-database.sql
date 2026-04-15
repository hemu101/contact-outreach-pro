-- Core Tables for Contact Outreach Pro
-- This script creates all necessary tables for the application

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Business Details Table
CREATE TABLE IF NOT EXISTS business_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_name TEXT,
  phone TEXT,
  billing_address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  business_name TEXT,
  job_title TEXT,
  location TEXT,
  city TEXT,
  instagram TEXT,
  tiktok TEXT,
  linkedin TEXT,
  company_linkedin TEXT,
  company_size TEXT,
  industry TEXT,
  company_website TEXT,
  enrichment_status TEXT,
  last_enriched_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  score NUMERIC,
  tags TEXT[],
  notes TEXT,
  custom_fields JSONB,
  source TEXT,
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  html_content TEXT,
  category TEXT,
  tags TEXT[],
  is_favourite BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  template_id UUID REFERENCES templates(id),
  status TEXT,
  total_contacts INTEGER,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  use_recipient_timezone BOOLEAN DEFAULT FALSE,
  optimal_send_hour INTEGER,
  ab_testing_enabled BOOLEAN DEFAULT FALSE,
  variant_a_subject TEXT,
  variant_a_content TEXT,
  variant_a_sent INTEGER DEFAULT 0,
  variant_a_opens INTEGER DEFAULT 0,
  variant_a_clicks INTEGER DEFAULT 0,
  variant_b_subject TEXT,
  variant_b_content TEXT,
  variant_b_sent INTEGER DEFAULT 0,
  variant_b_opens INTEGER DEFAULT 0,
  variant_b_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- Campaign Contacts Table
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_type TEXT,
  error_message TEXT,
  variant TEXT
);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_contact_id ON campaign_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON campaign_contacts(status);

-- Email Events Table
CREATE TABLE IF NOT EXISTS email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_contact_id UUID REFERENCES campaign_contacts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  event_type TEXT NOT NULL,
  status TEXT,
  ip_address TEXT,
  user_agent TEXT,
  message_id TEXT,
  provider TEXT,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_campaign_id ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at DESC);

-- Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL,
  action_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON automation_rules(is_active);

-- Automation Logs Table
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rule_id UUID REFERENCES automation_rules(id),
  contact_id UUID REFERENCES contacts(id),
  trigger_data JSONB,
  action_result JSONB,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_user_id ON automation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule_id ON automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at DESC);

-- Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_name ON audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at DESC);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Activity Logs RLS
CREATE POLICY "Users can view their own activity logs" 
  ON activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs" 
  ON activity_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Business Details RLS
CREATE POLICY "Users can view their own business details" 
  ON business_details FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business details" 
  ON business_details FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business details" 
  ON business_details FOR UPDATE 
  USING (auth.uid() = user_id);

-- Contacts RLS
CREATE POLICY "Users can view their own contacts" 
  ON contacts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" 
  ON contacts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
  ON contacts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
  ON contacts FOR DELETE 
  USING (auth.uid() = user_id);

-- Templates RLS
CREATE POLICY "Users can view their own templates" 
  ON templates FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" 
  ON templates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
  ON templates FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
  ON templates FOR DELETE 
  USING (auth.uid() = user_id);

-- Campaigns RLS
CREATE POLICY "Users can view their own campaigns" 
  ON campaigns FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" 
  ON campaigns FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
  ON campaigns FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
  ON campaigns FOR DELETE 
  USING (auth.uid() = user_id);

-- Campaign Contacts RLS
CREATE POLICY "Users can view campaign contacts for their campaigns" 
  ON campaign_contacts FOR SELECT 
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaign contacts for their campaigns" 
  ON campaign_contacts FOR INSERT 
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaign contacts for their campaigns" 
  ON campaign_contacts FOR UPDATE 
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE campaigns.user_id = auth.uid()
    )
  );

-- Email Events RLS
CREATE POLICY "Users can view email events for their campaigns" 
  ON email_events FOR SELECT 
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE campaigns.user_id = auth.uid()
    )
  );

-- Automation Rules RLS
CREATE POLICY "Users can view their own automation rules" 
  ON automation_rules FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automation rules" 
  ON automation_rules FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation rules" 
  ON automation_rules FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automation rules" 
  ON automation_rules FOR DELETE 
  USING (auth.uid() = user_id);

-- Automation Logs RLS
CREATE POLICY "Users can view their own automation logs" 
  ON automation_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- Audit Trail RLS
CREATE POLICY "Users can view their own audit trail" 
  ON audit_trail FOR SELECT 
  USING (auth.uid() = user_id);
