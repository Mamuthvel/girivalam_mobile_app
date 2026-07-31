import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Landmark table row/insert/update helpers.
export type LandmarkRow = Tables<'landmarks'>;
export type LandmarkInsert = TablesInsert<'landmarks'>;
export type LandmarkUpdate = TablesUpdate<'landmarks'>;

export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  activeGroups: number;
  totalPosts: number;
  emergencyAlerts: number;
  revenue: number;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  role?: string;
}

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  service_details?: string;
  special_requests?: string;
  guests_count?: number;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  dbHealthy: boolean;
  apiHealthy: boolean;
  storageHealthy: boolean;
}

export type LandmarkStatusFilter = 'all' | 'active' | 'disabled';
export type LandmarkSort = 'recent' | 'oldest';
export type BookingStatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled';
