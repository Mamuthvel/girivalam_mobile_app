-- Admin notifications table for tracking all admin-relevant events
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('booking', 'message', 'service', 'emergency')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view all notifications"
  ON public.admin_notifications FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  USING (is_admin(auth.uid()));

-- System can insert notifications (via edge functions with service role)
CREATE POLICY "Service role can insert notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (true);

-- Admin notification preferences table
CREATE TABLE public.admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  emergency_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  booking_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  message_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  service_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view their own settings
CREATE POLICY "Admins can view own settings"
  ON public.admin_notification_settings FOR SELECT
  USING (is_admin(auth.uid()) AND auth.uid() = user_id);

-- Admins can update their own settings
CREATE POLICY "Admins can update own settings"
  ON public.admin_notification_settings FOR UPDATE
  USING (is_admin(auth.uid()) AND auth.uid() = user_id);

-- Admins can insert their own settings
CREATE POLICY "Admins can insert own settings"
  ON public.admin_notification_settings FOR INSERT
  WITH CHECK (is_admin(auth.uid()) AND auth.uid() = user_id);

-- Add contact visibility settings to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS show_contact_after_booking BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS contact_display_mode TEXT NOT NULL DEFAULT 'both' CHECK (contact_display_mode IN ('call', 'whatsapp', 'both'));

-- Create index for faster notification queries
CREATE INDEX idx_admin_notifications_category_read ON public.admin_notifications(category, is_read);
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);