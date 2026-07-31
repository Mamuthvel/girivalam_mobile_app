-- Fix profiles table RLS to prevent PII exposure to group members
-- Only the profile owner and admins should be able to view profile data

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their groups" ON public.profiles;
DROP POLICY IF EXISTS "Allow reading role for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable select own profile" ON public.profiles;

-- Keep core ownership policies, create clean set
-- Users can only view their own profile
CREATE POLICY "Users can view own profile only"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles for administrative purposes
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));