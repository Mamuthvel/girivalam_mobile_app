-- FIX 1: Drop the unauthorized policy exposing all user profiles
DROP POLICY IF EXISTS "Allow read role for authenticated" ON public.profiles;

-- FIX 2: Drop old insecure storage policies using profiles.role check
DROP POLICY IF EXISTS "Admin users can upload backups" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can view backups" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete backups" ON storage.objects;

-- FIX 2: Create secure storage policies using is_admin() function
CREATE POLICY "Admin users can upload backups"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'database-backups' 
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admin users can view backups"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'database-backups'
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admin users can delete backups"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'database-backups'
  AND public.is_admin(auth.uid())
);