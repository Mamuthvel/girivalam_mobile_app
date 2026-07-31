-- Create temple_status table for storing temple timings and status
CREATE TABLE public.temple_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_name text NOT NULL DEFAULT 'Arunachaleswarar Temple',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'limited_darshan')),
  opening_time time NOT NULL DEFAULT '05:00:00',
  closing_time time NOT NULL DEFAULT '21:00:00',
  darshan_available boolean NOT NULL DEFAULT true,
  special_notes text,
  source text NOT NULL DEFAULT 'estimated' CHECK (source IN ('admin', 'estimated')),
  valid_date date NOT NULL DEFAULT CURRENT_DATE,
  expires_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create temple_pooja_timings table for special pooja schedules
CREATE TABLE public.temple_pooja_timings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pooja_name text NOT NULL,
  start_time time NOT NULL,
  end_time time,
  description text,
  is_daily boolean NOT NULL DEFAULT true,
  specific_date date,
  source text NOT NULL DEFAULT 'estimated' CHECK (source IN ('admin', 'estimated')),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create temple_announcements table for admin announcements
CREATE TABLE public.temple_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  announcement_type text NOT NULL DEFAULT 'info' CHECK (announcement_type IN ('info', 'warning', 'festival', 'maintenance', 'emergency')),
  priority integer NOT NULL DEFAULT 0,
  valid_from timestamp with time zone NOT NULL DEFAULT now(),
  valid_until timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.temple_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_pooja_timings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_announcements ENABLE ROW LEVEL SECURITY;

-- Temple Status RLS Policies
CREATE POLICY "Anyone can view temple status"
ON public.temple_status FOR SELECT
USING (true);

CREATE POLICY "Admins can manage temple status"
ON public.temple_status FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Temple Pooja Timings RLS Policies
CREATE POLICY "Anyone can view pooja timings"
ON public.temple_pooja_timings FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage pooja timings"
ON public.temple_pooja_timings FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Temple Announcements RLS Policies
CREATE POLICY "Anyone can view active announcements"
ON public.temple_announcements FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage announcements"
ON public.temple_announcements FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at on temple_status
CREATE TRIGGER update_temple_status_updated_at
BEFORE UPDATE ON public.temple_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on temple_pooja_timings
CREATE TRIGGER update_temple_pooja_timings_updated_at
BEFORE UPDATE ON public.temple_pooja_timings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on temple_announcements
CREATE TRIGGER update_temple_announcements_updated_at
BEFORE UPDATE ON public.temple_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default estimated data
INSERT INTO public.temple_status (temple_name, status, opening_time, closing_time, darshan_available, source, valid_date)
VALUES ('Arunachaleswarar Temple', 'open', '05:00:00', '21:00:00', true, 'estimated', CURRENT_DATE);

-- Insert default pooja timings (estimated based on typical temple schedule)
INSERT INTO public.temple_pooja_timings (pooja_name, start_time, end_time, description, is_daily, source) VALUES
('Ushatkala Pooja', '05:00:00', '06:00:00', 'Morning awakening ritual', true, 'estimated'),
('Kalasandhi Pooja', '08:00:00', '09:00:00', 'Morning worship', true, 'estimated'),
('Uchikala Pooja', '12:00:00', '12:30:00', 'Noon worship', true, 'estimated'),
('Sayarakshai Pooja', '17:00:00', '18:00:00', 'Evening worship', true, 'estimated'),
('Ardhajama Pooja', '20:00:00', '21:00:00', 'Night worship', true, 'estimated');