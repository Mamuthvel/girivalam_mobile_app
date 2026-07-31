-- Update RLS policies to use secure is_admin() function instead of profiles.role

-- 1. Update backup_logs policies
DROP POLICY IF EXISTS "Admin users can create backup logs" ON public.backup_logs;
DROP POLICY IF EXISTS "Admin users can view backup logs" ON public.backup_logs;

CREATE POLICY "Admin users can create backup logs"
ON public.backup_logs
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin users can view backup logs"
ON public.backup_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- 2. Update support_conversations policies
DROP POLICY IF EXISTS "Admins can see all conversations" ON public.support_conversations;
DROP POLICY IF EXISTS "Admins can update all conversations" ON public.support_conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.support_conversations;

CREATE POLICY "Admins can view all conversations"
ON public.support_conversations
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all conversations"
ON public.support_conversations
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- 3. Update support_messages policies
DROP POLICY IF EXISTS "Admins can insert messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can reply to conversations" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can see all messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can update message status" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.support_messages;

CREATE POLICY "Admins can view all messages"
ON public.support_messages
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert messages"
ON public.support_messages
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update message status"
ON public.support_messages
FOR UPDATE
USING (public.is_admin(auth.uid()));