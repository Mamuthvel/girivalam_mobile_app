-- Fix 1: live_locations - Add consent verification to RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Group members can view locations in their groups" ON public.live_locations;
DROP POLICY IF EXISTS "Users can update their own location" ON public.live_locations;
DROP POLICY IF EXISTS "Users can update their own location data" ON public.live_locations;

-- Recreate SELECT policy with consent verification
-- Viewer must be active group member AND tracked user must have location_sharing_enabled = true
CREATE POLICY "Group members can view locations with consent"
ON public.live_locations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  -- Viewer must be an active group member
  EXISTS (
    SELECT 1 FROM public.group_members gm_viewer
    WHERE gm_viewer.group_id = live_locations.group_id 
    AND gm_viewer.user_id = auth.uid() 
    AND gm_viewer.is_active = true
  )
  -- Tracked user must have location sharing enabled
  AND EXISTS (
    SELECT 1 FROM public.group_members gm_tracked
    WHERE gm_tracked.group_id = live_locations.group_id
    AND gm_tracked.user_id = live_locations.user_id
    AND gm_tracked.location_sharing_enabled = true
    AND gm_tracked.is_active = true
  )
);

-- Recreate INSERT policy with consent check - users can only share if they enabled location sharing
CREATE POLICY "Users can share location with consent"
ON public.live_locations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = live_locations.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.is_active = true
    AND gm.location_sharing_enabled = true
  )
);

-- Recreate UPDATE policy - users can only update their own location data
CREATE POLICY "Users can update their own location data"
ON public.live_locations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix 2: profiles - Remove the group visibility policy if it still exists
-- Profiles should only be viewable by owner and admins (as per earlier fix)
DROP POLICY IF EXISTS "Users can view profiles in their groups" ON public.profiles;