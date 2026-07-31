-- Drop the existing admin policy that checks JWT role (which doesn't work)
DROP POLICY IF EXISTS "Admin full access" ON public.landmarks;

-- Create new admin policy using the is_admin function (same pattern as other tables)
CREATE POLICY "Admins can manage landmarks" 
ON public.landmarks 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));