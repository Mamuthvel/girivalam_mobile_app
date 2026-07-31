-- Create group chat messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'location', 'system'
  metadata JSONB DEFAULT '{}', -- For storing location data, system message info, etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX idx_group_messages_created_at ON public.group_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for group messages
CREATE POLICY "Group members can view messages in their groups" 
ON public.group_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_messages.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.is_active = true
  )
);

CREATE POLICY "Group members can send messages to their groups" 
ON public.group_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_messages.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.is_active = true
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.group_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.group_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create live locations table for real-time tracking
CREATE TABLE public.live_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy NUMERIC,
  heading NUMERIC,
  speed NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index for user-group pair (one location per user per group)
CREATE UNIQUE INDEX idx_live_locations_user_group ON public.live_locations(user_id, group_id);

-- Enable Row Level Security
ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for live locations
CREATE POLICY "Group members can view locations in their groups" 
ON public.live_locations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = live_locations.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.is_active = true
  )
);

CREATE POLICY "Users can update their own location" 
ON public.live_locations 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = live_locations.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.is_active = true
  )
);

CREATE POLICY "Users can update their own location data" 
ON public.live_locations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add realtime for both tables
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

ALTER TABLE public.live_locations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_locations;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_group_messages_updated_at
BEFORE UPDATE ON public.group_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_live_locations_updated_at
BEFORE UPDATE ON public.live_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();