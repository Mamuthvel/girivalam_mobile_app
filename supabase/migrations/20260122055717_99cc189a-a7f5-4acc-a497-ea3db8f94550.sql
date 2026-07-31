-- Enable RLS on emergency_alerts and emergency_locations tables
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for emergency_locations table
-- Allow authenticated users to insert emergency location reports
CREATE POLICY "Authenticated users can report emergency locations"
ON public.emergency_locations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow admins to view all emergency locations
CREATE POLICY "Admins can view all emergency locations"
ON public.emergency_locations
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow authenticated users to view recent emergency locations (for safety awareness)
CREATE POLICY "Authenticated users can view recent emergency locations"
ON public.emergency_locations
FOR SELECT
USING (auth.uid() IS NOT NULL AND reported_at > now() - interval '24 hours');

-- Create policies for emergency_alerts table
-- Allow authenticated users to create emergency alerts
CREATE POLICY "Authenticated users can create emergency alerts"
ON public.emergency_alerts
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow admins to view all emergency alerts
CREATE POLICY "Admins can view all emergency alerts"
ON public.emergency_alerts
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow authenticated users to view recent emergency alerts
CREATE POLICY "Authenticated users can view recent emergency alerts"
ON public.emergency_alerts
FOR SELECT
USING (auth.uid() IS NOT NULL AND created_at > now() - interval '24 hours');