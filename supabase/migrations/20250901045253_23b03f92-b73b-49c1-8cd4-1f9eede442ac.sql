-- Create storage bucket for community photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-photos', 'community-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for community photos
CREATE POLICY "Community photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'community-photos');

CREATE POLICY "Authenticated users can upload community photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'community-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own community photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own community photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);