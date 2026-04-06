export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          state: string | null;
          timezone: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          state?: string | null;
          timezone?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          state?: string | null;
          timezone?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          budget_tier: "free" | "budget" | "moderate" | "splurge" | "no_limit";
          interests: string[];
          food_preferences: string[];
          dietary_restrictions: string[];
          activity_energy: "chill" | "moderate" | "active" | "adventure";
          indoor_outdoor: "indoor" | "outdoor" | "both";
          max_travel_distance_miles: number;
          preferred_group_size:
            | "one_on_one"
            | "small"
            | "medium"
            | "large"
            | "any";
          drink_preference: "none" | "social" | "enthusiast";
          early_bird_night_owl: "early_bird" | "night_owl" | "flexible";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          budget_tier?: "free" | "budget" | "moderate" | "splurge" | "no_limit";
          interests?: string[];
          food_preferences?: string[];
          dietary_restrictions?: string[];
          activity_energy?: "chill" | "moderate" | "active" | "adventure";
          indoor_outdoor?: "indoor" | "outdoor" | "both";
          max_travel_distance_miles?: number;
          preferred_group_size?:
            | "one_on_one"
            | "small"
            | "medium"
            | "large"
            | "any";
          drink_preference?: "none" | "social" | "enthusiast";
          early_bird_night_owl?: "early_bird" | "night_owl" | "flexible";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          budget_tier?: "free" | "budget" | "moderate" | "splurge" | "no_limit";
          interests?: string[];
          food_preferences?: string[];
          dietary_restrictions?: string[];
          activity_energy?: "chill" | "moderate" | "active" | "adventure";
          indoor_outdoor?: "indoor" | "outdoor" | "both";
          max_travel_distance_miles?: number;
          preferred_group_size?:
            | "one_on_one"
            | "small"
            | "medium"
            | "large"
            | "any";
          drink_preference?: "none" | "social" | "enthusiast";
          early_bird_night_owl?: "early_bird" | "night_owl" | "flexible";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_connections: {
        Row: {
          id: string;
          user_id: string;
          provider: "google" | "apple" | "outlook";
          provider_account_id: string;
          access_token: string;
          refresh_token: string | null;
          token_expires_at: string | null;
          calendar_ids: string[];
          last_synced_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: "google" | "apple" | "outlook";
          provider_account_id: string;
          access_token: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          calendar_ids?: string[];
          last_synced_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: "google" | "apple" | "outlook";
          provider_account_id?: string;
          access_token?: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          calendar_ids?: string[];
          last_synced_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          connection_id: string;
          external_event_id: string;
          title: string | null;
          start_time: string;
          end_time: string;
          is_all_day: boolean;
          is_busy: boolean;
          recurrence_rule: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          connection_id: string;
          external_event_id: string;
          title?: string | null;
          start_time: string;
          end_time: string;
          is_all_day?: boolean;
          is_busy?: boolean;
          recurrence_rule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          connection_id?: string;
          external_event_id?: string;
          title?: string | null;
          start_time?: string;
          end_time?: string;
          is_all_day?: boolean;
          is_busy?: boolean;
          recurrence_rule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_events_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "calendar_connections";
            referencedColumns: ["id"];
          },
        ];
      };
      hangout_availability: {
        Row: {
          id: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          label?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hangout_availability_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted" | "blocked";
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: "pending" | "accepted" | "blocked";
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: "pending" | "accepted" | "blocked";
          created_at?: string;
          accepted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          emoji: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          emoji?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          emoji?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: "admin" | "member";
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: "admin" | "member";
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: "admin" | "member";
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      hangouts: {
        Row: {
          id: string;
          title: string;
          created_by: string;
          group_id: string | null;
          status:
            | "proposed"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled";
          scheduled_start: string | null;
          scheduled_end: string | null;
          vibe: string | null;
          vibe_tags: string[];
          budget_cap: number | null;
          location_center_lat: number | null;
          location_center_lng: number | null;
          location_radius_miles: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          created_by: string;
          group_id?: string | null;
          status?:
            | "proposed"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled";
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          vibe?: string | null;
          vibe_tags?: string[];
          budget_cap?: number | null;
          location_center_lat?: number | null;
          location_center_lng?: number | null;
          location_radius_miles?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          created_by?: string;
          group_id?: string | null;
          status?:
            | "proposed"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled";
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          vibe?: string | null;
          vibe_tags?: string[];
          budget_cap?: number | null;
          location_center_lat?: number | null;
          location_center_lng?: number | null;
          location_radius_miles?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hangouts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hangouts_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      hangout_participants: {
        Row: {
          id: string;
          hangout_id: string;
          user_id: string;
          rsvp_status: "pending" | "going" | "maybe" | "declined";
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          hangout_id: string;
          user_id: string;
          rsvp_status?: "pending" | "going" | "maybe" | "declined";
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          hangout_id?: string;
          user_id?: string;
          rsvp_status?: "pending" | "going" | "maybe" | "declined";
          responded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hangout_participants_hangout_id_fkey";
            columns: ["hangout_id"];
            isOneToOne: false;
            referencedRelation: "hangouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hangout_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      itinerary_items: {
        Row: {
          id: string;
          hangout_id: string;
          order_index: number;
          type:
            | "food"
            | "activity"
            | "drinks"
            | "entertainment"
            | "transport"
            | "other";
          title: string;
          description: string | null;
          venue_name: string | null;
          venue_address: string | null;
          venue_lat: number | null;
          venue_lng: number | null;
          venue_google_place_id: string | null;
          venue_photo_url: string | null;
          venue_rating: number | null;
          venue_price_level: number | null;
          estimated_start: string | null;
          estimated_end: string | null;
          estimated_cost_per_person: number | null;
          booking_url: string | null;
          booking_status: "none" | "suggested" | "booked" | "confirmed";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hangout_id: string;
          order_index: number;
          type:
            | "food"
            | "activity"
            | "drinks"
            | "entertainment"
            | "transport"
            | "other";
          title: string;
          description?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          venue_lat?: number | null;
          venue_lng?: number | null;
          venue_google_place_id?: string | null;
          venue_photo_url?: string | null;
          venue_rating?: number | null;
          venue_price_level?: number | null;
          estimated_start?: string | null;
          estimated_end?: string | null;
          estimated_cost_per_person?: number | null;
          booking_url?: string | null;
          booking_status?: "none" | "suggested" | "booked" | "confirmed";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hangout_id?: string;
          order_index?: number;
          type?:
            | "food"
            | "activity"
            | "drinks"
            | "entertainment"
            | "transport"
            | "other";
          title?: string;
          description?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          venue_lat?: number | null;
          venue_lng?: number | null;
          venue_google_place_id?: string | null;
          venue_photo_url?: string | null;
          venue_rating?: number | null;
          venue_price_level?: number | null;
          estimated_start?: string | null;
          estimated_end?: string | null;
          estimated_cost_per_person?: number | null;
          booking_url?: string | null;
          booking_status?: "none" | "suggested" | "booked" | "confirmed";
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "itinerary_items_hangout_id_fkey";
            columns: ["hangout_id"];
            isOneToOne: false;
            referencedRelation: "hangouts";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          data: Record<string, unknown> | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          data?: Record<string, unknown> | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          data?: Record<string, unknown> | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      budget_tier: "free" | "budget" | "moderate" | "splurge" | "no_limit";
      activity_energy: "chill" | "moderate" | "active" | "adventure";
      indoor_outdoor: "indoor" | "outdoor" | "both";
      preferred_group_size:
        | "one_on_one"
        | "small"
        | "medium"
        | "large"
        | "any";
      drink_preference: "none" | "social" | "enthusiast";
      time_preference: "early_bird" | "night_owl" | "flexible";
      calendar_provider: "google" | "apple" | "outlook";
      friendship_status: "pending" | "accepted" | "blocked";
      group_role: "admin" | "member";
      hangout_status:
        | "proposed"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled";
      rsvp_status: "pending" | "going" | "maybe" | "declined";
      itinerary_type:
        | "food"
        | "activity"
        | "drinks"
        | "entertainment"
        | "transport"
        | "other";
      booking_status: "none" | "suggested" | "booked" | "confirmed";
    };
    CompositeTypes: Record<string, never>;
  };
}

/** Helper types for easier access */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
