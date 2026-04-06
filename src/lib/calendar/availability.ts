import { createClient } from '@/lib/supabase/server';
import type { SharedAvailabilitySlot } from '@/types/calendar';

interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Compute shared availability across multiple users within a date range.
 * Considers each user's recurring availability windows and subtracts busy calendar events.
 */
export async function computeSharedAvailability(
  userIds: string[],
  startDate: Date,
  endDate: Date
): Promise<SharedAvailabilitySlot[]> {
  if (userIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  // 1. Fetch hangout_availability for all users
  const { data: availabilityRows, error: availError } = await supabase
    .from('hangout_availability')
    .select('*')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (availError) {
    throw new Error('Failed to fetch availability');
  }

  if (!availabilityRows || availabilityRows.length === 0) {
    return [];
  }

  // 3. Fetch calendar_events for all users in the date range where is_busy=true
  const { data: busyEvents, error: eventsError } = await supabase
    .from('calendar_events')
    .select('*')
    .in('user_id', userIds)
    .eq('is_busy', true)
    .gte('start_time', startDate.toISOString())
    .lte('end_time', endDate.toISOString());

  if (eventsError) {
    throw new Error('Failed to fetch calendar events');
  }

  // Group availability by user
  const availByUser = new Map<string, typeof availabilityRows>();
  for (const row of availabilityRows) {
    const existing = availByUser.get(row.user_id) ?? [];
    existing.push(row);
    availByUser.set(row.user_id, existing);
  }

  // Group busy events by user
  const busyByUser = new Map<string, TimeRange[]>();
  for (const event of busyEvents ?? []) {
    const existing = busyByUser.get(event.user_id) ?? [];
    existing.push({
      start: new Date(event.start_time),
      end: new Date(event.end_time),
    });
    busyByUser.set(event.user_id, existing);
  }

  // 2. For each day in range, expand recurring windows to concrete datetime ranges
  const days = getDaysInRange(startDate, endDate);

  // For each user, compute their available time ranges
  const userAvailableRanges = new Map<string, TimeRange[]>();

  for (const userId of userIds) {
    const userAvail = availByUser.get(userId) ?? [];
    const userBusy = busyByUser.get(userId) ?? [];
    const ranges: TimeRange[] = [];

    for (const day of days) {
      const dayOfWeek = day.getDay(); // 0=Sunday

      // Find matching availability windows for this day
      const matchingWindows = userAvail.filter(
        (a) => a.day_of_week === dayOfWeek
      );

      for (const window of matchingWindows) {
        // Convert start_time/end_time (HH:MM:SS) to full datetime
        const windowStart = combineDateAndTime(day, window.start_time);
        const windowEnd = combineDateAndTime(day, window.end_time);

        if (windowEnd <= windowStart) continue;

        // 4. Subtract busy events from this window
        const freeSlots = subtractBusyFromWindow(
          { start: windowStart, end: windowEnd },
          userBusy
        );

        ranges.push(...freeSlots);
      }
    }

    userAvailableRanges.set(userId, ranges);
  }

  // 5. Compute INTERSECTION of all users' remaining windows
  let sharedRanges: TimeRange[] | null = null;

  for (const userId of userIds) {
    const userRanges = userAvailableRanges.get(userId) ?? [];
    if (sharedRanges === null) {
      sharedRanges = userRanges;
    } else {
      sharedRanges = intersectRanges(sharedRanges, userRanges);
    }
  }

  if (!sharedRanges || sharedRanges.length === 0) {
    return [];
  }

  // 6. Merge contiguous slots, filter to minimum 60 minutes
  const merged = mergeContiguousRanges(sharedRanges);

  const MIN_DURATION_MS = 60 * 60 * 1000; // 60 minutes

  // 7. Return sorted by date/time with durationMinutes calculated
  const slots: SharedAvailabilitySlot[] = merged
    .filter((range) => range.end.getTime() - range.start.getTime() >= MIN_DURATION_MS)
    .map((range) => ({
      date: formatDate(range.start),
      startTime: formatTime(range.start),
      endTime: formatTime(range.end),
      durationMinutes: Math.round(
        (range.end.getTime() - range.start.getTime()) / (60 * 1000)
      ),
    }))
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

  return slots;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  const endNormalized = new Date(end);
  endNormalized.setHours(23, 59, 59, 999);

  while (current <= endNormalized) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function combineDateAndTime(date: Date, timeStr: string): Date {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours ?? 0, minutes ?? 0, seconds ?? 0, 0);
  return combined;
}

function subtractBusyFromWindow(
  window: TimeRange,
  busyRanges: TimeRange[]
): TimeRange[] {
  let freeSlots: TimeRange[] = [{ ...window }];

  for (const busy of busyRanges) {
    const newFreeSlots: TimeRange[] = [];

    for (const slot of freeSlots) {
      // No overlap
      if (busy.end <= slot.start || busy.start >= slot.end) {
        newFreeSlots.push(slot);
        continue;
      }

      // Busy event starts after slot start - keep the part before
      if (busy.start > slot.start) {
        newFreeSlots.push({ start: slot.start, end: busy.start });
      }

      // Busy event ends before slot end - keep the part after
      if (busy.end < slot.end) {
        newFreeSlots.push({ start: busy.end, end: slot.end });
      }
    }

    freeSlots = newFreeSlots;
  }

  return freeSlots;
}

function intersectRanges(a: TimeRange[], b: TimeRange[]): TimeRange[] {
  const result: TimeRange[] = [];

  for (const rangeA of a) {
    for (const rangeB of b) {
      const start = new Date(Math.max(rangeA.start.getTime(), rangeB.start.getTime()));
      const end = new Date(Math.min(rangeA.end.getTime(), rangeB.end.getTime()));

      if (start < end) {
        result.push({ start, end });
      }
    }
  }

  return result;
}

function mergeContiguousRanges(ranges: TimeRange[]): TimeRange[] {
  if (ranges.length === 0) return [];

  const sorted = [...ranges].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const merged: TimeRange[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];

    if (current.start.getTime() <= last.end.getTime()) {
      last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 8); // HH:MM:SS
}
