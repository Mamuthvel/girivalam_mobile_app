-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view service images (public bucket)
CREATE POLICY "Service images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

-- Allow authenticated admins to upload service images
CREATE POLICY "Admins can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-images' 
  AND public.is_admin(auth.uid())
);

-- Allow authenticated admins to update service images
CREATE POLICY "Admins can update service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND public.is_admin(auth.uid())
);

-- Allow authenticated admins to delete service images
CREATE POLICY "Admins can delete service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND public.is_admin(auth.uid())
);