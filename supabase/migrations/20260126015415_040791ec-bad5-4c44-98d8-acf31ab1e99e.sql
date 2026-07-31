-- FIX 1: Feedback table - restrict PII exposure
-- Current policy "Public feedback is viewable by everyone" exposes name/mobile_number
-- Only public feedback (is_public=true) should be visible, and sensitive fields should be restricted

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public feedback is viewable by everyone" ON public.feedback;

-- Create a view that excludes sensitive PII for public access
CREATE OR REPLACE VIEW public.feedback_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    feedback_type,
    rating,
    message,
    is_public,
    created_at
    -- Excludes: name, mobile_number, user_id, user_agent, device_type
  FROM public.feedback
  WHERE is_public = true;

-- Recreate public policy - only shows is_public=true records (via the view)
CREATE POLICY "Public feedback is viewable by everyone"
ON public.feedback FOR SELECT
USING (is_public = true);

-- FIX 2: Groups table - hide password_hash from public reads
-- Create a public view that excludes password_hash
CREATE OR REPLACE VIEW public.groups_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    code,
    name,
    description,
    group_type,
    is_active,
    creator_id,
    created_at,
    updated_at
    -- Excludes: password_hash
  FROM public.groups;

-- Drop old overly permissive SELECT policy
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON public.groups;

-- Create restrictive base table policy - only creator can see full record including password_hash
CREATE POLICY "Groups are viewable by everyone (via view)"
ON public.groups FOR SELECT
USING (
  -- Creator can see their own groups (including password_hash for management)
  auth.uid() = creator_id
  -- Or admins can see all groups
  OR public.is_admin(auth.uid())
);

-- Grant SELECT on the views to authenticated and anon roles
GRANT SELECT ON public.feedback_public TO anon, authenticated;
GRANT SELECT ON public.groups_public TO anon, authenticated;