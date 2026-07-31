-- Fix bookings table RLS to use stricter access controls
-- Uses explicit TO authenticated role and proper auth.uid() comparison

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

-- Policy to allow authenticated users to view ONLY their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy to allow authenticated users to create their own bookings
CREATE POLICY "Users can create their own bookings"
ON public.bookings
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy to allow authenticated users to update only their own bookings
CREATE POLICY "Users can update their own bookings"
ON public.bookings
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add admin access for legitimate administrative operations
CREATE POLICY "Admins can view all bookings"
ON public.bookings
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update booking status"
ON public.bookings
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));