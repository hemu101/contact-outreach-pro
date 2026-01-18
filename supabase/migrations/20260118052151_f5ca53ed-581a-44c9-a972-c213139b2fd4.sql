-- Create campaign_templates table
CREATE TABLE public.campaign_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Sales',
  steps INTEGER DEFAULT 1,
  sequence_data JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own campaign templates" 
ON public.campaign_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaign templates" 
ON public.campaign_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign templates" 
ON public.campaign_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaign templates" 
ON public.campaign_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_campaign_templates_updated_at
BEFORE UPDATE ON public.campaign_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the sample templates function to include campaign templates
CREATE OR REPLACE FUNCTION public.create_sample_templates_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert sample email templates
  INSERT INTO public.templates (user_id, name, subject, content, type) VALUES
  (NEW.id, 'Welcome Introduction', 'Quick intro from {{company_name}}', 'Hi {{first_name}},

I noticed your work at {{business_name}} and wanted to reach out.

We help companies like yours streamline their outreach and boost response rates by up to 40%.

Would you be open to a quick 15-minute call this week to see if we could help?

Best regards,
{{sender_name}}', 'email'),
  (NEW.id, 'Follow-Up Nudge', 'Following up on my last email', 'Hi {{first_name}},

I wanted to follow up on my previous email. I understand you''re busy, so I''ll keep this brief.

If improving your outreach results is a priority right now, I''d love to share some quick wins we''ve seen with similar companies.

Just reply "interested" and I''ll send over some details.

Thanks,
{{sender_name}}', 'email'),
  (NEW.id, 'Value Proposition', '{{first_name}}, quick question about {{business_name}}', 'Hi {{first_name}},

I''ve been following {{business_name}} and I''m impressed with what you''re building.

I''m curious - are you currently looking to:
• Increase email open rates?
• Improve response rates on cold outreach?
• Save time on manual follow-ups?

If any of these resonate, I''d love to show you how we''ve helped similar companies achieve 3x better results.

Let me know if you''d like to chat!

{{sender_name}}', 'email'),
  (NEW.id, 'Meeting Request', 'Can we schedule a quick call, {{first_name}}?', 'Hi {{first_name}},

I hope this email finds you well!

I''d love to schedule a brief 15-minute call to discuss how we might be able to help {{business_name}} with your outreach goals.

Are you available any of these times?
• Tuesday at 2pm
• Wednesday at 10am
• Thursday at 3pm

Feel free to suggest a time that works better for you.

Looking forward to connecting,
{{sender_name}}', 'email'),
  (NEW.id, 'Breakup Email', 'Should I close your file?', 'Hi {{first_name}},

I''ve reached out a few times but haven''t heard back, so I''m assuming the timing isn''t right.

No worries at all - I''ll close out your file for now.

If things change in the future and you''d like to explore how we can help {{business_name}}, just reply to this email.

Wishing you all the best,
{{sender_name}}', 'email'),
  -- Instagram DM templates
  (NEW.id, 'Instagram Introduction', NULL, 'Hey {{first_name}}! 👋

Love what you''re doing with {{business_name}}! Your content is 🔥

I help businesses like yours grow their reach - would love to connect and share some ideas.

Open to a quick chat?', 'instagram'),
  (NEW.id, 'Instagram Collaboration', NULL, 'Hi {{first_name}}! 

Been following your page for a while - really impressive work! 

I think there could be a great collab opportunity between us. Would you be interested in exploring?

Let me know! 🙌', 'instagram'),
  (NEW.id, 'Instagram Follow-Up', NULL, 'Hey {{first_name}}! 

Just wanted to follow up on my last message. I know DMs can get buried!

Still interested in connecting if you are. No pressure either way 😊', 'instagram'),
  -- TikTok DM templates
  (NEW.id, 'TikTok Creator Outreach', NULL, 'Hey {{first_name}}! 🎬

Your TikToks are seriously impressive - especially the {{business_name}} content!

We''re looking for creators to partner with. Interested in hearing more?', 'tiktok'),
  (NEW.id, 'TikTok Brand Partnership', NULL, 'Hi {{first_name}}! ✨

Love your creative style! We think you''d be a perfect fit for our brand.

Would you be open to discussing a paid partnership?

Let me know! 🚀', 'tiktok'),
  -- LinkedIn DM templates
  (NEW.id, 'LinkedIn Professional Intro', NULL, 'Hi {{first_name}},

I came across your profile and was impressed by your work at {{business_name}}.

I specialize in helping professionals like yourself with [specific value]. Would you be open to connecting?

Best regards', 'linkedin'),
  (NEW.id, 'LinkedIn Networking', NULL, 'Hi {{first_name}},

I noticed we share some mutual connections and similar professional interests.

I''d love to add you to my network and perhaps exchange insights on {{industry}}.

Looking forward to connecting!', 'linkedin'),
  (NEW.id, 'LinkedIn Business Development', NULL, 'Hi {{first_name}},

I''ve been following {{business_name}}''s growth - impressive trajectory!

I work with companies in your space and thought there might be some synergies worth exploring.

Would you be open to a brief conversation?

Best,
{{sender_name}}', 'linkedin');

  -- Insert sample campaign templates
  INSERT INTO public.campaign_templates (user_id, name, description, category, steps, featured, sequence_data) VALUES
  (NEW.id, 'Cold Outreach - SaaS', 'Multi-step sequence for B2B SaaS companies', 'Sales', 5, true, 
   '[{"step": 1, "type": "email", "delay": 0, "subject": "Quick intro"}, {"step": 2, "type": "email", "delay": 3, "subject": "Follow-up"}, {"step": 3, "type": "linkedin", "delay": 5}, {"step": 4, "type": "email", "delay": 7, "subject": "Value prop"}, {"step": 5, "type": "email", "delay": 10, "subject": "Breakup"}]'::jsonb),
  (NEW.id, 'Link Building Outreach', 'Perfect for SEO and content marketing teams', 'Marketing', 3, false,
   '[{"step": 1, "type": "email", "delay": 0, "subject": "Content collaboration"}, {"step": 2, "type": "email", "delay": 4, "subject": "Follow-up"}, {"step": 3, "type": "email", "delay": 7, "subject": "Final check-in"}]'::jsonb),
  (NEW.id, 'Influencer Outreach', 'Connect with influencers for brand collaborations', 'Marketing', 4, true,
   '[{"step": 1, "type": "instagram", "delay": 0}, {"step": 2, "type": "email", "delay": 2, "subject": "Partnership opportunity"}, {"step": 3, "type": "instagram", "delay": 5}, {"step": 4, "type": "email", "delay": 8, "subject": "Closing the loop"}]'::jsonb),
  (NEW.id, 'Product Launch', 'Announce your new product to prospects', 'Sales', 6, false,
   '[{"step": 1, "type": "email", "delay": 0, "subject": "Exciting news!"}, {"step": 2, "type": "linkedin", "delay": 1}, {"step": 3, "type": "email", "delay": 3, "subject": "Early access"}, {"step": 4, "type": "email", "delay": 5, "subject": "Demo offer"}, {"step": 5, "type": "email", "delay": 8, "subject": "Last chance"}, {"step": 6, "type": "email", "delay": 12, "subject": "Final reminder"}]'::jsonb);

  RETURN NEW;
END;
$$;