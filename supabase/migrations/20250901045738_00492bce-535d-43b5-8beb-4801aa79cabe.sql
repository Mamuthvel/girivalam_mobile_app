-- Fix the infinite recursion issue in group_members RLS policy
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Group members are viewable by group members" ON group_members;

-- Create a simpler, non-recursive policy for viewing group members
CREATE POLICY "Group members can view other members in same group" 
ON group_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.is_active = true
  )
);

-- Fix the generate_group_code function by fully qualifying the column reference
CREATE OR REPLACE FUNCTION public.generate_group_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  generated_code text;
  exists_code boolean;
BEGIN
  LOOP
    generated_code := upper(substring(md5(random()::text), 1, 6));
    SELECT EXISTS(
      SELECT 1 
      FROM public.groups 
      WHERE public.groups.code = generated_code
    ) INTO exists_code;
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN generated_code;
END;
$$;

-- Ensure profiles can be viewed by group members for display purposes
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Allow users to view their own profile and profiles of users in their groups
CREATE POLICY "Users can view profiles in their groups" 
ON profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 
    FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() 
    AND gm2.user_id = profiles.user_id
    AND gm1.is_active = true 
    AND gm2.is_active = true
  )
);