-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  mobile_number TEXT,
  feedback_type TEXT NOT NULL DEFAULT 'suggestion',
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_public BOOLEAN NOT NULL DEFAULT false,
  device_type TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback (anonymous friendly)
CREATE POLICY "Anyone can submit feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);

-- Public feedback is viewable by everyone
CREATE POLICY "Public feedback is viewable by everyone"
ON public.feedback
FOR SELECT
USING (is_public = true);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.feedback
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update feedback
CREATE POLICY "Admins can update feedback"
ON public.feedback
FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete feedback
CREATE POLICY "Admins can delete feedback"
ON public.feedback
FOR DELETE
USING (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX idx_feedback_is_public ON public.feedback(is_public) WHERE is_public = true;