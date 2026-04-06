'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables, InsertTables } from '@/types/database';

type AvailabilityWindow = Tables<'hangout_availability'>;

export function useAvailability() {
  const [availability, setAvailability] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAvailability = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('hangout_availability')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true });

    setAvailability(data ?? []);
  }, [supabase]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchAvailability();
      setLoading(false);
    }
    load();
  }, [fetchAvailability]);

  const setAvailabilityWindows = useCallback(
    async (windows: Omit<InsertTables<'hangout_availability'>, 'user_id'>[]) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing availability for this user
      await supabase
        .from('hangout_availability')
        .delete()
        .eq('user_id', user.id);

      // Insert new windows
      const inserts = windows.map((w) => ({
        ...w,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('hangout_availability')
        .insert(inserts)
        .select();

      if (error) throw error;
      setAvailability(data ?? []);
      return data;
    },
    [supabase]
  );

  const toggleDay = useCallback(
    async (dayOfWeek: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existing = availability.filter((a) => a.day_of_week === dayOfWeek);

      if (existing.length > 0) {
        // Toggle is_active for all windows on this day
        const newActiveState = !existing[0].is_active;
        const { error } = await supabase
          .from('hangout_availability')
          .update({ is_active: newActiveState })
          .eq('user_id', user.id)
          .eq('day_of_week', dayOfWeek);

        if (error) throw error;

        setAvailability((prev) =>
          prev.map((a) =>
            a.day_of_week === dayOfWeek ? { ...a, is_active: newActiveState } : a
          )
        );
      } else {
        // Create a default window for this day
        const { data, error } = await supabase
          .from('hangout_availability')
          .insert({
            user_id: user.id,
            day_of_week: dayOfWeek,
            start_time: '09:00',
            end_time: '17:00',
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        setAvailability((prev) => [...prev, data]);
      }
    },
    [supabase, availability]
  );

  const getSharedAvailability = useCallback(
    async (userIds: string[], startDate: string, endDate: string) => {
      const { data, error } = await supabase
        .from('hangout_availability')
        .select('*')
        .in('user_id', userIds)
        .eq('is_active', true);

      if (error) throw error;

      // Also fetch calendar events for these users to exclude busy times
      const { data: busyEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .in('user_id', userIds)
        .eq('is_busy', true)
        .gte('start_time', startDate)
        .lte('end_time', endDate);

      // Group availability by day_of_week, find overlapping windows
      const availByDay = new Map<number, AvailabilityWindow[]>();
      for (const window of data ?? []) {
        const existing = availByDay.get(window.day_of_week) ?? [];
        existing.push(window);
        availByDay.set(window.day_of_week, existing);
      }

      // For each day, find time ranges where ALL users are available
      const sharedSlots: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }> = [];

      for (const [dayOfWeek, windows] of availByDay.entries()) {
        const userCoverage = new Set(windows.map((w) => w.user_id));
        // Only include days where all requested users have availability
        if (userCoverage.size === userIds.length) {
          const latestStart = windows.reduce(
            (latest, w) => (w.start_time > latest ? w.start_time : latest),
            '00:00'
          );
          const earliestEnd = windows.reduce(
            (earliest, w) => (w.end_time < earliest ? w.end_time : earliest),
            '23:59'
          );

          if (latestStart < earliestEnd) {
            sharedSlots.push({
              dayOfWeek,
              startTime: latestStart,
              endTime: earliestEnd,
            });
          }
        }
      }

      return { sharedSlots, busyEvents: busyEvents ?? [] };
    },
    [supabase]
  );

  return {
    availability,
    loading,
    setAvailability: setAvailabilityWindows,
    toggleDay,
    getSharedAvailability,
  };
}
