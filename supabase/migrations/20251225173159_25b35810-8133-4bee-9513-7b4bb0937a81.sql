-- Create food_locations table for managing food guide data
CREATE TABLE public.food_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_type TEXT NOT NULL DEFAULT 'restaurant', -- 'prasadam', 'restaurant', 'street_food', 'cafe'
  cuisine_type TEXT, -- 'south_indian', 'north_indian', 'multi_cuisine', etc.
  is_free BOOLEAN NOT NULL DEFAULT false, -- true for free prasadam
  price_range TEXT, -- 'budget', 'moderate', 'premium'
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  contact_phone TEXT,
  timings TEXT, -- e.g., "6:00 AM - 9:00 PM"
  special_days TEXT, -- e.g., "Pournami, Festivals"
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  distance_from_path NUMERIC, -- distance in km from girivalam path
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_locations ENABLE ROW LEVEL SECURITY;

-- Public can view active food locations
CREATE POLICY "Food locations are viewable by everyone"
ON public.food_locations
FOR SELECT
USING (is_active = true);

-- Only admins can manage food locations
CREATE POLICY "Admins can manage food locations"
ON public.food_locations
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_food_locations_updated_at
BEFORE UPDATE ON public.food_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();