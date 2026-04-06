import {
  format,
  formatDistanceToNow,
  isBefore,
  isAfter,
  addDays,
  startOfDay,
  getDay,
  parse,
  eachDayOfInterval,
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Formats a date relative to now, e.g. "2 hours ago" or "in 3 days".
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Formats a hangout date range with timezone, e.g.
 * "Sat, Apr 5 · 2:00 PM – 5:00 PM EDT"
 */
export function formatHangoutDate(
  start: Date | string,
  end: Date | string,
  timezone: string
): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  const zonedStart = toZonedTime(startDate, timezone);
  const zonedEnd = toZonedTime(endDate, timezone);

  const dayPart = format(zonedStart, 'EEE, MMM d');
  const startTime = format(zonedStart, 'h:mm a');
  const endTime = format(zonedEnd, 'h:mm a');

  // Get timezone abbreviation
  const tzAbbr = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  })
    .formatToParts(startDate)
    .find((part) => part.type === 'timeZoneName')?.value ?? timezone;

  return `${dayPart} \u00B7 ${startTime} \u2013 ${endTime} ${tzAbbr}`;
}

/**
 * Formats a time range from two time strings (HH:mm or HH:mm:ss),
 * e.g. "2:00 PM – 5:00 PM"
 */
export function formatTimeRange(start: string, end: string): string {
  const baseDate = new Date(2000, 0, 1);
  const startDate = parse(start, start.length > 5 ? 'HH:mm:ss' : 'HH:mm', baseDate);
  const endDate = parse(end, end.length > 5 ? 'HH:mm:ss' : 'HH:mm', baseDate);

  return `${format(startDate, 'h:mm a')} \u2013 ${format(endDate, 'h:mm a')}`;
}

/**
 * Returns an array of the next N days starting from today.
 */
export function getNextNDays(n: number): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: n }, (_, i) => addDays(today, i));
}

/**
 * Expands recurring weekly availability windows into concrete date ranges
 * between startDate and endDate.
 */
export function expandRecurringAvailability(
  availability: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }[],
  startDate: Date,
  endDate: Date,
  timezone: string
): { date: string; start: Date; end: Date }[] {
  const activeWindows = availability.filter((w) => w.is_active);

  if (activeWindows.length === 0) {
    return [];
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const results: { date: string; start: Date; end: Date }[] = [];

  for (const day of days) {
    const dayOfWeek = getDay(day); // 0 = Sunday

    for (const window of activeWindows) {
      if (window.day_of_week !== dayOfWeek) {
        continue;
      }

      const dateStr = format(day, 'yyyy-MM-dd');

      // Parse start and end times relative to the timezone
      const startTimeFormat = window.start_time.length > 5 ? 'HH:mm:ss' : 'HH:mm';
      const endTimeFormat = window.end_time.length > 5 ? 'HH:mm:ss' : 'HH:mm';

      const localStart = parse(window.start_time, startTimeFormat, day);
      const localEnd = parse(window.end_time, endTimeFormat, day);

      // Convert from the specified timezone to UTC
      const utcStart = fromZonedTime(localStart, timezone);
      const utcEnd = fromZonedTime(localEnd, timezone);

      results.push({
        date: dateStr,
        start: utcStart,
        end: utcEnd,
      });
    }
  }

  return results;
}

/**
 * Returns true if the current time is between start and end.
 */
export function isCurrentlyHappening(
  start: Date | string,
  end: Date | string
): boolean {
  const now = new Date();
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  return isAfter(now, startDate) && isBefore(now, endDate);
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Returns the day name for a day-of-week number (0 = Sunday).
 */
export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? 'Unknown';
}
