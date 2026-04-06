'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

type Friendship = Tables<'friendships'>;
type Profile = Tables<'profiles'>;

interface FriendWithProfile extends Friendship {
  profile: Profile;
}

export function useFriends() {
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchFriends = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch accepted friendships where user is requester
    const { data: asRequester } = await supabase
      .from('friendships')
      .select('*, profile:profiles!friendships_addressee_id_fkey(*)')
      .eq('requester_id', user.id)
      .eq('status', 'accepted');

    // Fetch accepted friendships where user is addressee
    const { data: asAddressee } = await supabase
      .from('friendships')
      .select('*, profile:profiles!friendships_requester_id_fkey(*)')
      .eq('addressee_id', user.id)
      .eq('status', 'accepted');

    const allFriends = [
      ...(asRequester ?? []),
      ...(asAddressee ?? []),
    ] as FriendWithProfile[];

    setFriends(allFriends);

    // Fetch pending requests (where user is addressee)
    const { data: pending } = await supabase
      .from('friendships')
      .select('*, profile:profiles!friendships_requester_id_fkey(*)')
      .eq('addressee_id', user.id)
      .eq('status', 'pending');

    setPendingRequests((pending ?? []) as FriendWithProfile[]);

    // Fetch sent requests (where user is requester)
    const { data: sent } = await supabase
      .from('friendships')
      .select('*, profile:profiles!friendships_addressee_id_fkey(*)')
      .eq('requester_id', user.id)
      .eq('status', 'pending');

    setSentRequests((sent ?? []) as FriendWithProfile[]);
  }, [supabase]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchFriends();
      setLoading(false);
    }
    load();
  }, [fetchFriends]);

  const sendRequest = useCallback(
    async (userId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending',
        })
        .select('*, profile:profiles!friendships_addressee_id_fkey(*)')
        .single();

      if (error) throw error;
      setSentRequests((prev) => [...prev, data as FriendWithProfile]);
      return data;
    },
    [supabase]
  );

  const acceptRequest = useCallback(
    async (friendshipId: string) => {
      const { data, error } = await supabase
        .from('friendships')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', friendshipId)
        .select('*, profile:profiles!friendships_requester_id_fkey(*)')
        .single();

      if (error) throw error;

      setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      setFriends((prev) => [...prev, data as FriendWithProfile]);
      return data;
    },
    [supabase]
  );

  const declineRequest = useCallback(
    async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
    },
    [supabase]
  );

  const removeFriend = useCallback(
    async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId));
    },
    [supabase]
  );

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return data ?? [];
    },
    [supabase]
  );

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    searchUsers,
  };
}
