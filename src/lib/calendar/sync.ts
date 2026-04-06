import { createClient } from '@/lib/supabase/server';
import {
  fetchGoogleCalendarEvents,
  refreshGoogleToken,
} from '@/lib/calendar/google';

export async function syncCalendar(
  connectionId: string,
  userId: string
): Promise<{ synced: number; errors: number }> {
  const supabase = await createClient();

  // 1. Fetch the calendar connection
  const { data: connection, error: connError } = await supabase
    .from('calendar_connections')
    .select('*')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .single();

  if (connError || !connection) {
    throw new Error('Calendar connection not found');
  }

  if (!connection.is_active) {
    throw new Error('Calendar connection is not active');
  }

  let accessToken = connection.access_token;
  let synced = 0;
  let errors = 0;

  // 2. Refresh token if expired
  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at);
    if (expiresAt <= new Date()) {
      if (!connection.refresh_token) {
        throw new Error('Token expired and no refresh token available');
      }

      try {
        const refreshed = await refreshGoogleToken(connection.refresh_token);
        accessToken = refreshed.accessToken;

        await supabase
          .from('calendar_connections')
          .update({
            access_token: refreshed.accessToken,
            token_expires_at: refreshed.expiresAt.toISOString(),
          })
          .eq('id', connectionId);
      } catch {
        throw new Error('Failed to refresh access token');
      }
    }
  }

  // 3. Fetch events based on provider
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 30);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 60);

  const calendarIds =
    connection.calendar_ids.length > 0
      ? connection.calendar_ids
      : ['primary'];

  for (const calendarId of calendarIds) {
    try {
      const events = await fetchGoogleCalendarEvents(
        accessToken,
        calendarId,
        timeMin,
        timeMax
      );

      // 4. Upsert events into calendar_events
      for (const event of events) {
        try {
          // Check for existing event by connection_id + external_event_id
          const { data: existing } = await supabase
            .from('calendar_events')
            .select('id')
            .eq('connection_id', connectionId)
            .eq('external_event_id', event.externalEventId)
            .single();

          if (existing) {
            await supabase
              .from('calendar_events')
              .update({
                title: null, // We don't store titles for privacy
                start_time: event.startTime,
                end_time: event.endTime,
                is_all_day: event.isAllDay,
                is_busy: event.isBusy,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);
          } else {
            await supabase.from('calendar_events').insert({
              user_id: userId,
              connection_id: connectionId,
              external_event_id: event.externalEventId,
              start_time: event.startTime,
              end_time: event.endTime,
              is_all_day: event.isAllDay,
              is_busy: event.isBusy,
            });
          }

          synced++;
        } catch {
          errors++;
        }
      }
    } catch {
      errors++;
    }
  }

  // 5. Update last_synced_at
  await supabase
    .from('calendar_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', connectionId);

  return { synced, errors };
}

export async function syncAllUserCalendars(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: connections, error } = await supabase
    .from('calendar_connections')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error || !connections) {
    throw new Error('Failed to fetch calendar connections');
  }

  for (const connection of connections) {
    try {
      await syncCalendar(connection.id, userId);
    } catch {
      // Continue syncing other connections even if one fails
    }
  }
}
