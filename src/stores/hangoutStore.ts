import { create } from 'zustand';
import type { ItineraryResponse } from '@/types/hangout';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface HangoutState {
  step: number;
  selectedFriends: string[];
  selectedGroupId: string | null;
  selectedTimeSlot: TimeSlot | null;
  duration: number;
  vibeMode: 'interests' | 'describe';
  vibeText: string;
  selectedVibeTags: string[];
  selectedInterests: string[];
  itinerary: ItineraryResponse | null;
  loading: boolean;

  setStep: (step: number) => void;
  setSelectedFriends: (friends: string[]) => void;
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  setSelectedGroupId: (groupId: string | null) => void;
  setSelectedTimeSlot: (slot: TimeSlot | null) => void;
  setDuration: (duration: number) => void;
  setVibeMode: (mode: 'interests' | 'describe') => void;
  setVibeText: (text: string) => void;
  setSelectedVibeTags: (tags: string[]) => void;
  setSelectedInterests: (interests: string[]) => void;
  setItinerary: (itinerary: ItineraryResponse | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  selectedFriends: [] as string[],
  selectedGroupId: null as string | null,
  selectedTimeSlot: null as TimeSlot | null,
  duration: 120,
  vibeMode: 'interests' as const,
  vibeText: '',
  selectedVibeTags: [] as string[],
  selectedInterests: [] as string[],
  itinerary: null as ItineraryResponse | null,
  loading: false,
};

export const useHangoutStore = create<HangoutState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step: Math.min(Math.max(step, 1), 5) }),

  setSelectedFriends: (friends) => set({ selectedFriends: friends }),

  addFriend: (friendId) =>
    set((state) => ({
      selectedFriends: state.selectedFriends.includes(friendId)
        ? state.selectedFriends
        : [...state.selectedFriends, friendId],
    })),

  removeFriend: (friendId) =>
    set((state) => ({
      selectedFriends: state.selectedFriends.filter((id) => id !== friendId),
    })),

  setSelectedGroupId: (groupId) => set({ selectedGroupId: groupId }),

  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),

  setDuration: (duration) => set({ duration }),

  setVibeMode: (mode) => set({ vibeMode: mode }),

  setVibeText: (text) => set({ vibeText: text }),

  setSelectedVibeTags: (tags) => set({ selectedVibeTags: tags }),

  setSelectedInterests: (interests) => set({ selectedInterests: interests }),

  setItinerary: (itinerary) => set({ itinerary }),

  setLoading: (loading) => set({ loading }),

  reset: () => set(initialState),
}));
