-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.generate_group_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
  exists_code boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.groups WHERE groups.code = code) INTO exists_code;
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$;