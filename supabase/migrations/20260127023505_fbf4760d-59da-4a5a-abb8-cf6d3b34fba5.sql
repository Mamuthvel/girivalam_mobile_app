-- Update conversations that need the 'replied' status to be valid
-- First, let's ensure the status column can accept 'replied' as a value
-- The status column is varchar, so we just need to update existing records

-- Create a function to automatically set status to 'replied' when admin sends a message
CREATE OR REPLACE FUNCTION public.update_conversation_status_on_admin_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When an admin sends a message, update conversation status to 'replied'
  IF NEW.role = 'admin' THEN
    UPDATE public.support_conversations
    SET status = 'replied',
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id
    AND status NOT IN ('closed', 'resolved');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-updating status on admin reply
DROP TRIGGER IF EXISTS on_admin_reply_update_status ON public.support_messages;
CREATE TRIGGER on_admin_reply_update_status
  AFTER INSERT ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_status_on_admin_reply();