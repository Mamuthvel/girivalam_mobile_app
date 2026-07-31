export type ServiceCategory = 
  | "accommodation" 
  | "food" 
  | "guide" 
  | "transport" 
  | "special" 
  | "community" 
  | "support";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  price: number;
  currency: string;
  duration_hours: number | null;
  max_capacity: number;
  available_slots: number;
  location: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  amenities: string[] | null;
  images: string[] | null;
  is_active: boolean;
  show_contact_after_booking?: boolean;
  contact_display_mode?: 'call' | 'whatsapp' | 'both';
}

export interface BookingFormData {
  service_id: string;
  booking_date: Date;
  guests_count: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  special_requests: string;
  country_code?: string;
}

export interface ServiceFilters {
  category: ServiceCategory | "all";
  searchQuery?: string;
}
