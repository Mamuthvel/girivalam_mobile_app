-- Fix RLS policies to prevent infinite recursion

-- Drop all existing policies on group_members
DROP POLICY IF EXISTS "Group members are viewable by group members" ON group_members;
DROP POLICY IF EXISTS "Group members can view other members in same group" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON group_members;

-- Create a security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(target_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM group_members 
    WHERE group_id = target_group_id 
    AND user_id = auth.uid() 
    AND is_active = true
  );
$$;

-- Recreate group_members policies using the security definer function
CREATE POLICY "Group members can view other members in same group" 
ON group_members 
FOR SELECT 
USING (public.is_group_member(group_id));

CREATE POLICY "Users can join groups" 
ON group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" 
ON group_members 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix the generate_group_code function
CREATE OR REPLACE FUNCTION public.generate_group_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_code text;
  exists_code boolean;
BEGIN
  LOOP
    generated_code := upper(substring(md5(random()::text), 1, 6));
    SELECT EXISTS(
      SELECT 1 
      FROM groups 
      WHERE code = generated_code
    ) INTO exists_code;
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN generated_code;
END;
$$;

-- Fix profiles policy to allow viewing profiles of group members
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their groups" ON profiles;

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