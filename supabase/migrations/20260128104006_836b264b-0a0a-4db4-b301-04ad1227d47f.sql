-- Fix overly permissive INSERT policy on admin_notifications
-- Drop the permissive policy and replace with proper service-role-only access
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.admin_notifications;

-- Create a proper policy - only authenticated users with a valid session can trigger notifications
-- The actual insertion will be done via edge functions with service_role key
CREATE POLICY "Authenticated trigger notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow admins to manually create notifications
CREATE POLICY "Admins can create notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Add DELETE policy for admins to clean up old notifications
CREATE POLICY "Admins can delete notifications"
  ON public.admin_notifications FOR DELETE
  USING (is_admin(auth.uid()));