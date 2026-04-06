import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return Response.json(
        { error: 'Search query "q" is required' },
        { status: 400 }
      );
    }

    const searchTerm = `%${q.trim()}%`;

    // Search profiles by username or display_name, excluding current user
    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio, city, state')
      .neq('id', user.id)
      .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
      .limit(20);

    if (searchError) {
      return Response.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return Response.json({ results: [] });
    }

    // Fetch friendship statuses for all results
    const profileIds = profiles.map((p) => p.id);

    const { data: friendships } = await supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, status')
      .or(
        `and(requester_id.eq.${user.id},addressee_id.in.(${profileIds.join(',')})),and(addressee_id.eq.${user.id},requester_id.in.(${profileIds.join(',')}))`
      );

    // Build a map of user ID to friendship status
    const friendshipMap = new Map<
      string,
      { status: string; friendshipId: string }
    >();

    for (const f of friendships ?? []) {
      const otherUserId =
        f.requester_id === user.id ? f.addressee_id : f.requester_id;
      friendshipMap.set(otherUserId, {
        status: f.status,
        friendshipId: f.id,
      });
    }

    const results = profiles.map((profile) => {
      const friendship = friendshipMap.get(profile.id);
      return {
        ...profile,
        friendship_status: friendship?.status ?? null,
        friendship_id: friendship?.friendshipId ?? null,
      };
    });

    return Response.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
