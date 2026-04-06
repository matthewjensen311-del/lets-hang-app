import { createClient } from '@/lib/supabase/server';
import { matchPreferences } from '@/lib/utils/preferences';
import {
  generateItinerary,
  swapItineraryItem,
  regenerateItinerary,
} from '@/lib/ai/itinerary';
import type { UserPreferences } from '@/types/user';
import type { ItineraryResponse } from '@/types/hangout';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { hangoutId, action, itemOrder } = body as {
      hangoutId?: string;
      action?: 'swap' | 'regenerate';
      itemOrder?: number;
    };

    if (!hangoutId) {
      return Response.json(
        { error: 'hangoutId is required' },
        { status: 400 }
      );
    }

    // Rate limit: max 10 itinerary generations per user per day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount, error: countError } = await supabase
      .from('itinerary_items')
      .select('id, hangouts!inner(created_by)', { count: 'exact', head: true })
      .eq('hangouts.created_by', user.id)
      .gte('created_at', todayStart.toISOString());

    if (!countError && todayCount !== null && todayCount > 10) {
      return Response.json(
        { error: 'Daily itinerary generation limit reached (10 per day)' },
        { status: 429 }
      );
    }

    // Fetch hangout with participants
    const { data: hangout, error: hangoutError } = await supabase
      .from('hangouts')
      .select('*')
      .eq('id', hangoutId)
      .single();

    if (hangoutError || !hangout) {
      return Response.json({ error: 'Hangout not found' }, { status: 404 });
    }

    const { data: participants, error: participantsError } = await supabase
      .from('hangout_participants')
      .select('user_id')
      .eq('hangout_id', hangoutId);

    if (participantsError || !participants) {
      return Response.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    const participantUserIds = participants.map((p) => p.user_id);

    // Fetch user preferences for all participants
    const { data: preferencesData, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .in('user_id', participantUserIds);

    if (prefsError) {
      return Response.json(
        { error: 'Failed to fetch user preferences' },
        { status: 500 }
      );
    }

    const preferences = (preferencesData ?? []) as UserPreferences[];
    const matched = matchPreferences(preferences);

    // Build location string
    const location =
      hangout.location_center_lat && hangout.location_center_lng
        ? `${hangout.location_center_lat},${hangout.location_center_lng}`
        : 'User location';

    // Calculate duration in hours
    const durationMs =
      hangout.scheduled_start && hangout.scheduled_end
        ? new Date(hangout.scheduled_end).getTime() -
          new Date(hangout.scheduled_start).getTime()
        : 3 * 60 * 60 * 1000; // default 3 hours
    const durationHours = Math.max(1, Math.round(durationMs / (60 * 60 * 1000)));

    const itineraryParams = {
      participants: preferences.map((p) => ({
        interests: p.interests,
        dietaryRestrictions: p.dietary_restrictions,
        budgetTier: p.budget_tier,
      })),
      sharedInterests: matched.sharedInterests,
      lowestBudget: matched.lowestBudget,
      mergedDietary: matched.mergedDietary,
      dateTime: hangout.scheduled_start ?? new Date().toISOString(),
      duration: durationHours,
      location,
      vibe: hangout.vibe ?? 'casual',
      vibeTags: hangout.vibe_tags ?? [],
      indoorOutdoor: matched.majorityIndoorOutdoor,
      energyLevel: matched.majorityEnergy,
      participantCount: participantUserIds.length,
    };

    // Handle swap action
    if (action === 'swap') {
      if (itemOrder === undefined || itemOrder === null) {
        return Response.json(
          { error: 'itemOrder is required for swap action' },
          { status: 400 }
        );
      }

      // Fetch existing itinerary items
      const { data: existingItems, error: itemsError } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('hangout_id', hangoutId)
        .order('order_index', { ascending: true });

      if (itemsError || !existingItems || existingItems.length === 0) {
        return Response.json(
          { error: 'No existing itinerary to swap from' },
          { status: 404 }
        );
      }

      // Reconstruct ItineraryResponse from DB items
      const currentItinerary: ItineraryResponse = {
        title: hangout.title,
        description: '',
        vibe_summary: hangout.vibe ?? '',
        total_estimated_cost_per_person: existingItems.reduce(
          (sum, item) => sum + (item.estimated_cost_per_person ?? 0),
          0
        ),
        items: existingItems.map((item) => ({
          order_index: item.order_index,
          type: item.type,
          title: item.title,
          description: item.description ?? '',
          venue_name: item.venue_name ?? '',
          venue_address: item.venue_address ?? '',
          estimated_start: item.estimated_start ?? '',
          estimated_end: item.estimated_end ?? '',
          estimated_cost_per_person: item.estimated_cost_per_person ?? 0,
          booking_url: item.booking_url ?? undefined,
          notes: item.notes ?? undefined,
        })),
      };

      const newItem = await swapItineraryItem(currentItinerary, itemOrder, {
        budget: matched.lowestBudget,
        dietary: matched.mergedDietary,
        location,
      });

      // Update the specific item in DB
      const { error: updateError } = await supabase
        .from('itinerary_items')
        .update({
          type: newItem.type,
          title: newItem.title,
          description: newItem.description,
          venue_name: newItem.venue_name,
          venue_address: newItem.venue_address,
          estimated_start: newItem.estimated_start || null,
          estimated_end: newItem.estimated_end || null,
          estimated_cost_per_person: newItem.estimated_cost_per_person,
          booking_url: newItem.booking_url ?? null,
          notes: newItem.notes ?? null,
        })
        .eq('hangout_id', hangoutId)
        .eq('order_index', itemOrder);

      if (updateError) {
        return Response.json(
          { error: 'Failed to update itinerary item' },
          { status: 500 }
        );
      }

      // Return updated itinerary
      const { data: updatedItems } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('hangout_id', hangoutId)
        .order('order_index', { ascending: true });

      return Response.json({ itinerary: updatedItems });
    }

    // Handle regenerate action
    if (action === 'regenerate') {
      // Fetch existing itinerary for context
      const { data: existingItems } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('hangout_id', hangoutId)
        .order('order_index', { ascending: true });

      const previousItinerary: ItineraryResponse = {
        title: hangout.title,
        description: '',
        vibe_summary: hangout.vibe ?? '',
        total_estimated_cost_per_person: (existingItems ?? []).reduce(
          (sum, item) => sum + (item.estimated_cost_per_person ?? 0),
          0
        ),
        items: (existingItems ?? []).map((item) => ({
          order_index: item.order_index,
          type: item.type,
          title: item.title,
          description: item.description ?? '',
          venue_name: item.venue_name ?? '',
          venue_address: item.venue_address ?? '',
          estimated_start: item.estimated_start ?? '',
          estimated_end: item.estimated_end ?? '',
          estimated_cost_per_person: item.estimated_cost_per_person ?? 0,
          booking_url: item.booking_url ?? undefined,
          notes: item.notes ?? undefined,
        })),
      };

      // Delete existing items
      await supabase
        .from('itinerary_items')
        .delete()
        .eq('hangout_id', hangoutId);

      const itinerary = await regenerateItinerary(
        previousItinerary,
        itineraryParams
      );

      // Insert new items
      const newItems = itinerary.items.map((item) => ({
        hangout_id: hangoutId,
        order_index: item.order_index,
        type: item.type,
        title: item.title,
        description: item.description,
        venue_name: item.venue_name,
        venue_address: item.venue_address,
        estimated_start: item.estimated_start || null,
        estimated_end: item.estimated_end || null,
        estimated_cost_per_person: item.estimated_cost_per_person,
        booking_url: item.booking_url ?? null,
        notes: item.notes ?? null,
      }));

      const { data: insertedItems, error: insertError } = await supabase
        .from('itinerary_items')
        .insert(newItems)
        .select();

      if (insertError) {
        return Response.json(
          { error: 'Failed to save regenerated itinerary' },
          { status: 500 }
        );
      }

      return Response.json({ itinerary: insertedItems });
    }

    // Default: generate new itinerary
    const itinerary = await generateItinerary(itineraryParams);

    const itemsToInsert = itinerary.items.map((item) => ({
      hangout_id: hangoutId,
      order_index: item.order_index,
      type: item.type,
      title: item.title,
      description: item.description,
      venue_name: item.venue_name,
      venue_address: item.venue_address,
      estimated_start: item.estimated_start || null,
      estimated_end: item.estimated_end || null,
      estimated_cost_per_person: item.estimated_cost_per_person,
      booking_url: item.booking_url ?? null,
      notes: item.notes ?? null,
    }));

    const { data: insertedItems, error: insertError } = await supabase
      .from('itinerary_items')
      .insert(itemsToInsert)
      .select();

    if (insertError) {
      return Response.json(
        { error: 'Failed to save itinerary' },
        { status: 500 }
      );
    }

    return Response.json({ itinerary: insertedItems });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
