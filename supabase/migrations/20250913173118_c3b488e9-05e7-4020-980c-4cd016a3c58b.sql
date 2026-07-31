-- Create services table for bookable items
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('accommodation', 'food', 'guide', 'transport', 'special')),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  duration_hours INTEGER,
  max_capacity INTEGER NOT NULL DEFAULT 1,
  available_slots INTEGER NOT NULL DEFAULT 1,
  location TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  images TEXT[], 
  amenities TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  special_requests TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only authenticated users can manage services" 
ON public.services 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for bookings  
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid()::text = user_id::text OR auth.uid() IS NULL);

CREATE POLICY "Users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid()::text = user_id::text OR auth.uid() IS NULL);

-- Add updated_at triggers
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample services
INSERT INTO public.services (name, description, category, price, duration_hours, max_capacity, location, contact_phone, amenities) VALUES
('Arunachala View Guest House', 'Comfortable rooms with temple view, walking distance to Annamalaiyar Temple', 'accommodation', 2500.00, 24, 2, 'Tiruvannamalai Main Road', '+91-9876543210', ARRAY['AC', 'WiFi', 'Temple View', 'Parking']),
('Spiritual Guide Service', 'Experienced local guide for Girivalam and temple visits with historical insights', 'guide', 1500.00, 4, 8, 'Annamalaiyar Temple Entrance', '+91-9876543211', ARRAY['English & Tamil', 'Historical Knowledge', 'Temple Access']),
('Traditional South Indian Meals', 'Authentic vegetarian meals prepared with devotion', 'food', 300.00, 1, 50, 'Seshadri Ashram Area', '+91-9876543212', ARRAY['Pure Vegetarian', 'Traditional Preparation', 'Hygienic']),
('Girivalam Transport Service', 'Comfortable vehicle for elderly devotees and families', 'transport', 1000.00, 3, 6, 'Temple Parking Area', '+91-9876543213', ARRAY['AC Vehicle', 'Experienced Driver', 'Temple Stops']),
('Pournami Special Darshan', 'Priority darshan booking for full moon day celebrations', 'special', 500.00, 2, 25, 'Annamalaiyar Temple', '+91-9876543214', ARRAY['Priority Entry', 'Special Pooja', 'Prasadam']);

-- Enable realtime
ALTER TABLE public.services REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- Add to realtime publication  
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;