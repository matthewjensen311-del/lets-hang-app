'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Users, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { AvailabilityGrid } from '@/components/calendar/AvailabilityGrid';
import { getInterestById } from '@/lib/constants/interests';
import type { Profile, UserPreferences } from '@/types/user';

export default function FriendProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [friend, setFriend] = useState<Profile | null>(null);
  const [friendPrefs, setFriendPrefs] = useState<UserPreferences | null>(null);
  const [myPrefs, setMyPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharedAvailability, setSharedAvailability] = useState<{ date: string; startTime: string; endTime: string; availableCount: number }[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !params.id) return;

      const [{ data: friendData }, { data: friendPrefsData }, { data: myPrefsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', params.id).single(),
        supabase.from('user_preferences').select('*').eq('user_id', params.id).single(),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
      ]);

      setFriend(friendData as unknown as Profile);
      setFriendPrefs(friendPrefsData as unknown as UserPreferences);
      setMyPrefs(myPrefsData as unknown as UserPreferences);

      // Fetch shared availability
      try {
        const res = await fetch('/api/calendar/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: [user.id, params.id],
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          }),
        });
        if (res.ok) {
          const { slots } = await res.json();
          setSharedAvailability(slots.map((s: Record<string, unknown>) => ({ ...s, availableCount: 2 })));
        }
      } catch {
        // Availability fetch failed silently
      }

      setLoading(false);
    }
    load();
  }, [supabase, params.id]);

  const sharedInterests = myPrefs && friendPrefs
    ? (myPrefs.interests as string[]).filter((i) => (friendPrefs.interests as string[]).includes(i))
    : [];

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-6">
        <Skeleton variant="circle" width="80px" height="80px" />
        <Skeleton variant="text" width="200px" />
        <Skeleton variant="text" width="150px" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!friend) {
    return (
      <EmptyState icon={Users} title="User not found" description="This profile doesn't exist" />
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Avatar src={friend.avatar_url || undefined} fallback={(friend.display_name || '?')[0]} size="xl" className="mx-auto" />
        <h1 className="text-xl font-bold mt-4 text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          {friend.display_name || ''}
        </h1>
        <p className="text-[#6B6B6B]">@{friend.username}</p>
        {friend.bio && <p className="text-sm text-[#6B6B6B] mt-2">{friend.bio}</p>}
        {friend.city && (
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-[#9B9B9B]">
            <MapPin className="w-3.5 h-3.5" />
            {friend.city}{friend.state ? `, ${friend.state}` : ''}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          className="flex-1"
          icon={<Calendar className="w-4 h-4" />}
          onClick={() => router.push(`/hangout/new?friend=${params.id}`)}
        >
          Plan a Hangout
        </Button>
        <Button variant="secondary" className="flex-1" icon={<MessageCircle className="w-4 h-4" />} disabled>
          Message
        </Button>
      </div>

      {/* Shared Interests */}
      {sharedInterests.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Shared Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {sharedInterests.map((interestId) => {
              const interest = getInterestById(interestId);
              if (!interest) return null;
              return (
                <Chip key={interestId} label={interest.label} emoji={interest.emoji} selected size="sm" onToggle={() => {}} />
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Shared Availability */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          When You&apos;re Both Free
        </h2>
        {sharedAvailability.length > 0 ? (
          <AvailabilityGrid
            slots={sharedAvailability}
            totalUsers={2}
            onSlotClick={(slot) => router.push(`/hangout/new?friend=${params.id}&date=${slot.date}&start=${slot.startTime}`)}
          />
        ) : (
          <Card>
            <p className="text-sm text-[#6B6B6B] text-center py-4">
              No shared availability found this week. Try setting your availability first.
            </p>
          </Card>
        )}
      </motion.section>
    </div>
  );
}
