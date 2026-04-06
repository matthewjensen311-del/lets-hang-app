import type { Tables } from './database';

// ── Enums ──────────────────────────────────────────────────────────────

export type BudgetTier = 'free' | 'budget' | 'moderate' | 'splurge' | 'no_limit';

export type EnergyLevel = 'chill' | 'moderate' | 'active' | 'adventure';

export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both';

export type DrinkPreference = 'none' | 'social' | 'enthusiast';

export type GroupSize = 'one_on_one' | 'small' | 'medium' | 'large' | 'any';

export type TimePreference = 'early_bird' | 'night_owl' | 'flexible';

// ── Core Types ─────────────────────────────────────────────────────────

export type Profile = Tables<'profiles'>;

export interface UserPreferences {
  id: string;
  user_id: string;
  budget_tier: BudgetTier;
  interests: string[];
  food_preferences: string[];
  dietary_restrictions: string[];
  activity_energy: EnergyLevel;
  indoor_outdoor: IndoorOutdoor;
  max_travel_distance_miles: number;
  preferred_group_size: GroupSize;
  drink_preference: DrinkPreference;
  early_bird_night_owl: TimePreference;
  created_at: string;
  updated_at: string;
}

// ── Relationship Types ─────────────────────────────────────────────────

export interface FriendshipWithProfile {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  accepted_at: string | null;
  profile: Profile;
}

export interface GroupMemberWithProfile {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile: Profile;
}

export interface GroupWithMembers {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: GroupMemberWithProfile[];
}

// ── Preference Matching ────────────────────────────────────────────────

export interface MatchedPreferences {
  sharedInterests: string[];
  lowestBudget: BudgetTier;
  mergedDietary: string[];
  majorityEnergy: string;
  majorityIndoorOutdoor: string;
}
