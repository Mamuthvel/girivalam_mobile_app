-- Fix function search paths for functions that don't have them set
-- Update update_conversation_timestamp function
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update update_conversation_last_message function  
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE public.support_conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Update delete_expired_support_data function
CREATE OR REPLACE FUNCTION public.delete_expired_support_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.support_messages
  WHERE expires_at < NOW();
  
  DELETE FROM public.support_conversations
  WHERE expires_at < NOW();
  
  RAISE NOTICE 'Deleted expired support data at %', NOW();
END;
$function$;

-- Update get_or_create_conversation function
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_conversation_id UUID;
BEGIN
  SELECT id INTO v_conversation_id
  FROM public.support_conversations
  WHERE user_id = p_user_id
  AND status IN ('open', 'in_progress')
  ORDER BY last_message_at DESC
  LIMIT 1;
  
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.support_conversations (user_id)
    VALUES (p_user_id)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$function$;

-- Update mark_messages_as_read function
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_conversation_id uuid, p_role character varying)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.support_messages
  SET read_at = NOW(),
      status = 'read'
  WHERE conversation_id = p_conversation_id
  AND role != p_role
  AND read_at IS NULL;
END;
$function$;

-- Update get_unread_count function
CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.support_messages sm
  JOIN public.support_conversations sc ON sm.conversation_id = sc.id
  WHERE sc.user_id = p_user_id
  AND sm.role = 'admin'
  AND sm.read_at IS NULL;
  
  RETURN COALESCE(v_count, 0);
END;
$function$;

-- Add RLS policies for offline_cache table
-- Users can view their own non-expired cache
CREATE POLICY "Users can view own cache"
ON public.offline_cache
FOR SELECT
USING (auth.uid() = user_id AND (expires_at IS NULL OR expires_at > now()));

-- Users can insert their own cache entries
CREATE POLICY "Users can create own cache"
ON public.offline_cache
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cache entries
CREATE POLICY "Users can update own cache"
ON public.offline_cache
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cache entries
CREATE POLICY "Users can delete own cache"
ON public.offline_cache
FOR DELETE
USING (auth.uid() = user_id);

-- Create cleanup function for expired cache with proper search_path
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.offline_cache
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;