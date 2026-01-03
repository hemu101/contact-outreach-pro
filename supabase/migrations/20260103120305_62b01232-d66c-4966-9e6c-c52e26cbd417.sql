-- Create follow-up sequences table
CREATE TABLE public.follow_up_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'opened_not_clicked',
  delay_hours INTEGER NOT NULL DEFAULT 24,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create follow-up queue for pending follow-ups
CREATE TABLE public.follow_up_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.follow_up_sequences(id) ON DELETE CASCADE,
  campaign_contact_id UUID NOT NULL REFERENCES public.campaign_contacts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follow_up_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_queue ENABLE ROW LEVEL SECURITY;

-- RLS for follow_up_sequences
CREATE POLICY "Users can view own sequences" ON public.follow_up_sequences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sequences" ON public.follow_up_sequences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sequences" ON public.follow_up_sequences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sequences" ON public.follow_up_sequences
  FOR DELETE USING (auth.uid() = user_id);

-- RLS for follow_up_queue
CREATE POLICY "Users can view own queue items" ON public.follow_up_queue
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM follow_up_sequences fs
    WHERE fs.id = follow_up_queue.sequence_id AND fs.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert queue items" ON public.follow_up_queue
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM follow_up_sequences fs
    WHERE fs.id = follow_up_queue.sequence_id AND fs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update queue items" ON public.follow_up_queue
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM follow_up_sequences fs
    WHERE fs.id = follow_up_queue.sequence_id AND fs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete queue items" ON public.follow_up_queue
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM follow_up_sequences fs
    WHERE fs.id = follow_up_queue.sequence_id AND fs.user_id = auth.uid()
  ));

-- Enable realtime for campaign_contacts
ALTER TABLE public.campaign_contacts REPLICA IDENTITY FULL;

-- Indexes for performance
CREATE INDEX idx_follow_up_queue_scheduled ON public.follow_up_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_follow_up_queue_sequence ON public.follow_up_queue(sequence_id);
CREATE INDEX idx_follow_up_sequences_campaign ON public.follow_up_sequences(campaign_id);