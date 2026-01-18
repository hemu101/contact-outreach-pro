-- Update function to include sample DM templates for Instagram, TikTok, and LinkedIn
CREATE OR REPLACE FUNCTION public.create_sample_templates_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert sample email templates for the new user
  INSERT INTO public.templates (user_id, name, subject, content, type) VALUES
  (
    NEW.id,
    'Welcome Introduction',
    'Quick intro from {{company_name}}',
    'Hi {{first_name}},

I noticed your work at {{business_name}} and wanted to reach out.

We help companies like yours streamline their outreach and boost response rates by up to 40%.

Would you be open to a quick 15-minute call this week to see if we could help?

Best regards,
{{sender_name}}',
    'email'
  ),
  (
    NEW.id,
    'Follow-Up Nudge',
    'Following up on my last email',
    'Hi {{first_name}},

I wanted to follow up on my previous email. I understand you''re busy, so I''ll keep this brief.

If improving your outreach results is a priority right now, I''d love to share some quick wins we''ve seen with similar companies.

Just reply "interested" and I''ll send over some details.

Thanks,
{{sender_name}}',
    'email'
  ),
  (
    NEW.id,
    'Value Proposition',
    '{{first_name}}, quick question about {{business_name}}',
    'Hi {{first_name}},

I''ve been following {{business_name}} and I''m impressed with what you''re building.

I''m curious - are you currently looking to:
• Increase email open rates?
• Improve response rates on cold outreach?
• Save time on manual follow-ups?

If any of these resonate, I''d love to show you how we''ve helped similar companies achieve 3x better results.

Let me know if you''d like to chat!

{{sender_name}}',
    'email'
  ),
  (
    NEW.id,
    'Meeting Request',
    'Can we schedule a quick call, {{first_name}}?',
    'Hi {{first_name}},

I hope this email finds you well!

I''d love to schedule a brief 15-minute call to discuss how we might be able to help {{business_name}} with your outreach goals.

Are you available any of these times?
• Tuesday at 2pm
• Wednesday at 10am
• Thursday at 3pm

Feel free to suggest a time that works better for you.

Looking forward to connecting,
{{sender_name}}',
    'email'
  ),
  (
    NEW.id,
    'Breakup Email',
    'Should I close your file?',
    'Hi {{first_name}},

I''ve reached out a few times but haven''t heard back, so I''m assuming the timing isn''t right.

No worries at all - I''ll close out your file for now.

If things change in the future and you''d like to explore how we can help {{business_name}}, just reply to this email.

Wishing you all the best,
{{sender_name}}',
    'email'
  ),
  -- Instagram DM Templates
  (
    NEW.id,
    'Instagram - Collab Request',
    NULL,
    'Hey {{handle}}! 👋

Love your content on {{platform}} - especially your recent posts! I''m reaching out from {{company_name}}.

We''re working with creators like you ({{followers}} followers is impressive!) and would love to explore a potential collaboration.

Would you be open to a quick chat about a partnership opportunity?',
    'instagram'
  ),
  (
    NEW.id,
    'Instagram - Follow-Up',
    NULL,
    'Hey {{handle}}! 

Just wanted to follow up on my previous message. I know DMs can get buried! 😅

Would love to discuss a potential collaboration with {{company_name}}. Let me know if you''re interested!',
    'instagram'
  ),
  (
    NEW.id,
    'Instagram - Quick Intro',
    NULL,
    'Hi {{first_name}}! 👋

Came across your profile and love what you''re building at {{business_name}}!

I help businesses like yours grow their reach. Would you be open to connecting?',
    'instagram'
  ),
  -- TikTok DM Templates
  (
    NEW.id,
    'TikTok - Creator Outreach',
    NULL,
    'Hey {{handle}}! 🎬

Your TikTok content is 🔥! We''ve been following your growth to {{followers}} followers.

We''re looking for creators to partner with on an upcoming campaign. Interested in hearing more?',
    'tiktok'
  ),
  (
    NEW.id,
    'TikTok - Brand Collab',
    NULL,
    'Hi {{first_name}}! 

We love your creative style on TikTok! {{company_name}} is looking for creators like you for a paid collaboration.

Drop a reply if you''d like to hear the details! 🙌',
    'tiktok'
  ),
  -- LinkedIn DM Templates
  (
    NEW.id,
    'LinkedIn - Professional Intro',
    NULL,
    'Hi {{first_name}},

I came across your profile and was impressed by your work at {{business_name}}.

I''m reaching out because I believe there could be a great synergy between our companies. Would you be open to a brief conversation?

Best regards,
{{sender_name}}',
    'linkedin'
  ),
  (
    NEW.id,
    'LinkedIn - Networking Request',
    NULL,
    'Hello {{first_name}},

I noticed we share some mutual connections and interests in our industry.

I''d love to connect and potentially explore ways we could collaborate or share insights. Looking forward to connecting!

{{sender_name}}',
    'linkedin'
  ),
  (
    NEW.id,
    'LinkedIn - Follow-Up',
    NULL,
    'Hi {{first_name}},

I wanted to follow up on my previous message. I understand you''re busy, so I''ll keep this brief.

If {{business_name}} is looking to expand its outreach capabilities, I''d love to share how we''ve helped similar companies.

Best,
{{sender_name}}',
    'linkedin'
  );
  
  RETURN NEW;
END;
$$;