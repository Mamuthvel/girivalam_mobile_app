-- Create storage bucket for sacred audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('sacred-audio', 'sacred-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Admins can upload/manage audio files
CREATE POLICY "Admins can upload sacred audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sacred-audio' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can update sacred audio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sacred-audio' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can delete sacred audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sacred-audio' 
  AND is_admin(auth.uid())
);

-- Public can read/play audio files
CREATE POLICY "Public can view sacred audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'sacred-audio');

-- Add audio_type to mantra_audio to distinguish between linga and chant audio
ALTER TABLE public.mantra_audio 
ADD COLUMN IF NOT EXISTS audio_type text DEFAULT 'chant' CHECK (audio_type IN ('linga', 'chant'));

-- Add linga_id for linking to specific lingams (1-8 for Ashta Lingam)
ALTER TABLE public.mantra_audio 
ADD COLUMN IF NOT EXISTS linga_id integer CHECK (linga_id >= 1 AND linga_id <= 8);

-- Add file_size and file_format for admin display
ALTER TABLE public.mantra_audio 
ADD COLUMN IF NOT EXISTS file_size bigint;

ALTER TABLE public.mantra_audio 
ADD COLUMN IF NOT EXISTS file_format text;

-- Create unique constraint to ensure one audio per linga
CREATE UNIQUE INDEX IF NOT EXISTS unique_linga_audio 
ON public.mantra_audio (linga_id) 
WHERE linga_id IS NOT NULL AND audio_type = 'linga';

-- Update RLS policies for mantra_audio
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage mantra audio" ON public.mantra_audio;

-- Only admins can manage audio
CREATE POLICY "Admins can manage mantra audio"
ON public.mantra_audio FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));