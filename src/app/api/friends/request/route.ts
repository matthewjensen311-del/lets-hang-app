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
    const { addresseeId } = body as { addresseeId?: string };

    if (!addresseeId) {
      return Response.json(
        { error: 'addresseeId is required' },
        { status: 400 }
      );
    }

    // Cannot friend yourself
    if (addresseeId === user.id) {
      return Response.json(
        { error: 'You cannot send a friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if addressee exists
    const { data: addresseeProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', addresseeId)
      .single();

    if (profileError || !addresseeProfile) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing friendship (in either direction)
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('id, status')
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
      )
      .single();

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return Response.json(
          { error: 'You are already friends with this user' },
          { status: 409 }
        );
      }
      if (existingFriendship.status === 'pending') {
        return Response.json(
          { error: 'A friend request already exists between you and this user' },
          { status: 409 }
        );
      }
      if (existingFriendship.status === 'blocked') {
        return Response.json(
          { error: 'Unable to send friend request' },
          { status: 403 }
        );
      }
    }

    // Insert friendship
    const { data: friendship, error: insertError } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError || !friendship) {
      return Response.json(
        { error: 'Failed to create friend request' },
        { status: 500 }
      );
    }

    // Fetch requester's profile for notification
    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single();

    const requesterName =
      requesterProfile?.display_name ?? requesterProfile?.username ?? 'Someone';

    // Insert notification for addressee
    await supabase.from('notifications').insert({
      user_id: addresseeId,
      type: 'friend_request',
      title: 'New Friend Request',
      body: `${requesterName} sent you a friend request`,
      data: { friendship_id: friendship.id, requester_id: user.id },
    });

    return Response.json({ friendship }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
