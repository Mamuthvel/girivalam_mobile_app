export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "tea" | "water";
export type FoodType = "full_meals" | "lemon_rice" | "curd_rice" | "pongal" | "sweet" | "other";
export type ListingStatus = "pending" | "approved" | "rejected";
export type LiveStatus = "live" | "upcoming" | "completed" | "cancelled";

export type RecurrenceFrequency =
  | "one_time"
  | "daily"
  | "every_x_days"
  | "weekly"
  | "every_x_weeks"
  | "monthly"
  | "every_x_months"
  | "pournami"
  | "pradosham"
  | "festival"
  | "custom_dates";

export interface TimeSlot {
  start: string; // HH:MM
  end: string;   // HH:MM
}

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval?: number;              // for every_x_days/weeks/months
  weekdays?: number[];            // 0=Sun..6=Sat, for weekly
  month_days?: number[];          // 1..31, for monthly
  custom_dates?: string[];        // YYYY-MM-DD
  start_date?: string;            // YYYY-MM-DD
  end_date?: string | null;       // YYYY-MM-DD
  time_slots?: TimeSlot[];
  exceptions?: string[];          // YYYY-MM-DD (holidays / paused days)
  paused?: boolean;
}

export interface AnnadhanamTrust {
  id: string;
  trust_name: string;
  organization_name: string | null;
  organizer_name: string | null;
  mobile: string | null;
  whatsapp: string | null;
  email: string | null;
  bio: string | null;
  description: string | null;
  mission: string | null;
  founder: string | null;
  history: string | null;
  logo_url: string | null;
  photos: string[] | null;
  website: string | null;
  social_media: Record<string, string> | null;
  donation_details: Record<string, string> | null;
  is_verified: boolean;
  status: ListingStatus;
  rejection_reason: string | null;
  submitted_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnadhanamListing {
  id: string;
  trust_id: string | null;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  landmark: string | null;
  meal_types: MealType[];
  food_types: FoodType[];
  food_menu: string | null;
  estimated_capacity: number | null;
  remaining_availability: number | null;
  photos: string[];
  recurrence: Recurrence;
  manual_status_override: LiveStatus | null;
  tags: string[];
  status: ListingStatus;
  rejection_reason: string | null;
  submitted_by: string | null;
  approved_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trust?: AnnadhanamTrust | null;
}

export interface ListingOccurrence {
  listing: AnnadhanamListing;
  date: string;          // YYYY-MM-DD
  start: Date;
  end: Date;
  status: LiveStatus;
  distanceKm?: number;
}
