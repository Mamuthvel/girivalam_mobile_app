import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/lib/logger";

export interface TempleStatus {
  id: string;
  temple_name: string;
  status: 'open' | 'closed' | 'limited_darshan';
  opening_time: string;
  closing_time: string;
  darshan_available: boolean;
  special_notes: string | null;
  source: 'admin' | 'estimated';
  valid_date: string;
  expires_at: string | null;
}

export interface PoojaTimings {
  id: string;
  pooja_name: string;
  start_time: string;
  end_time: string | null;
  description: string | null;
  is_daily: boolean;
  specific_date: string | null;
  source: 'admin' | 'estimated';
}

export interface TempleAnnouncement {
  id: string;
  title: string;
  message: string;
  announcement_type: 'info' | 'warning' | 'festival' | 'maintenance' | 'emergency';
  priority: number;
  valid_from: string;
  valid_until: string | null;
}

export function useTempleStatus() {
  const [status, setStatus] = useState<TempleStatus | null>(null);
  const [poojaTimings, setPoojaTimings] = useState<PoojaTimings[]>([]);
  const [announcements, setAnnouncements] = useState<TempleAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTempleData = async () => {
    try {
      setLoading(true);
      
      // Fetch temple status - prioritize admin data for today
      const today = new Date().toISOString().split('T')[0];
      const { data: statusData, error: statusError } = await supabase
        .from('temple_status')
        .select('*')
        .eq('valid_date', today)
        .order('source', { ascending: false }) // 'admin' comes before 'estimated'
        .limit(1)
        .maybeSingle();

      if (statusError) throw statusError;
      
      // If no data for today, get the most recent estimated data
      if (!statusData) {
        const { data: fallbackData } = await supabase
          .from('temple_status')
          .select('*')
          .eq('source', 'estimated')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setStatus(fallbackData as TempleStatus | null);
      } else {
        setStatus(statusData as TempleStatus);
      }

      // Fetch pooja timings
      const { data: poojaData, error: poojaError } = await supabase
        .from('temple_pooja_timings')
        .select('*')
        .eq('is_active', true)
        .or(`is_daily.eq.true,specific_date.eq.${today}`)
        .order('start_time', { ascending: true });

      if (poojaError) throw poojaError;
      setPoojaTimings((poojaData || []) as PoojaTimings[]);

      // Fetch active announcements
      const { data: announcementData, error: announcementError } = await supabase
        .from('temple_announcements')
        .select('*')
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
        .order('priority', { ascending: false });

      if (announcementError) throw announcementError;
      setAnnouncements((announcementData || []) as TempleAnnouncement[]);

    } catch (error) {
      logger.error('Error fetching temple data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load temple information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTempleData();

    // Set up real-time subscription
    const channel = supabase
      .channel('temple-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'temple_status' }, fetchTempleData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'temple_pooja_timings' }, fetchTempleData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'temple_announcements' }, fetchTempleData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { status, poojaTimings, announcements, loading, refetch: fetchTempleData };
}

// Helper function to format time
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Helper to determine if temple is currently open
export function isTempleOpen(openingTime: string, closingTime: string): boolean {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return currentTime >= openingTime && currentTime <= closingTime;
}
