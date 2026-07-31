export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_notification_settings: {
        Row: {
          booking_alerts_enabled: boolean
          created_at: string
          email_alerts_enabled: boolean
          emergency_alerts_enabled: boolean
          id: string
          in_app_notifications_enabled: boolean
          message_alerts_enabled: boolean
          service_alerts_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_alerts_enabled?: boolean
          created_at?: string
          email_alerts_enabled?: boolean
          emergency_alerts_enabled?: boolean
          id?: string
          in_app_notifications_enabled?: boolean
          message_alerts_enabled?: boolean
          service_alerts_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_alerts_enabled?: boolean
          created_at?: string
          email_alerts_enabled?: boolean
          emergency_alerts_enabled?: boolean
          id?: string
          in_app_notifications_enabled?: boolean
          message_alerts_enabled?: boolean
          service_alerts_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      annadhanam_listings: {
        Row: {
          address: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          estimated_capacity: number | null
          food_menu: string | null
          food_types: string[] | null
          id: string
          is_active: boolean
          landmark: string | null
          latitude: number
          longitude: number
          manual_status_override: string | null
          meal_types: string[] | null
          photos: string[] | null
          recurrence: Json
          rejection_reason: string | null
          remaining_availability: number | null
          status: string
          submitted_by: string | null
          tags: string[] | null
          title: string
          trust_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          estimated_capacity?: number | null
          food_menu?: string | null
          food_types?: string[] | null
          id?: string
          is_active?: boolean
          landmark?: string | null
          latitude: number
          longitude: number
          manual_status_override?: string | null
          meal_types?: string[] | null
          photos?: string[] | null
          recurrence?: Json
          rejection_reason?: string | null
          remaining_availability?: number | null
          status?: string
          submitted_by?: string | null
          tags?: string[] | null
          title: string
          trust_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          estimated_capacity?: number | null
          food_menu?: string | null
          food_types?: string[] | null
          id?: string
          is_active?: boolean
          landmark?: string | null
          latitude?: number
          longitude?: number
          manual_status_override?: string | null
          meal_types?: string[] | null
          photos?: string[] | null
          recurrence?: Json
          rejection_reason?: string | null
          remaining_availability?: number | null
          status?: string
          submitted_by?: string | null
          tags?: string[] | null
          title?: string
          trust_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "annadhanam_listings_trust_id_fkey"
            columns: ["trust_id"]
            isOneToOne: false
            referencedRelation: "annadhanam_trusts"
            referencedColumns: ["id"]
          },
        ]
      }
      annadhanam_reminders: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          occurrence_date: string
          occurrence_time: string | null
          remind_before_minutes: number
          sent: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          occurrence_date: string
          occurrence_time?: string | null
          remind_before_minutes?: number
          sent?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          occurrence_date?: string
          occurrence_time?: string | null
          remind_before_minutes?: number
          sent?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annadhanam_reminders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "annadhanam_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      annadhanam_trusts: {
        Row: {
          approved_by: string | null
          bio: string | null
          created_at: string
          description: string | null
          donation_details: Json | null
          email: string | null
          founder: string | null
          history: string | null
          id: string
          is_verified: boolean
          logo_url: string | null
          mission: string | null
          mobile: string | null
          organization_name: string | null
          organizer_name: string | null
          photos: string[] | null
          rejection_reason: string | null
          social_media: Json | null
          status: string
          submitted_by: string | null
          trust_name: string
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          approved_by?: string | null
          bio?: string | null
          created_at?: string
          description?: string | null
          donation_details?: Json | null
          email?: string | null
          founder?: string | null
          history?: string | null
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          mission?: string | null
          mobile?: string | null
          organization_name?: string | null
          organizer_name?: string | null
          photos?: string[] | null
          rejection_reason?: string | null
          social_media?: Json | null
          status?: string
          submitted_by?: string | null
          trust_name: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          approved_by?: string | null
          bio?: string | null
          created_at?: string
          description?: string | null
          donation_details?: Json | null
          email?: string | null
          founder?: string | null
          history?: string | null
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          mission?: string | null
          mobile?: string | null
          organization_name?: string | null
          organizer_name?: string | null
          photos?: string[] | null
          rejection_reason?: string | null
          social_media?: Json | null
          status?: string
          submitted_by?: string | null
          trust_name?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      annadhanam_verifications: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          notes: string | null
          photo_url: string | null
          report_type: string
          reported_by: string
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          notes?: string | null
          photo_url?: string | null
          report_type: string
          reported_by: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          notes?: string | null
          photo_url?: string | null
          report_type?: string
          reported_by?: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "annadhanam_verifications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "annadhanam_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          backup_file_path: string
          backup_size_bytes: number | null
          backup_type: string
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          status: string
          table_count: number | null
          total_rows: number | null
        }
        Insert: {
          backup_file_path: string
          backup_size_bytes?: number | null
          backup_type?: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          status?: string
          table_count?: number | null
          total_rows?: number | null
        }
        Update: {
          backup_file_path?: string
          backup_size_bytes?: number | null
          backup_type?: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          status?: string
          table_count?: number | null
          total_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      booking_assignments: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          notified_at: string | null
          responded_at: string | null
          response_deadline: string | null
          service_assignment_id: string | null
          service_person_name: string
          service_person_phone: string
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          notified_at?: string | null
          responded_at?: string | null
          response_deadline?: string | null
          service_assignment_id?: string | null
          service_person_name: string
          service_person_phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          notified_at?: string | null
          responded_at?: string | null
          response_deadline?: string | null
          service_assignment_id?: string | null
          service_person_name?: string
          service_person_phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_service_assignment_id_fkey"
            columns: ["service_assignment_id"]
            isOneToOne: false
            referencedRelation: "service_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_notification_logs: {
        Row: {
          booking_id: string
          channel: string
          created_at: string
          error_message: string | null
          id: string
          message_sid: string | null
          recipient_phone: string
          recipient_type: string
          retry_count: number
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_sid?: string | null
          recipient_phone: string
          recipient_type: string
          retry_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_sid?: string | null
          recipient_phone?: string
          recipient_type?: string
          retry_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_notification_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          end_time: string | null
          guests_count: number
          id: string
          payment_id: string | null
          payment_status: string
          service_id: string
          special_requests: string | null
          start_time: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          end_time?: string | null
          guests_count?: number
          id?: string
          payment_id?: string | null
          payment_status?: string
          service_id: string
          special_requests?: string | null
          start_time?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          end_time?: string | null
          guests_count?: number
          id?: string
          payment_id?: string | null
          payment_status?: string
          service_id?: string
          special_requests?: string | null
          start_time?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          post_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_community_posts_user_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      emergency_alerts: {
        Row: {
          created_at: string | null
          id: number
          note: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          note?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          note?: string | null
        }
        Relationships: []
      }
      emergency_locations: {
        Row: {
          id: number
          latitude: number | null
          longitude: number | null
          reported_at: string | null
        }
        Insert: {
          id?: never
          latitude?: number | null
          longitude?: number | null
          reported_at?: string | null
        }
        Update: {
          id?: never
          latitude?: number | null
          longitude?: number | null
          reported_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          device_type: string | null
          feedback_type: string
          id: string
          is_public: boolean
          message: string
          mobile_number: string | null
          name: string | null
          rating: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          feedback_type?: string
          id?: string
          is_public?: boolean
          message: string
          mobile_number?: string | null
          name?: string | null
          rating?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          feedback_type?: string
          id?: string
          is_public?: boolean
          message?: string
          mobile_number?: string | null
          name?: string | null
          rating?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      food_locations: {
        Row: {
          address: string | null
          amenities: string[] | null
          contact_phone: string | null
          created_at: string
          cuisine_type: string | null
          description: string | null
          distance_from_path: number | null
          id: string
          images: string[] | null
          is_active: boolean
          is_free: boolean
          is_verified: boolean
          latitude: number | null
          location_type: string
          longitude: number | null
          name: string
          price_range: string | null
          special_days: string | null
          timings: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          contact_phone?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          distance_from_path?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_free?: boolean
          is_verified?: boolean
          latitude?: number | null
          location_type?: string
          longitude?: number | null
          name: string
          price_range?: string | null
          special_days?: string | null
          timings?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          contact_phone?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          distance_from_path?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_free?: boolean
          is_verified?: boolean
          latitude?: number | null
          location_type?: string
          longitude?: number | null
          name?: string
          price_range?: string | null
          special_days?: string | null
          timings?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      group_challenges: {
        Row: {
          challenge_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          group_id: string | null
          id: string
          is_active: boolean | null
          reward_description: string | null
          start_date: string | null
          target_value: number | null
          title: string
        }
        Insert: {
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          reward_description?: string | null
          start_date?: string | null
          target_value?: number | null
          title: string
        }
        Update: {
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          reward_description?: string | null
          start_date?: string | null
          target_value?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_challenges_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_challenges_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_public"
            referencedColumns: ["id"]
          },
        ]
      }
      group_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          group_id: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          max_participants: number | null
          start_date: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          group_id?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          max_participants?: number | null
          start_date?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          group_id?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          max_participants?: number | null
          start_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_public"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          distance_km: number
          group_id: string
          id: string
          is_active: boolean
          joined_at: string
          location_sharing_consented_at: string | null
          location_sharing_enabled: boolean
          role: string | null
          steps_count: number
          tracking_started_at: string | null
          user_id: string
        }
        Insert: {
          distance_km?: number
          group_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          location_sharing_consented_at?: string | null
          location_sharing_enabled?: boolean
          role?: string | null
          steps_count?: number
          tracking_started_at?: string | null
          user_id: string
        }
        Update: {
          distance_km?: number
          group_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          location_sharing_consented_at?: string | null
          location_sharing_enabled?: boolean
          role?: string | null
          steps_count?: number
          tracking_started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_group_members_user_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_public"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          message_type: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          message_type?: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          code: string
          created_at: string
          creator_id: string
          description: string | null
          group_type: string
          id: string
          is_active: boolean
          name: string
          password_hash: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          creator_id: string
          description?: string | null
          group_type?: string
          id?: string
          is_active?: boolean
          name: string
          password_hash?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          group_type?: string
          id?: string
          is_active?: boolean
          name?: string
          password_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      guide_ai_queries: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          language: string | null
          matched_question_id: string | null
          query: string
          source: string
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          language?: string | null
          matched_question_id?: string | null
          query: string
          source?: string
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          language?: string | null
          matched_question_id?: string | null
          query?: string
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_ai_queries_matched_question_id_fkey"
            columns: ["matched_question_id"]
            isOneToOne: false
            referencedRelation: "guide_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_enabled: boolean
          name_en: string
          name_kn: string | null
          name_ta: string | null
          name_te: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_enabled?: boolean
          name_en: string
          name_kn?: string | null
          name_ta?: string | null
          name_te?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_enabled?: boolean
          name_en?: string
          name_kn?: string | null
          name_ta?: string | null
          name_te?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      guide_question_versions: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          question_id: string
          snapshot: Json
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          question_id: string
          snapshot: Json
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          question_id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "guide_question_versions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "guide_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_questions: {
        Row: {
          answer_en: string
          answer_kn: string | null
          answer_ta: string | null
          answer_te: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_enabled: boolean
          is_featured: boolean
          is_human_verified: boolean
          question_en: string
          question_kn: string | null
          question_ta: string | null
          question_te: string | null
          search_count: number
          tags: string[] | null
          updated_at: string
          updated_by: string | null
          view_count: number
        }
        Insert: {
          answer_en?: string
          answer_kn?: string | null
          answer_ta?: string | null
          answer_te?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          is_featured?: boolean
          is_human_verified?: boolean
          question_en: string
          question_kn?: string | null
          question_ta?: string | null
          question_te?: string | null
          search_count?: number
          tags?: string[] | null
          updated_at?: string
          updated_by?: string | null
          view_count?: number
        }
        Update: {
          answer_en?: string
          answer_kn?: string | null
          answer_ta?: string | null
          answer_te?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          is_featured?: boolean
          is_human_verified?: boolean
          question_en?: string
          question_kn?: string | null
          question_ta?: string | null
          question_te?: string | null
          search_count?: number
          tags?: string[] | null
          updated_at?: string
          updated_by?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "guide_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "guide_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      landmarks: {
        Row: {
          animation_type: string
          aura_color: string | null
          created_at: string | null
          custom_image_url: string | null
          description: string | null
          direction: string | null
          enable_aura_pulse: boolean | null
          enable_glow: boolean | null
          enable_snake_animation: boolean | null
          facilities: string[] | null
          glow_color: string | null
          icon_size: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          is_ashta_lingam: boolean | null
          lat: number
          lng: number
          name: string
          premium_glow: boolean | null
          timings: string | null
          type: string
          updated_at: string | null
          upload_type: string | null
        }
        Insert: {
          animation_type: string
          aura_color?: string | null
          created_at?: string | null
          custom_image_url?: string | null
          description?: string | null
          direction?: string | null
          enable_aura_pulse?: boolean | null
          enable_glow?: boolean | null
          enable_snake_animation?: boolean | null
          facilities?: string[] | null
          glow_color?: string | null
          icon_size?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          is_ashta_lingam?: boolean | null
          lat: number
          lng: number
          name: string
          premium_glow?: boolean | null
          timings?: string | null
          type: string
          updated_at?: string | null
          upload_type?: string | null
        }
        Update: {
          animation_type?: string
          aura_color?: string | null
          created_at?: string | null
          custom_image_url?: string | null
          description?: string | null
          direction?: string | null
          enable_aura_pulse?: boolean | null
          enable_glow?: boolean | null
          enable_snake_animation?: boolean | null
          facilities?: string[] | null
          glow_color?: string | null
          icon_size?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          is_ashta_lingam?: boolean | null
          lat?: number
          lng?: number
          name?: string
          premium_glow?: boolean | null
          timings?: string | null
          type?: string
          updated_at?: string | null
          upload_type?: string | null
        }
        Relationships: []
      }
      live_locations: {
        Row: {
          accuracy: number | null
          created_at: string
          group_id: string
          heading: number | null
          id: string
          is_live: boolean
          latitude: number
          longitude: number
          speed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          group_id: string
          heading?: number | null
          id?: string
          is_live?: boolean
          latitude: number
          longitude: number
          speed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          group_id?: string
          heading?: number | null
          id?: string
          is_live?: boolean
          latitude?: number
          longitude?: number
          speed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mantra_audio: {
        Row: {
          audio_type: string | null
          audio_url: string
          created_at: string
          duration_seconds: number | null
          file_format: string | null
          file_size: number | null
          id: string
          language: string
          linga_id: number | null
          mantra_id: string
          mantra_name: string
          updated_at: string
        }
        Insert: {
          audio_type?: string | null
          audio_url: string
          created_at?: string
          duration_seconds?: number | null
          file_format?: string | null
          file_size?: number | null
          id?: string
          language?: string
          linga_id?: number | null
          mantra_id: string
          mantra_name: string
          updated_at?: string
        }
        Update: {
          audio_type?: string | null
          audio_url?: string
          created_at?: string
          duration_seconds?: number | null
          file_format?: string | null
          file_size?: number | null
          id?: string
          language?: string
          linga_id?: number | null
          mantra_id?: string
          mantra_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      offline_cache: {
        Row: {
          cache_data: Json | null
          cache_key: string
          created_at: string | null
          expires_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          cache_data?: Json | null
          cache_key: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          cache_data?: Json | null
          cache_key?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_comments_user_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_likes_user_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          age_group: string | null
          blood_group: string | null
          city: string | null
          created_at: string
          display_name: string | null
          email: string | null
          gender: string | null
          id: string
          language_preference: string | null
          mobile_number: string | null
          pincode: string | null
          role: string | null
          sms_notifications_enabled: boolean | null
          state: string | null
          updated_at: string
          user_id: string
          whatsapp_notifications_enabled: boolean | null
        }
        Insert: {
          address?: string | null
          age_group?: string | null
          blood_group?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          language_preference?: string | null
          mobile_number?: string | null
          pincode?: string | null
          role?: string | null
          sms_notifications_enabled?: boolean | null
          state?: string | null
          updated_at?: string
          user_id: string
          whatsapp_notifications_enabled?: boolean | null
        }
        Update: {
          address?: string | null
          age_group?: string | null
          blood_group?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          language_preference?: string | null
          mobile_number?: string | null
          pincode?: string | null
          role?: string | null
          sms_notifications_enabled?: boolean | null
          state?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_notifications_enabled?: boolean | null
        }
        Relationships: []
      }
      saved_locations: {
        Row: {
          created_at: string
          id: string
          latitude: number
          location_type: string
          longitude: number
          name: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          location_type?: string
          longitude: number
          name: string
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          location_type?: string
          longitude?: number
          name?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_assignments: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          priority_order: number
          service_category: string | null
          service_id: string | null
          service_person_name: string
          service_person_phone: string
          service_person_whatsapp: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          priority_order?: number
          service_category?: string | null
          service_id?: string | null
          service_person_name: string
          service_person_phone: string
          service_person_whatsapp?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          priority_order?: number
          service_category?: string | null
          service_id?: string | null
          service_person_name?: string
          service_person_phone?: string
          service_person_whatsapp?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_assignments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          address: string | null
          api_endpoint: string | null
          api_key_hash: string | null
          category: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location_lat: number | null
          location_lng: number | null
          name: string
          rating: number | null
          review_count: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          api_endpoint?: string | null
          api_key_hash?: string | null
          category: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          api_endpoint?: string | null
          api_key_hash?: string | null
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          amenities: string[] | null
          available_slots: number
          category: string
          contact_display_mode: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          currency: string
          description: string | null
          duration_hours: number | null
          id: string
          images: string[] | null
          is_active: boolean
          location: string | null
          max_capacity: number
          name: string
          price: number
          show_contact_after_booking: boolean
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          available_slots?: number
          category: string
          contact_display_mode?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          location?: string | null
          max_capacity?: number
          name: string
          price: number
          show_contact_after_booking?: boolean
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          available_slots?: number
          category?: string
          contact_display_mode?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          location?: string | null
          max_capacity?: number
          name?: string
          price?: number
          show_contact_after_booking?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      solo_journeys: {
        Row: {
          created_at: string
          distance_km: number
          ended_at: string | null
          girivalam_completed: boolean
          girivalam_progress: number
          id: string
          path_history: Json | null
          session_id: string
          started_at: string
          status: string
          steps_count: number
          time_elapsed_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          distance_km?: number
          ended_at?: string | null
          girivalam_completed?: boolean
          girivalam_progress?: number
          id?: string
          path_history?: Json | null
          session_id: string
          started_at?: string
          status?: string
          steps_count?: number
          time_elapsed_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          distance_km?: number
          ended_at?: string | null
          girivalam_completed?: boolean
          girivalam_progress?: number
          id?: string
          path_history?: Json | null
          session_id?: string
          started_at?: string
          status?: string
          steps_count?: number
          time_elapsed_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          artist: string | null
          audio_url: string
          category: string | null
          cover_image: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          order_number: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          artist?: string | null
          audio_url: string
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_number?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          artist?: string | null
          audio_url?: string
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_number?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      spiritual_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          is_recurring: boolean | null
          location_lat: number | null
          location_lng: number | null
          recurrence_pattern: string | null
          significance: string | null
          title: string
          traditions: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          recurrence_pattern?: string | null
          significance?: string | null
          title: string
          traditions?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          recurrence_pattern?: string | null
          significance?: string | null
          title?: string
          traditions?: string | null
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          assigned_to: string | null
          created_at: string
          expires_at: string
          id: string
          last_message_at: string
          metadata: Json | null
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          last_message_at?: string
          metadata?: Json | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          last_message_at?: string
          metadata?: Json | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          conversation_id: string
          created_at: string
          expires_at: string
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          role: string
          status: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          expires_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          role?: string
          status?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          role?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_support_messages_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      temple_announcements: {
        Row: {
          announcement_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          message: string
          priority: number
          title: string
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          announcement_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          message: string
          priority?: number
          title: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          announcement_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          message?: string
          priority?: number
          title?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      temple_pooja_timings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          id: string
          is_active: boolean
          is_daily: boolean
          pooja_name: string
          source: string
          specific_date: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_daily?: boolean
          pooja_name: string
          source?: string
          specific_date?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_daily?: boolean
          pooja_name?: string
          source?: string
          specific_date?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      temple_status: {
        Row: {
          closing_time: string
          created_at: string
          created_by: string | null
          darshan_available: boolean
          expires_at: string | null
          id: string
          opening_time: string
          source: string
          special_notes: string | null
          status: string
          temple_name: string
          updated_at: string
          valid_date: string
        }
        Insert: {
          closing_time?: string
          created_at?: string
          created_by?: string | null
          darshan_available?: boolean
          expires_at?: string | null
          id?: string
          opening_time?: string
          source?: string
          special_notes?: string | null
          status?: string
          temple_name?: string
          updated_at?: string
          valid_date?: string
        }
        Update: {
          closing_time?: string
          created_at?: string
          created_by?: string | null
          darshan_available?: boolean
          expires_at?: string | null
          id?: string
          opening_time?: string
          source?: string
          special_notes?: string | null
          status?: string
          temple_name?: string
          updated_at?: string
          valid_date?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      feedback_public: {
        Row: {
          created_at: string | null
          feedback_type: string | null
          id: string | null
          is_public: boolean | null
          message: string | null
          rating: number | null
        }
        Insert: {
          created_at?: string | null
          feedback_type?: string | null
          id?: string | null
          is_public?: boolean | null
          message?: string | null
          rating?: number | null
        }
        Update: {
          created_at?: string | null
          feedback_type?: string | null
          id?: string | null
          is_public?: boolean | null
          message?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      groups_public: {
        Row: {
          code: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          group_type: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          group_type?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          group_type?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_cache: { Args: never; Returns: undefined }
      delete_expired_support_data: { Args: never; Returns: undefined }
      generate_group_code: { Args: never; Returns: string }
      get_or_create_conversation: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_unread_count: { Args: { p_user_id: string }; Returns: number }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_group_member: { Args: { target_group_id: string }; Returns: boolean }
      mark_messages_as_read: {
        Args: { p_conversation_id: string; p_role: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "moderator", "admin", "super_admin"],
    },
  },
} as const
