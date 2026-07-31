-- Create a table for solo journey history
CREATE TABLE public.solo_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Journey metrics
  distance_km NUMERIC NOT NULL DEFAULT 0,
  steps_count INTEGER NOT NULL DEFAULT 0,
  time_elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  
  -- Progress tracking
  girivalam_progress NUMERIC NOT NULL DEFAULT 0,
  girivalam_completed BOOLEAN NOT NULL DEFAULT false,
  
  -- Path history (stored as JSON array of {lat, lng} points)
  path_history JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Session identifier for resuming
  session_id TEXT NOT NULL,
  
  -- Status: active, paused, completed, abandoned
  status TEXT NOT NULL DEFAULT 'active'
);

-- Enable Row Level Security
ALTER TABLE public.solo_journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own solo journeys" 
ON public.solo_journeys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own solo journeys" 
ON public.solo_journeys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own solo journeys" 
ON public.solo_journeys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own solo journeys" 
ON public.solo_journeys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all solo journeys
CREATE POLICY "Admins can view all solo journeys"
ON public.solo_journeys
FOR SELECT
USING (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_solo_journeys_user_id ON public.solo_journeys(user_id);
CREATE INDEX idx_solo_journeys_status ON public.solo_journeys(status);
CREATE INDEX idx_solo_journeys_started_at ON public.solo_journeys(started_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_solo_journeys_updated_at
BEFORE UPDATE ON public.solo_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();