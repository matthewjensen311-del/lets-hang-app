'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Clock, Users, CalendarDays, Zap, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { HangoutStatusBadge } from '@/components/hangout/HangoutStatusBadge';
import { formatHangoutDate } from '@/lib/utils/dates';

interface HangoutPreview {
  id: string;
  title: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  vibe: string | null;
  participants: { user_id: string; rsvp_status: string; profiles: { display_name: string; avatar_url: string | null } }[];
}

export default function HomePage() {
  const supabase = createClient();
  const [hangouts, setHangouts] = useState<HangoutPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: hangoutData }] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', user.id).single(),
        supabase
          .from('hangout_participants')
          .select('hangout_id, hangouts(id, title, status, scheduled_start, scheduled_end, vibe, hangout_participants(user_id, rsvp_status, profiles(display_name, avatar_url)))')
          .eq('user_id', user.id)
          .in('hangouts.status', ['proposed', 'confirmed', 'in_progress'])
          .order('hangouts(scheduled_start)', { ascending: true })
          .limit(10),
      ]);

      setProfile(profileData);
      if (hangoutData) {
        const mapped = hangoutData
          .map((hp: Record<string, unknown>) => hp.hangouts as unknown as HangoutPreview)
          .filter(Boolean);
        setHangouts(mapped);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const now = new Date();
  const activeHangouts = hangouts.filter(
    (h) => h.status === 'in_progress' || (h.status === 'confirmed' && new Date(h.scheduled_start) <= now && new Date(h.scheduled_end) >= now)
  );
  const upcomingHangouts = hangouts.filter((h) => !activeHangouts.includes(h));

  return (
    <div className="px-4 py-6 space-y-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          {loading ? <Skeleton variant="text" width="200px" /> : `Hey, ${profile?.display_name?.split(' ')[0] || 'there'}! 👋`}
        </h1>
        <p className="text-[#6B6B6B] mt-1">Ready to hang?</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Link href="/hangout/new">
          <button className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] text-white font-semibold text-lg shadow-lg shadow-[#FF6B35]/20 active:scale-[0.97] transition-transform">
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Plan a Hangout
            </div>
          </button>
        </Link>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Link href="/availability">
            <Card hoverable className="flex items-center gap-3 !p-4">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-[#7C5CFC]" />
              </div>
              <span className="text-sm font-medium">Set Availability</span>
            </Card>
          </Link>
          <Link href="/friends">
            <Card hoverable className="flex items-center gap-3 !p-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <span className="text-sm font-medium">Add Friends</span>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Active Hangouts */}
      {activeHangouts.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Happening Now
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {activeHangouts.map((h) => (
              <Link key={h.id} href={`/hangout/${h.id}`} className="min-w-[280px]">
                <Card hoverable className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/5 via-[#FF3F80]/5 to-[#7C5CFC]/5" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B35]" />
                      </span>
                      <span className="text-xs font-semibold text-[#FF6B35] uppercase tracking-wider">Live</span>
                    </div>
                    <h3 className="font-semibold text-[#1A1A1A]">{h.title}</h3>
                    <p className="text-sm text-[#6B6B6B] mt-1">
                      {formatHangoutDate(h.scheduled_start, h.scheduled_end, 'America/New_York')}
                    </p>
                    {h.participants && (
                      <div className="mt-3">
                        <AvatarGroup max={4} size="sm">
                          {h.participants.map((p, i) => (
                            <Avatar key={i} src={p.profiles.avatar_url || undefined} fallback={p.profiles.display_name?.[0] || '?'} size="sm" />
                          ))}
                        </AvatarGroup>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Upcoming Hangouts */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Upcoming
          </h2>
          {upcomingHangouts.length > 3 && (
            <Link href="/hangouts" className="text-sm text-[#7C5CFC] font-medium flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" height="100px" />
            ))}
          </div>
        ) : upcomingHangouts.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming hangouts"
            description="Your first hangout is just a tap away"
            actionLabel="Plan a Hangout"
            actionHref="/hangout/new"
          />
        ) : (
          <div className="space-y-3">
            {upcomingHangouts.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link href={`/hangout/${h.id}`}>
                  <Card hoverable>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <HangoutStatusBadge status={h.status as 'proposed' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'} />
                        </div>
                        <h3 className="font-semibold text-[#1A1A1A]">{h.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-[#6B6B6B]">
                          <Clock className="w-3.5 h-3.5" />
                          {formatHangoutDate(h.scheduled_start, h.scheduled_end, 'America/New_York')}
                        </div>
                      </div>
                      {h.participants && (
                        <AvatarGroup max={3} size="sm">
                          {h.participants.map((p, i) => (
                            <Avatar key={i} src={p.profiles.avatar_url || undefined} fallback={p.profiles.display_name?.[0] || '?'} size="sm" />
                          ))}
                        </AvatarGroup>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Quick Hangout */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="bg-gradient-to-r from-[#7C5CFC]/5 to-[#00D4AA]/5 border-[#7C5CFC]/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#7C5CFC]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A]">I&apos;m free right now!</h3>
              <p className="text-sm text-[#6B6B6B]">Find friends who are available</p>
            </div>
            <Button variant="secondary" size="sm">
              Go
            </Button>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
