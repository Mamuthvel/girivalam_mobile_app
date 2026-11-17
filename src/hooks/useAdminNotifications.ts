import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from "@/lib/logger";

/** Must stay in sync with the admin_notifications category CHECK constraint. */
export type AdminNotificationCategory =
  | 'booking'
  | 'message'
  | 'service'
  | 'emergency'
  | 'annadhanam_reminder';

export interface AdminNotification {
  id: string;
  category: AdminNotificationCategory;
  title: string;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export type NotificationCounts = Record<AdminNotificationCategory, number> & { total: number };

const emptyCounts = (): NotificationCounts => ({
  booking: 0,
  message: 0,
  service: 0,
  emergency: 0,
  annadhanam_reminder: 0,
  total: 0,
});

export interface AdminNotificationSettings {
  email_alerts_enabled: boolean;
  in_app_notifications_enabled: boolean;
  emergency_alerts_enabled: boolean;
  booking_alerts_enabled: boolean;
  message_alerts_enabled: boolean;
  service_alerts_enabled: boolean;
}

const defaultSettings: AdminNotificationSettings = {
  email_alerts_enabled: true,
  in_app_notifications_enabled: true,
  emergency_alerts_enabled: true,
  booking_alerts_enabled: true,
  message_alerts_enabled: true,
  service_alerts_enabled: true,
};

export function useAdminNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>(emptyCounts);
  const [settings, setSettings] = useState<AdminNotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Fetch unread counts by category
  const fetchCounts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('category, is_read')
        .eq('is_read', false);

      if (error) throw error;

      const countsByCategory = (data || []).reduce((acc, item) => {
        const cat = item.category as AdminNotificationCategory;
        // An unknown category would otherwise inflate `total` with no bucket to
        // clear it from, leaving the badge permanently unread.
        if (!(cat in acc)) return acc;
        acc[cat] += 1;
        acc.total += 1;
        return acc;
      }, emptyCounts());

      setCounts(countsByCategory);
    } catch (error) {
      logger.error('Error fetching notification counts:', error);
    }
  }, [user]);

  // Fetch recent notifications
  const fetchNotifications = useCallback(async (limit = 20) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setNotifications(data as AdminNotification[] || []);
    } catch (error) {
      logger.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          email_alerts_enabled: data.email_alerts_enabled,
          in_app_notifications_enabled: data.in_app_notifications_enabled,
          emergency_alerts_enabled: data.emergency_alerts_enabled,
          booking_alerts_enabled: data.booking_alerts_enabled,
          message_alerts_enabled: data.message_alerts_enabled,
          service_alerts_enabled: data.service_alerts_enabled,
        });
      }
    } catch (error) {
      logger.error('Error fetching notification settings:', error);
    }
  }, [user]);

  // Mark notifications as read by category
  const markCategoryAsRead = useCallback(async (category: AdminNotificationCategory) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('category', category)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.category === category ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setCounts(prev => ({
        ...prev,
        [category]: 0,
        total: prev.total - prev[category],
      }));
    } catch (error) {
      logger.error('Error marking notifications as read:', error);
    }
  }, [user]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification || notification.is_read) return;

      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setCounts(prev => ({
        ...prev,
        [notification.category]: Math.max(0, prev[notification.category] - 1),
        total: Math.max(0, prev.total - 1),
      }));
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  }, [user, notifications]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<AdminNotificationSettings>) => {
    if (!user) return false;

    try {
      const updatedSettings = { ...settings, ...newSettings };

      const { error } = await supabase
        .from('admin_notification_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setSettings(updatedSettings);
      return true;
    } catch (error) {
      logger.error('Error updating notification settings:', error);
      return false;
    }
  }, [user, settings]);

  // Initial load and realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchCounts();
    fetchNotifications();
    fetchSettings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_notifications' },
        () => {
          fetchCounts();
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCounts, fetchNotifications, fetchSettings]);

  return {
    notifications,
    counts,
    settings,
    loading,
    markAsRead,
    markCategoryAsRead,
    updateSettings,
    refetch: () => {
      fetchCounts();
      fetchNotifications();
    },
  };
}
