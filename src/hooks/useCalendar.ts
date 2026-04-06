'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

type CalendarConnection = Tables<'calendar_connections'>;
type CalendarEvent = Tables<'calendar_events'>;

export function useCalendar() {
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchConnections = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    setConnections(data ?? []);
  }, [supabase]);

  const fetchEvents = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('end_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    setEvents(data ?? []);
  }, [supabase]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchConnections(), fetchEvents()]);
      setLoading(false);
    }
    load();
  }, [fetchConnections, fetchEvents]);

  const connectGoogle = useCallback(async () => {
    // Redirect to our API route which handles the Google OAuth flow for calendar
    window.location.href = '/api/calendar/google/connect';
  }, []);

  const disconnectCalendar = useCallback(
    async (connectionId: string) => {
      const { error } = await supabase
        .from('calendar_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    },
    [supabase]
  );

  const syncCalendar = useCallback(
    async (connectionId: string) => {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync calendar');
      }

      await fetchEvents();
    },
    [fetchEvents]
  );

  const isConnected = connections.length > 0;

  return {
    connections,
    events,
    loading,
    connectGoogle,
    disconnectCalendar,
    syncCalendar,
    isConnected,
  };
}
