-- Create table for mantra audio files
CREATE TABLE public.mantra_audio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mantra_id TEXT NOT NULL UNIQUE,
  mantra_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'sanskrit',
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mantra_audio ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Mantra audio is viewable by everyone" 
ON public.mantra_audio 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to manage audio
CREATE POLICY "Authenticated users can manage mantra audio" 
ON public.mantra_audio 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mantra_audio_updated_at
BEFORE UPDATE ON public.mantra_audio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mantra-audio', 'mantra-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for audio uploads
CREATE POLICY "Mantra audio files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mantra-audio');

CREATE POLICY "Authenticated users can upload mantra audio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'mantra-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update mantra audio" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'mantra-audio' AND auth.uid() IS NOT NULL);