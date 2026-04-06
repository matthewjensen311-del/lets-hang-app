export type CalendarProvider = 'google' | 'apple' | 'outlook';

export interface CalendarConnection {
  id: string;
  provider: CalendarProvider;
  providerAccountId: string;
  calendarIds: string[];
  lastSyncedAt: string | null;
  isActive: boolean;
}

export interface CalendarEvent {
  id: string;
  externalEventId: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  isBusy: boolean;
}

export interface AvailabilityWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  label?: string;
}

export interface SharedAvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  label?: string;
}
