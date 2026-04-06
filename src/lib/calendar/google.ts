import { google } from 'googleapis';
import type { CalendarEvent } from '@/types/calendar';

// ── OAuth2 client factory ─────────────────────────────────────────────

function createOAuth2Client(redirectUri?: string) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri
  );
}

// ── Auth URL ──────────────────────────────────────────────────────────

export function getGoogleAuthUrl(redirectUri: string): string {
  const oauth2Client = createOAuth2Client(redirectUri);

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly',
    ],
  });
}

// ── Token exchange ────────────────────────────────────────────────────

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const oauth2Client = createOAuth2Client(redirectUri);

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error('No access token returned from Google');
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? '',
    expiresAt: tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000),
  };
}

// ── Token refresh ─────────────────────────────────────────────────────

export async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const oauth2Client = createOAuth2Client();

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh Google access token');
  }

  return {
    accessToken: credentials.access_token,
    expiresAt: credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600 * 1000),
  };
}

// ── Fetch calendar events ─────────────────────────────────────────────

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const events: CalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
      pageToken,
    });

    const items = response.data.items ?? [];

    for (const event of items) {
      if (!event.id) continue;

      const isAllDay = !event.start?.dateTime;
      const startTime = event.start?.dateTime ?? event.start?.date ?? '';
      const endTime = event.end?.dateTime ?? event.end?.date ?? '';

      // Determine busy status — default to busy unless explicitly free
      const isBusy = event.transparency !== 'transparent';

      events.push({
        id: '',
        externalEventId: event.id,
        startTime,
        endTime,
        isAllDay,
        isBusy,
      });
    }

    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return events;
}

// ── List calendars ────────────────────────────────────────────────────

export async function listGoogleCalendars(
  accessToken: string
): Promise<{ id: string; summary: string; primary: boolean }[]> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.calendarList.list();

  const items = response.data.items ?? [];

  return items
    .filter((cal) => cal.id)
    .map((cal) => ({
      id: cal.id!,
      summary: cal.summary ?? cal.id!,
      primary: cal.primary ?? false,
    }));
}
