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
    const { friendshipId } = body as { friendshipId?: string };

    if (!friendshipId) {
      return Response.json(
        { error: 'friendshipId is required' },
        { status: 400 }
      );
    }

    // Fetch the friendship
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (fetchError || !friendship) {
      return Response.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // Validate current user is the addressee
    if (friendship.addressee_id !== user.id) {
      return Response.json(
        { error: 'Only the recipient can accept a friend request' },
        { status: 403 }
      );
    }

    // Validate status is pending
    if (friendship.status !== 'pending') {
      return Response.json(
        { error: `Friend request is already ${friendship.status}` },
        { status: 400 }
      );
    }

    // Update to accepted
    const now = new Date().toISOString();
    const { data: updatedFriendship, error: updateError } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        accepted_at: now,
      })
      .eq('id', friendshipId)
      .select()
      .single();

    if (updateError || !updatedFriendship) {
      return Response.json(
        { error: 'Failed to accept friend request' },
        { status: 500 }
      );
    }

    // Fetch acceptor's profile for notification
    const { data: acceptorProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single();

    const acceptorName =
      acceptorProfile?.display_name ?? acceptorProfile?.username ?? 'Someone';

    // Insert notification for requester
    await supabase.from('notifications').insert({
      user_id: friendship.requester_id,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      body: `${acceptorName} accepted your friend request`,
      data: {
        friendship_id: friendshipId,
        acceptor_id: user.id,
      },
    });

    return Response.json({ friendship: updatedFriendship });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
