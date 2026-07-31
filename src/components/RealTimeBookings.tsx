import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface BookingStats {
  totalBookings: number;
  todayBookings: number;
  activeBookings: number;
}

export const RealTimeBookings: React.FC = () => {
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    todayBookings: 0,
    activeBookings: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBookingStats();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          logger.log('Booking update:', payload);
          fetchBookingStats(); // Refresh stats on any booking change
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Booking! 🙏",
              description: "A devotee has made a new booking",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchBookingStats = async () => {
    try {
      // Get total bookings
      const { count: totalCount, error: totalError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get today's bookings
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: todayError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('booking_date', today);

      if (todayError) throw todayError;

      // Get active bookings (confirmed and pending)
      const { count: activeCount, error: activeError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed']);

      if (activeError) throw activeError;

      setStats({
        totalBookings: totalCount || 0,
        todayBookings: todayCount || 0,
        activeBookings: activeCount || 0
      });
    } catch (error) {
      logger.error('Error fetching booking stats:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
        <TrendingUp className="h-4 w-4" />
        <span className="font-medium">{stats.totalBookings}</span>
        <span className="text-xs">Total Bookings</span>
      </Badge>
      
      <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
        <Clock className="h-4 w-4" />
        <span className="font-medium">{stats.todayBookings}</span>
        <span className="text-xs">Today</span>
      </Badge>
      
      <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 animate-pulse">
        <Users className="h-4 w-4" />
        <span className="font-medium">{stats.activeBookings}</span>
        <span className="text-xs">Active</span>
      </Badge>
    </div>
  );
};