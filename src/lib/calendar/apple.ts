import { DAVClient, fetchCalendarObjects, fetchCalendars } from 'tsdav';
import type { CalendarEvent } from '@/types/calendar';

// ── Client creation ───────────────────────────────────────────────────

export async function createAppleDAVClient(
  username: string,
  password: string
): Promise<DAVClient> {
  const client = new DAVClient({
    serverUrl: 'https://caldav.icloud.com',
    credentials: {
      username,
      password,
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });

  await client.login();

  return client;
}

// ── Fetch events ──────────────────────────────────────────────────────

export async function fetchAppleCalendarEvents(
  client: DAVClient,
  calendarUrl: string,
  timeRange: { start: Date; end: Date }
): Promise<CalendarEvent[]> {
  const calendars = await fetchCalendars({ account: client.account! });

  const targetCalendar = calendars.find((cal) => cal.url === calendarUrl);

  if (!targetCalendar) {
    throw new Error(`Calendar not found at URL: ${calendarUrl}`);
  }

  const calendarObjects = await fetchCalendarObjects({
    calendar: targetCalendar,
    timeRange: {
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
    },
  });

  const events: CalendarEvent[] = [];

  for (const obj of calendarObjects) {
    if (!obj.data || !obj.url) continue;

    const parsed = parseVCalendar(obj.data, obj.url);
    if (parsed) {
      events.push(parsed);
    }
  }

  return events;
}

// ── iCalendar parser (minimal VEVENT extraction) ──────────────────────

function parseVCalendar(icalData: string, objectUrl: string): CalendarEvent | null {
  const veventMatch = icalData.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
  if (!veventMatch) return null;

  const vevent = veventMatch[0];

  const uid = extractProperty(vevent, 'UID') ?? objectUrl;
  const dtstart = extractProperty(vevent, 'DTSTART');
  const dtend = extractProperty(vevent, 'DTEND');
  const transp = extractProperty(vevent, 'TRANSP');

  if (!dtstart) return null;

  const isAllDay = dtstart.length === 8; // YYYYMMDD format (no time component)
  const startTime = parseICalDate(dtstart);
  const endTime = dtend ? parseICalDate(dtend) : startTime;
  const isBusy = transp !== 'TRANSPARENT';

  return {
    id: '',
    externalEventId: uid,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    isAllDay,
    isBusy,
  };
}

function extractProperty(vevent: string, property: string): string | null {
  // Handle properties with parameters like DTSTART;VALUE=DATE:20240101
  const regex = new RegExp(`^${property}[;:](.*)$`, 'm');
  const match = vevent.match(regex);
  if (!match) return null;

  const value = match[1];
  // If there's a colon (indicating parameters before the value), take the part after the last colon
  const colonIndex = value.lastIndexOf(':');
  return colonIndex !== -1 ? value.slice(colonIndex + 1).trim() : value.trim();
}

function parseICalDate(dateStr: string): Date {
  // Handle formats: YYYYMMDD, YYYYMMDDTHHmmss, YYYYMMDDTHHmmssZ
  const cleaned = dateStr.replace(/[^0-9TZ]/g, '');

  if (cleaned.length === 8) {
    // YYYYMMDD — all-day event
    const year = parseInt(cleaned.slice(0, 4), 10);
    const month = parseInt(cleaned.slice(4, 6), 10) - 1;
    const day = parseInt(cleaned.slice(6, 8), 10);
    return new Date(year, month, day);
  }

  // YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
  const year = parseInt(cleaned.slice(0, 4), 10);
  const month = parseInt(cleaned.slice(4, 6), 10) - 1;
  const day = parseInt(cleaned.slice(6, 8), 10);
  const hour = parseInt(cleaned.slice(9, 11), 10);
  const minute = parseInt(cleaned.slice(11, 13), 10);
  const second = parseInt(cleaned.slice(13, 15), 10) || 0;

  if (cleaned.endsWith('Z')) {
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }

  return new Date(year, month, day, hour, minute, second);
}
