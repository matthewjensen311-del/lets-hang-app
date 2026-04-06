import type { Profile } from './user';

// ── Enums ──────────────────────────────────────────────────────────────

export type HangoutStatus =
  | 'proposed'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RsvpStatus = 'pending' | 'going' | 'maybe' | 'declined';

export type VibeTag =
  | 'chill'
  | 'active'
  | 'romantic'
  | 'night-out'
  | 'foodie'
  | 'adventure'
  | 'cultural'
  | 'budget-friendly'
  | 'spontaneous'
  | 'celebration';

export type ItineraryItemType =
  | 'food'
  | 'activity'
  | 'drinks'
  | 'entertainment'
  | 'transport'
  | 'other';

export type BookingStatus = 'none' | 'suggested' | 'booked' | 'confirmed';

// ── Itinerary ──────────────────────────────────────────────────────────

export interface ItineraryItem {
  id: string;
  hangout_id: string;
  order_index: number;
  type: ItineraryItemType;
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
  booking_status: BookingStatus;
  notes: string | null;
  created_at: string;
}

// ── AI-generated itinerary response ────────────────────────────────────

export interface ItineraryResponseItem {
  order_index: number;
  type: ItineraryItemType;
  title: string;
  description: string;
  venue_name: string;
  venue_address: string;
  estimated_start: string;
  estimated_end: string;
  estimated_cost_per_person: number;
  booking_url?: string;
  notes?: string;
}

export interface ItineraryResponse {
  title: string;
  description: string;
  vibe_summary: string;
  total_estimated_cost_per_person: number;
  items: ItineraryResponseItem[];
}

// ── Hangout Participant ────────────────────────────────────────────────

export interface HangoutParticipant {
  id: string;
  hangout_id: string;
  user_id: string;
  rsvp_status: RsvpStatus;
  responded_at: string | null;
  profile: Profile;
}

// ── Hangout with full details ──────────────────────────────────────────

export interface HangoutWithDetails {
  id: string;
  title: string;
  created_by: string;
  group_id: string | null;
  status: HangoutStatus;
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
  participants: HangoutParticipant[];
  itinerary_items: ItineraryItem[];
}

// ── Creation flow data ─────────────────────────────────────────────────

export interface HangoutCreationData {
  title: string;
  group_id?: string;
  participant_ids: string[];
  scheduled_start: string;
  scheduled_end: string;
  vibe?: string;
  vibe_tags: VibeTag[];
  budget_cap?: number;
  location_center_lat?: number;
  location_center_lng?: number;
  location_radius_miles?: number;
  notes?: string;
}
