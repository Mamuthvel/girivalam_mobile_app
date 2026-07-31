
-- Unique constraint so reminder upserts work
ALTER TABLE public.annadhanam_reminders
  DROP CONSTRAINT IF EXISTS annadhanam_reminders_unique_slot;
ALTER TABLE public.annadhanam_reminders
  ADD CONSTRAINT annadhanam_reminders_unique_slot
  UNIQUE (user_id, listing_id, occurrence_date, occurrence_time);

-- Storage RLS on annadhanam-photos (private bucket) - allow authenticated users to upload/read
DROP POLICY IF EXISTS "Authenticated can upload annadhanam photos" ON storage.objects;
CREATE POLICY "Authenticated can upload annadhanam photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'annadhanam-photos');

DROP POLICY IF EXISTS "Authenticated can read annadhanam photos" ON storage.objects;
CREATE POLICY "Authenticated can read annadhanam photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'annadhanam-photos');

DROP POLICY IF EXISTS "Admins manage annadhanam photos" ON storage.objects;
CREATE POLICY "Admins manage annadhanam photos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'annadhanam-photos' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'annadhanam-photos' AND public.is_admin(auth.uid()));
