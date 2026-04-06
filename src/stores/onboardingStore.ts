import { create } from 'zustand';

interface ProfileData {
  displayName: string;
  username: string;
  city: string;
  state: string;
  avatarUrl: string;
}

interface Preferences {
  budgetTier: 'free' | 'budget' | 'moderate' | 'splurge' | 'no_limit';
  dietaryRestrictions: string[];
  drinkPreference: 'none' | 'social' | 'enthusiast';
  activityEnergy: 'chill' | 'moderate' | 'active' | 'adventure';
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
}

interface OnboardingState {
  currentStep: number;
  profileData: ProfileData;
  calendarConnected: boolean;
  selectedInterests: string[];
  preferences: Preferences;
  friendsAdded: string[];

  setStep: (step: number) => void;
  updateProfileData: (data: Partial<ProfileData>) => void;
  updatePreferences: (data: Partial<Preferences>) => void;
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  setCalendarConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  profileData: {
    displayName: '',
    username: '',
    city: '',
    state: '',
    avatarUrl: '',
  },
  calendarConnected: false,
  selectedInterests: [] as string[],
  preferences: {
    budgetTier: 'moderate' as const,
    dietaryRestrictions: [] as string[],
    drinkPreference: 'social' as const,
    activityEnergy: 'moderate' as const,
    indoorOutdoor: 'both' as const,
  },
  friendsAdded: [] as string[],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setStep: (step) =>
    set({ currentStep: Math.min(Math.max(step, 1), 5) }),

  updateProfileData: (data) =>
    set((state) => ({
      profileData: { ...state.profileData, ...data },
    })),

  updatePreferences: (data) =>
    set((state) => ({
      preferences: { ...state.preferences, ...data },
    })),

  addInterest: (interest) =>
    set((state) => ({
      selectedInterests: state.selectedInterests.includes(interest)
        ? state.selectedInterests
        : [...state.selectedInterests, interest],
    })),

  removeInterest: (interest) =>
    set((state) => ({
      selectedInterests: state.selectedInterests.filter((i) => i !== interest),
    })),

  setCalendarConnected: (connected) =>
    set({ calendarConnected: connected }),

  reset: () => set(initialState),
}));
