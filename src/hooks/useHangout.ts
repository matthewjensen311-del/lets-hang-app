'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

type Hangout = Tables<'hangouts'>;
type ItineraryItem = Tables<'itinerary_items'>;

interface ItineraryResponse {
  hangout: Hangout;
  items: ItineraryItem[];
}

interface CreateHangoutData {
  title: string;
  group_id?: string | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  vibe?: string | null;
  vibe_tags?: string[];
  budget_cap?: number | null;
  location_center_lat?: number | null;
  location_center_lng?: number | null;
  location_radius_miles?: number | null;
  notes?: string | null;
  participant_ids?: string[];
}

export function useHangout(hangoutId?: string) {
  const [hangout, setHangout] = useState<Hangout | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchHangout = useCallback(
    async (id: string) => {
      setLoading(true);

      const { data: hangoutData, error: hangoutError } = await supabase
        .from('hangouts')
        .select('*')
        .eq('id', id)
        .single();

      if (hangoutError) throw hangoutError;
      setHangout(hangoutData);

      const { data: items } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('hangout_id', id)
        .order('order_index', { ascending: true });

      setItinerary(items ?? []);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    if (hangoutId) {
      fetchHangout(hangoutId);
    }
  }, [hangoutId, fetchHangout]);

  const createHangout = useCallback(
    async (data: CreateHangoutData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { participant_ids, ...hangoutData } = data;

      const { data: newHangout, error } = await supabase
        .from('hangouts')
        .insert({
          ...hangoutData,
          created_by: user.id,
          status: 'proposed',
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as a participant
      const participants = [
        { hangout_id: newHangout.id, user_id: user.id, rsvp_status: 'going' as const },
        ...(participant_ids ?? []).map((id) => ({
          hangout_id: newHangout.id,
          user_id: id,
          rsvp_status: 'pending' as const,
        })),
      ];

      await supabase.from('hangout_participants').insert(participants);

      setHangout(newHangout);
      return newHangout;
    },
    [supabase]
  );

  const updateRsvp = useCallback(
    async (
      targetHangoutId: string,
      status: 'going' | 'maybe' | 'declined'
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('hangout_participants')
        .update({
          rsvp_status: status,
          responded_at: new Date().toISOString(),
        })
        .eq('hangout_id', targetHangoutId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    [supabase]
  );

  const generateItinerary = useCallback(
    async (targetHangoutId: string): Promise<ItineraryResponse> => {
      const response = await fetch('/api/hangouts/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hangoutId: targetHangoutId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const result: ItineraryResponse = await response.json();
      setHangout(result.hangout);
      setItinerary(result.items);
      return result;
    },
    []
  );

  const swapItineraryItem = useCallback(
    async (targetHangoutId: string, itemId: string) => {
      const response = await fetch('/api/hangouts/swap-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hangoutId: targetHangoutId, itemId }),
      });

      if (!response.ok) {
        throw new Error('Failed to swap itinerary item');
      }

      const newItem: ItineraryItem = await response.json();
      setItinerary((prev) =>
        prev.map((item) => (item.id === itemId ? newItem : item))
      );
      return newItem;
    },
    []
  );

  const cancelHangout = useCallback(
    async (targetHangoutId: string) => {
      const { data, error } = await supabase
        .from('hangouts')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', targetHangoutId)
        .select()
        .single();

      if (error) throw error;
      setHangout(data);
      return data;
    },
    [supabase]
  );

  return {
    hangout,
    itinerary,
    loading,
    createHangout,
    updateRsvp,
    generateItinerary,
    swapItineraryItem,
    cancelHangout,
  };
}
