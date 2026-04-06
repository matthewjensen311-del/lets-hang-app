'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Share2, Calendar, MoreHorizontal, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { HangoutStatusBadge } from '@/components/hangout/HangoutStatusBadge';
import { ItineraryTimeline } from '@/components/hangout/ItineraryTimeline';
import { formatHangoutDate } from '@/lib/utils/dates';

interface Participant {
  user_id: string;
  rsvp_status: string;
  profiles: { display_name: string; avatar_url: string | null; username: string };
}

interface HangoutDetail {
  id: string;
  title: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  vibe: string | null;
  vibe_tags: string[];
  notes: string | null;
  created_by: string;
  hangout_participants: Participant[];
  itinerary_items: Record<string, unknown>[];
}

export default function HangoutDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [hangout, setHangout] = useState<HangoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setMyUserId(user?.id || null);

      const { data } = await supabase
        .from('hangouts')
        .select(`
          *,
          hangout_participants(user_id, rsvp_status, profiles(display_name, avatar_url, username)),
          itinerary_items(*)
        `)
        .eq('id', params.id)
        .single();

      if (data) {
        setHangout(data as unknown as HangoutDetail);
      }
      setLoading(false);
    }
    load();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`hangout-${params.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hangout_participants', filter: `hangout_id=eq.${params.id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hangouts', filter: `id=eq.${params.id}` }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, params.id]);

  const handleRsvp = async (status: 'going' | 'maybe' | 'declined') => {
    if (!myUserId || !hangout) return;
    setRsvpLoading(true);
    await supabase
      .from('hangout_participants')
      .update({ rsvp_status: status, responded_at: new Date().toISOString() })
      .eq('hangout_id', hangout.id)
      .eq('user_id', myUserId);
    setRsvpLoading(false);
  };

  const handleCancel = async () => {
    if (!hangout) return;
    if (!confirm('Are you sure you want to cancel this hangout?')) return;
    await supabase.from('hangouts').update({ status: 'cancelled' }).eq('id', hangout.id);
  };

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-4">
        <Skeleton variant="text" width="60%" height="32px" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="card" height="200px" />
        <Skeleton variant="card" height="300px" />
      </div>
    );
  }

  if (!hangout) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[#6B6B6B]">Hangout not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/home')}>Go Home</Button>
      </div>
    );
  }

  const myRsvp = hangout.hangout_participants.find((p) => p.user_id === myUserId);
  const isCreator = hangout.created_by === myUserId;
  const isLive = hangout.status === 'in_progress';
  const sortedItems = [...(hangout.itinerary_items || [])].sort(
    (a, b) => ((a as { order_index: number }).order_index || 0) - ((b as { order_index: number }).order_index || 0)
  );

  const rsvpColors: Record<string, string> = {
    going: 'bg-[#00D4AA]',
    maybe: 'bg-[#FFD23F]',
    declined: 'bg-[#FF3F80]',
    pending: 'bg-[#E5E3E0]',
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {isCreator && hangout.status !== 'cancelled' && (
          <button onClick={handleCancel} className="text-[#9B9B9B] hover:text-[#FF3F80]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <HangoutStatusBadge status={hangout.status as 'proposed' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'} />
          {isLive && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B35]" />
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          {hangout.title}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-[#6B6B6B]">
          <Clock className="w-4 h-4" />
          {formatHangoutDate(hangout.scheduled_start, hangout.scheduled_end, 'America/New_York')}
        </div>
        {hangout.vibe && (
          <p className="text-sm italic text-[#7C5CFC] mt-2">{hangout.vibe}</p>
        )}
      </motion.div>

      {/* Participants */}
      <Card>
        <h3 className="font-semibold mb-3">Who&apos;s coming</h3>
        <div className="space-y-2">
          {hangout.hangout_participants.map((p) => (
            <div key={p.user_id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar src={p.profiles.avatar_url || undefined} fallback={p.profiles.display_name[0]} size="sm" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${rsvpColors[p.rsvp_status]}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.profiles.display_name}</p>
              </div>
              <Badge
                variant={p.rsvp_status === 'going' ? 'success' : p.rsvp_status === 'declined' ? 'error' : p.rsvp_status === 'maybe' ? 'warning' : 'default'}
              >
                {p.rsvp_status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* RSVP Actions */}
      {myRsvp && hangout.status !== 'cancelled' && hangout.status !== 'completed' && (
        <div className="flex gap-2">
          <Button
            variant={myRsvp.rsvp_status === 'going' ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => handleRsvp('going')}
            loading={rsvpLoading}
          >
            I&apos;m in! 🎉
          </Button>
          <Button
            variant={myRsvp.rsvp_status === 'maybe' ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => handleRsvp('maybe')}
            loading={rsvpLoading}
          >
            Maybe 🤔
          </Button>
          <Button
            variant={myRsvp.rsvp_status === 'declined' ? 'danger' : 'ghost'}
            className="flex-1"
            onClick={() => handleRsvp('declined')}
            loading={rsvpLoading}
          >
            Can&apos;t 😢
          </Button>
        </div>
      )}

      {/* Itinerary */}
      {sortedItems.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            The Plan
          </h2>
          <ItineraryTimeline
            items={sortedItems.map((item: Record<string, unknown>) => ({
              order: (item.order_index as number) || 0,
              type: (item.type as string) || 'other',
              title: (item.title as string) || '',
              description: (item.description as string) || '',
              venue_name: (item.venue_name as string) || '',
              venue_address: (item.venue_address as string) || '',
              venue_photo_url: item.venue_photo_url as string | undefined,
              venue_rating: item.venue_rating as number | undefined,
              venue_price_level: item.venue_price_level as number | undefined,
              estimated_cost_per_person: item.estimated_cost_per_person as number | undefined,
              why_this_fits: item.notes as string | undefined,
              suggested_time: item.estimated_start as string | undefined,
              booking_url: item.booking_url as string | undefined,
            }))}
          />
        </motion.section>
      )}

      {/* Notes */}
      <Card>
        <h3 className="font-semibold mb-2">Notes</h3>
        <p className="text-sm text-[#6B6B6B] mb-3">{hangout.notes || 'No notes yet'}</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-[#E5E3E0] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30"
          />
          <Button variant="secondary" size="sm" onClick={async () => {
            if (!note.trim()) return;
            const currentNotes = hangout.notes || '';
            await supabase.from('hangouts').update({ notes: currentNotes + '\n' + note }).eq('id', hangout.id);
            setNote('');
          }}>
            Add
          </Button>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" icon={<Share2 className="w-4 h-4" />} className="flex-1">
          Share
        </Button>
        <Button variant="ghost" size="sm" icon={<Calendar className="w-4 h-4" />} className="flex-1">
          Add to Calendar
        </Button>
      </div>
    </div>
  );
}
