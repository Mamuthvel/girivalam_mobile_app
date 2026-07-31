
-- ===== TRUSTS =====
CREATE TABLE public.annadhanam_trusts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_name text NOT NULL,
  organization_name text,
  organizer_name text,
  mobile text,
  whatsapp text,
  email text,
  bio text,
  description text,
  mission text,
  founder text,
  history text,
  logo_url text,
  photos text[] DEFAULT '{}',
  website text,
  social_media jsonb DEFAULT '{}'::jsonb,
  donation_details jsonb DEFAULT '{}'::jsonb,
  is_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  rejection_reason text,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.annadhanam_trusts TO authenticated;
GRANT ALL ON public.annadhanam_trusts TO service_role;
ALTER TABLE public.annadhanam_trusts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trusts_read_approved" ON public.annadhanam_trusts
  FOR SELECT TO authenticated
  USING (status = 'approved' OR submitted_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "trusts_insert_own" ON public.annadhanam_trusts
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "trusts_update_own_pending" ON public.annadhanam_trusts
  FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND status = 'pending')
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending');

CREATE POLICY "trusts_admin_all" ON public.annadhanam_trusts
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ===== LISTINGS =====
CREATE TABLE public.annadhanam_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_id uuid REFERENCES public.annadhanam_trusts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  landmark text,
  meal_types text[] DEFAULT '{}', -- breakfast, lunch, dinner, snacks, tea, water
  food_types text[] DEFAULT '{}', -- full_meals, lemon_rice, curd_rice, pongal, sweet, other
  food_menu text,
  estimated_capacity integer,
  remaining_availability integer,
  photos text[] DEFAULT '{}',
  -- Recurrence config (flexible):
  -- { frequency: 'one_time'|'daily'|'every_x_days'|'weekly'|'monthly'|'every_x_weeks'|'every_x_months'|'pournami'|'pradosham'|'festival'|'custom_dates',
  --   interval: int, weekdays: [0-6], month_days: [1-31], custom_dates: ['YYYY-MM-DD'],
  --   start_date: 'YYYY-MM-DD', end_date: 'YYYY-MM-DD'|null,
  --   time_slots: [{ start:'HH:MM', end:'HH:MM' }],
  --   exceptions: ['YYYY-MM-DD'], paused: bool }
  recurrence jsonb NOT NULL DEFAULT '{}'::jsonb,
  manual_status_override text, -- null | 'live' | 'completed' | 'upcoming' | 'cancelled'
  tags text[] DEFAULT '{}', -- pournami, pradosham, festival
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  rejection_reason text,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_annadhanam_listings_status ON public.annadhanam_listings(status, is_active);
CREATE INDEX idx_annadhanam_listings_trust ON public.annadhanam_listings(trust_id);
CREATE INDEX idx_annadhanam_listings_location ON public.annadhanam_listings(latitude, longitude);

GRANT SELECT, INSERT, UPDATE ON public.annadhanam_listings TO authenticated;
GRANT ALL ON public.annadhanam_listings TO service_role;
ALTER TABLE public.annadhanam_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_read_approved" ON public.annadhanam_listings
  FOR SELECT TO authenticated
  USING ((status = 'approved' AND is_active = true) OR submitted_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "listings_insert_own" ON public.annadhanam_listings
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "listings_update_own_pending" ON public.annadhanam_listings
  FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND status = 'pending')
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending');

CREATE POLICY "listings_admin_all" ON public.annadhanam_listings
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ===== VERIFICATIONS =====
CREATE TABLE public.annadhanam_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.annadhanam_listings(id) ON DELETE CASCADE,
  reported_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type text NOT NULL, -- confirm_active | report_completed | report_incorrect | photo_upload
  photo_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.annadhanam_verifications TO authenticated;
GRANT ALL ON public.annadhanam_verifications TO service_role;
ALTER TABLE public.annadhanam_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verifications_read_own_or_admin" ON public.annadhanam_verifications
  FOR SELECT TO authenticated
  USING (reported_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "verifications_insert_own" ON public.annadhanam_verifications
  FOR INSERT TO authenticated
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "verifications_admin_update" ON public.annadhanam_verifications
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ===== REMINDERS =====
CREATE TABLE public.annadhanam_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.annadhanam_listings(id) ON DELETE CASCADE,
  occurrence_date date NOT NULL,
  occurrence_time time,
  remind_before_minutes integer NOT NULL DEFAULT 30,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id, occurrence_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.annadhanam_reminders TO authenticated;
GRANT ALL ON public.annadhanam_reminders TO service_role;
ALTER TABLE public.annadhanam_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_own" ON public.annadhanam_reminders
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ===== updated_at triggers =====
CREATE TRIGGER trg_annadhanam_trusts_updated
  BEFORE UPDATE ON public.annadhanam_trusts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_annadhanam_listings_updated
  BEFORE UPDATE ON public.annadhanam_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_annadhanam_verifications_updated
  BEFORE UPDATE ON public.annadhanam_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Realtime =====
ALTER PUBLICATION supabase_realtime ADD TABLE public.annadhanam_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.annadhanam_verifications;

-- ===== Storage policies for annadhanam-photos bucket =====
CREATE POLICY "annadhanam_photos_read_all" ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket_id = 'annadhanam-photos');

CREATE POLICY "annadhanam_photos_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'annadhanam-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "annadhanam_photos_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'annadhanam-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "annadhanam_photos_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'annadhanam-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "annadhanam_photos_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'annadhanam-photos' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'annadhanam-photos' AND public.is_admin(auth.uid()));
