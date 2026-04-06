'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Clock, Sparkles, Check, RefreshCw, Send } from 'lucide-react';
import { useHangoutStore } from '@/stores/hangoutStore';
import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AvailabilityGrid } from '@/components/calendar/AvailabilityGrid';
import { VibeSelector } from '@/components/hangout/VibeSelector';
import { ItineraryTimeline } from '@/components/hangout/ItineraryTimeline';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { getInterestById } from '@/lib/constants/interests';

const DURATION_OPTIONS = [
  { value: 60, label: '1 hr' },
  { value: 120, label: '2 hrs' },
  { value: 180, label: '3 hrs' },
  { value: 300, label: 'Half day' },
  { value: 480, label: 'Full day' },
];

export default function NewHangoutPageWrapper() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NewHangoutPage />
    </Suspense>
  );
}

function NewHangoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useHangoutStore();
  const { friends } = useFriends();
  const [title, setTitle] = useState('');
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [sharedAvailability, setSharedAvailability] = useState<{ date: string; startTime: string; endTime: string; availableCount: number }[]>([]);

  // Pre-select friend from URL params
  useEffect(() => {
    const friendId = searchParams.get('friend');
    if (friendId && !store.selectedFriends.includes(friendId)) {
      store.addFriend(friendId);
    }
  }, [searchParams, store]);

  const handleGenerateItinerary = async () => {
    setGeneratingItinerary(true);
    try {
      const res = await fetch('/api/hangout/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: store.selectedFriends,
          timeSlot: store.selectedTimeSlot,
          duration: store.duration,
          vibeMode: store.vibeMode,
          vibeText: store.vibeText,
          vibeTags: store.selectedVibeTags,
          interests: store.selectedInterests,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        store.setItinerary(data.itinerary);
      }
    } catch {
      // Error handled in UI
    }
    setGeneratingItinerary(false);
  };

  const handleConfirm = async () => {
    if (!store.selectedTimeSlot || !store.itinerary) return;

    const res = await fetch('/api/hangout/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title || store.itinerary.title,
        participantIds: store.selectedFriends,
        groupId: store.selectedGroupId,
        scheduledStart: store.selectedTimeSlot.startTime,
        scheduledEnd: store.selectedTimeSlot.endTime,
        vibe: store.vibeText,
        vibeTags: store.selectedVibeTags,
      }),
    });

    if (res.ok) {
      const { hangout } = await res.json();
      store.reset();
      router.push(`/hangout/${hangout.id}`);
    }
  };

  const selectedFriendProfiles = friends
    .filter((f) => store.selectedFriends.includes(f.profile.id))
    .map((f) => f.profile);

  // Fetch availability when friends selected
  useEffect(() => {
    if (store.selectedFriends.length === 0) return;
    async function fetchAvail() {
      try {
        const res = await fetch('/api/calendar/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: store.selectedFriends,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          }),
        });
        if (res.ok) {
          const { slots } = await res.json();
          setSharedAvailability(
            slots.map((s: Record<string, string>) => ({ ...s, availableCount: store.selectedFriends.length }))
          );
        }
      } catch {
        // Silently fail
      }
    }
    fetchAvail();
  }, [store.selectedFriends]);

  const steps = ['Who', 'When', 'Vibe', 'Itinerary', 'Confirm'];

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => {
          if (store.step > 1) { store.setStep(store.step - 1); }
          else { store.reset(); router.back(); }
        }} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <ProgressBar value={(store.step / 5) * 100} steps={5} currentStep={store.step} />
        </div>
        <span className="text-xs text-[#9B9B9B] font-medium">{steps[store.step - 1]}</span>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Friends */}
        {store.step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Satoshi, sans-serif' }}>Who&apos;s hanging?</h2>

            {selectedFriendProfiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFriendProfiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 bg-[#7C5CFC]/10 rounded-full pl-1 pr-3 py-1">
                    <Avatar src={f.avatar_url || undefined} fallback={(f.display_name || '?')[0]} size="sm" />
                    <span className="text-sm font-medium">{f.display_name || ''}</span>
                    <button onClick={() => store.removeFriend(f.id)} className="text-[#9B9B9B] hover:text-[#FF3F80] text-lg leading-none">&times;</button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {friends.map((f) => {
                const isSelected = store.selectedFriends.includes(f.profile.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => isSelected ? store.removeFriend(f.profile.id) : store.addFriend(f.profile.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      isSelected ? 'border-[#7C5CFC] bg-[#7C5CFC]/5' : 'border-[#E5E3E0] bg-white hover:border-[#E5E3E0]/80'
                    }`}
                  >
                    <Avatar src={f.profile.avatar_url || undefined} fallback={(f.profile.display_name || '?')[0]} size="md" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-[#1A1A1A]">{f.profile.display_name || ''}</p>
                      <p className="text-sm text-[#6B6B6B]">@{f.profile.username}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-[#7C5CFC]" />}
                  </button>
                );
              })}
            </div>

            <Button variant="primary" className="w-full" disabled={store.selectedFriends.length === 0} onClick={() => store.setStep(2)}>
              Next — Pick a Time
            </Button>
          </motion.div>
        )}

        {/* Step 2: Pick Time */}
        {store.step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Satoshi, sans-serif' }}>When works?</h2>
            <p className="text-sm text-[#6B6B6B]">
              Showing times when everyone is free over the next 2 weeks
            </p>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {DURATION_OPTIONS.map((d) => (
                <Chip key={d.value} label={d.label} selected={store.duration === d.value} onToggle={() => store.setDuration(d.value)} size="sm" />
              ))}
            </div>

            {sharedAvailability.length > 0 ? (
              <AvailabilityGrid
                slots={sharedAvailability}
                totalUsers={store.selectedFriends.length + 1}
                onSlotClick={(slot) => {
                  store.setSelectedTimeSlot({ date: slot.date, startTime: slot.startTime, endTime: slot.endTime });
                }}
              />
            ) : (
              <Card className="text-center py-8">
                <p className="text-[#6B6B6B]">No shared availability found</p>
                <p className="text-sm text-[#9B9B9B] mt-1">Ask your friends to set their availability</p>
              </Card>
            )}

            {store.selectedTimeSlot && (
              <div className="p-3 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  Selected: {store.selectedTimeSlot.date} · {store.selectedTimeSlot.startTime} – {store.selectedTimeSlot.endTime}
                </p>
              </div>
            )}

            <Button variant="primary" className="w-full" disabled={!store.selectedTimeSlot} onClick={() => store.setStep(3)}>
              Next — Set the Vibe
            </Button>
          </motion.div>
        )}

        {/* Step 3: Set Vibe */}
        {store.step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Satoshi, sans-serif' }}>What&apos;s the vibe?</h2>

            <VibeSelector
              mode={store.vibeMode}
              onModeChange={(m) => store.setVibeMode(m)}
              matchedInterests={[]}
              selectedInterests={store.selectedInterests}
              onInterestToggle={(id) => {
                const current = store.selectedInterests;
                if (current.includes(id)) {
                  store.setSelectedInterests(current.filter((i) => i !== id));
                } else {
                  store.setSelectedInterests([...current, id]);
                }
              }}
              selectedTags={store.selectedVibeTags}
              onTagToggle={(id) => {
                const current = store.selectedVibeTags;
                if (current.includes(id)) {
                  store.setSelectedVibeTags(current.filter((t) => t !== id));
                } else {
                  store.setSelectedVibeTags([...current, id]);
                }
              }}
              vibeText={store.vibeText}
              onVibeTextChange={(t) => store.setVibeText(t)}
            />

            <Button variant="primary" className="w-full" onClick={() => { store.setStep(4); handleGenerateItinerary(); }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Itinerary
            </Button>
          </motion.div>
        )}

        {/* Step 4: AI Itinerary */}
        {store.step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {generatingItinerary ? (
              <div className="py-16">
                <LoadingScreen messages={['Crafting your perfect hangout...', 'Finding the best spots...', 'Matching your vibes...', 'Almost there...']} />
              </div>
            ) : store.itinerary ? (
              <>
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    {store.itinerary.title}
                  </h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">{store.itinerary.description}</p>
                  {store.itinerary.vibe_summary && (
                    <p className="text-sm italic text-[#7C5CFC] mt-2">{store.itinerary.vibe_summary}</p>
                  )}
                </div>

                <ItineraryTimeline
                  items={store.itinerary.items.map((item) => ({
                    order: item.order_index,
                    type: item.type,
                    title: item.title,
                    description: item.description,
                    venue_name: item.venue_name || '',
                    venue_address: item.venue_address || '',
                    suggested_time: item.estimated_start || '',
                    estimated_cost_per_person: item.estimated_cost_per_person || 0,
                    booking_url: item.booking_url,
                    why_this_fits: item.notes,
                  }))}
                  onSwap={async (order) => {
                    // Swap logic would go here
                    console.log('Swap item', order);
                  }}
                />

                <Card className="bg-[#F2F0ED]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#6B6B6B]">Estimated total per person</span>
                    <span className="text-lg font-bold text-[#1A1A1A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ${store.itinerary.total_estimated_cost_per_person?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </Card>

                <Button variant="secondary" className="w-full" icon={<RefreshCw className="w-4 h-4" />} onClick={handleGenerateItinerary}>
                  Regenerate Itinerary
                </Button>
                <Button variant="primary" className="w-full" onClick={() => store.setStep(5)}>
                  Looks Good — Continue
                </Button>
              </>
            ) : (
              <Card className="text-center py-8">
                <p className="text-[#6B6B6B]">Failed to generate itinerary</p>
                <Button variant="secondary" className="mt-4" onClick={handleGenerateItinerary}>
                  Try Again
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        {/* Step 5: Confirm & Send */}
        {store.step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Satoshi, sans-serif' }}>Ready to send?</h2>

            <Input
              label="Hangout Title"
              placeholder={store.itinerary?.title || 'Name your hangout'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Card>
              <h3 className="font-semibold mb-2">Inviting</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFriendProfiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 bg-[#F2F0ED] rounded-full pl-1 pr-3 py-1">
                    <Avatar src={f.avatar_url || undefined} fallback={(f.display_name || '?')[0]} size="sm" />
                    <span className="text-sm">{f.display_name || ''}</span>
                  </div>
                ))}
              </div>
            </Card>

            {store.selectedTimeSlot && (
              <Card>
                <h3 className="font-semibold mb-1">When</h3>
                <p className="text-sm text-[#6B6B6B]">
                  {store.selectedTimeSlot.date} · {store.selectedTimeSlot.startTime} – {store.selectedTimeSlot.endTime}
                </p>
              </Card>
            )}

            <Button variant="primary" className="w-full" icon={<Send className="w-4 h-4" />} onClick={handleConfirm}>
              Send Invites
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
