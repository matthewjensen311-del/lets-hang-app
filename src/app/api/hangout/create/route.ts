import { createClient } from '@/lib/supabase/server';

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
    const {
      title,
      participantIds,
      groupId,
      scheduledStart,
      scheduledEnd,
      vibe,
      vibeTags,
      budgetCap,
      locationLat,
      locationLng,
      locationRadius,
    } = body as {
      title?: string;
      participantIds?: string[];
      groupId?: string;
      scheduledStart?: string;
      scheduledEnd?: string;
      vibe?: string;
      vibeTags?: string[];
      budgetCap?: number;
      locationLat?: number;
      locationLng?: number;
      locationRadius?: number;
    };

    if (!title || !title.trim()) {
      return Response.json({ error: 'title is required' }, { status: 400 });
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return Response.json(
        { error: 'participantIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!scheduledStart || !scheduledEnd) {
      return Response.json(
        { error: 'scheduledStart and scheduledEnd are required' },
        { status: 400 }
      );
    }

    // Insert the hangout
    const { data: hangout, error: hangoutError } = await supabase
      .from('hangouts')
      .insert({
        title: title.trim(),
        created_by: user.id,
        group_id: groupId ?? null,
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        vibe: vibe ?? null,
        vibe_tags: vibeTags ?? [],
        budget_cap: budgetCap ?? null,
        location_center_lat: locationLat ?? null,
        location_center_lng: locationLng ?? null,
        location_radius_miles: locationRadius ?? null,
      })
      .select()
      .single();

    if (hangoutError || !hangout) {
      return Response.json(
        { error: 'Failed to create hangout' },
        { status: 500 }
      );
    }

    // Build participant records: creator as 'going', others as 'pending'
    const allParticipantIds = new Set([user.id, ...participantIds]);
    const participantRecords = Array.from(allParticipantIds).map((uid) => ({
      hangout_id: hangout.id,
      user_id: uid,
      rsvp_status: uid === user.id ? ('going' as const) : ('pending' as const),
      responded_at: uid === user.id ? new Date().toISOString() : null,
    }));

    const { error: participantsError } = await supabase
      .from('hangout_participants')
      .insert(participantRecords);

    if (participantsError) {
      // Clean up the hangout if participants insertion fails
      await supabase.from('hangouts').delete().eq('id', hangout.id);
      return Response.json(
        { error: 'Failed to add participants' },
        { status: 500 }
      );
    }

    // Insert notifications for non-creator participants
    const notificationRecords = participantIds
      .filter((uid) => uid !== user.id)
      .map((uid) => ({
        user_id: uid,
        type: 'hangout_invite',
        title: 'New Hangout Invite',
        body: `You've been invited to "${hangout.title}"`,
        data: { hangout_id: hangout.id },
      }));

    if (notificationRecords.length > 0) {
      await supabase.from('notifications').insert(notificationRecords);
    }

    return Response.json({ hangout }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
