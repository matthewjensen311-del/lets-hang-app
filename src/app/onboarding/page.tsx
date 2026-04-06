'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { InterestPicker } from '@/components/onboarding/InterestPicker';
import { BudgetSlider } from '@/components/onboarding/BudgetSlider';
import { DietaryPicker } from '@/components/onboarding/DietaryPicker';
import { CalendarConnect } from '@/components/onboarding/CalendarConnect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { FriendSearch } from '@/components/friends/FriendSearch';

const ENERGY_OPTIONS = [
  { id: 'chill' as const, label: 'Chill', emoji: '🛋️' },
  { id: 'moderate' as const, label: 'Moderate', emoji: '⚡' },
  { id: 'active' as const, label: 'Active', emoji: '🏃' },
  { id: 'adventure' as const, label: 'Adventure', emoji: '🔥' },
];

const INDOOR_OUTDOOR_OPTIONS = [
  { id: 'indoor' as const, label: 'Indoor', emoji: '🏠' },
  { id: 'both' as const, label: 'Both', emoji: '↔️' },
  { id: 'outdoor' as const, label: 'Outdoor', emoji: '🌳' },
];

const DRINK_OPTIONS = [
  { id: 'none' as const, label: "I don't drink", emoji: '🚫' },
  { id: 'social' as const, label: 'Social drinker', emoji: '🍷' },
  { id: 'enthusiast' as const, label: 'Enthusiast', emoji: '🍻' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const store = useOnboardingStore();
  const [direction, setDirection] = useState(1);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [saving, setSaving] = useState(false);

  const checkUsername = useCallback(
    async (username: string) => {
      if (username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      setCheckingUsername(true);
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();
      setUsernameAvailable(!data);
      setCheckingUsername(false);
    },
    [supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (store.profileData.username) {
        checkUsername(store.profileData.username);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [store.profileData.username, checkUsername]);

  const canProceed = () => {
    switch (store.currentStep) {
      case 1:
        return (
          store.profileData.displayName.length >= 1 &&
          store.profileData.username.length >= 3 &&
          usernameAvailable === true
        );
      case 2:
        return true; // Calendar is optional
      case 3:
        return store.selectedInterests.length >= 5;
      case 4:
        return true; // All have defaults
      case 5:
        return true; // Friends are optional
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (store.currentStep === 5) {
      await handleComplete();
      return;
    }
    setDirection(1);
    store.setStep(store.currentStep + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    store.setStep(store.currentStep - 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        display_name: store.profileData.displayName,
        username: store.profileData.username.toLowerCase(),
        city: store.profileData.city,
        state: store.profileData.state,
        avatar_url: store.profileData.avatarUrl,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        interests: store.selectedInterests,
        budget_tier: store.preferences.budgetTier,
        dietary_restrictions: store.preferences.dietaryRestrictions,
        drink_preference: store.preferences.drinkPreference,
        activity_energy: store.preferences.activityEnergy,
        indoor_outdoor: store.preferences.indoorOutdoor,
      });

    store.reset();
    router.push('/home');
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="flex flex-col h-full">
      <StepIndicator currentStep={store.currentStep} totalSteps={5} />

      <div className="flex-1 mt-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={store.currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {store.currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    Let&apos;s get you set up
                  </h1>
                  <p className="text-[#6B6B6B] mt-1">So your friends can find you</p>
                </div>
                <div className="flex justify-center">
                  <button className="relative w-24 h-24 rounded-full bg-[#F2F0ED] flex items-center justify-center border-2 border-dashed border-[#E5E3E0] hover:border-[#7C5CFC] transition-colors">
                    {store.profileData.avatarUrl ? (
                      <img src={store.profileData.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-[#9B9B9B]" />
                    )}
                  </button>
                </div>
                <Input
                  label="Display Name"
                  placeholder="Your name"
                  value={store.profileData.displayName}
                  onChange={(e) => store.updateProfileData({ displayName: e.target.value })}
                  iconLeft={<User className="w-4 h-4" />}
                />
                <div>
                  <Input
                    label="Username"
                    placeholder="coolhuman42"
                    value={store.profileData.username}
                    onChange={(e) =>
                      store.updateProfileData({
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                      })
                    }
                    helperText={
                      checkingUsername
                        ? 'Checking...'
                        : usernameAvailable === true
                          ? '✓ Available!'
                          : usernameAvailable === false
                            ? '✗ Already taken'
                            : 'Lowercase letters, numbers, and underscores'
                    }
                    error={usernameAvailable === false ? 'Username already taken' : undefined}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="New York"
                    value={store.profileData.city}
                    onChange={(e) => store.updateProfileData({ city: e.target.value })}
                    iconLeft={<MapPin className="w-4 h-4" />}
                  />
                  <Input
                    label="State"
                    placeholder="NY"
                    value={store.profileData.state}
                    onChange={(e) => store.updateProfileData({ state: e.target.value })}
                  />
                </div>
              </div>
            )}

            {store.currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    Connect your calendar
                  </h1>
                  <p className="text-[#6B6B6B] mt-1">
                    We only check when you&apos;re busy — we never see event details or share your schedule.
                  </p>
                </div>
                <CalendarConnect
                  onConnect={async (provider) => {
                    if (provider === 'google') {
                      await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
                          scopes: 'https://www.googleapis.com/auth/calendar.readonly',
                        },
                      });
                    }
                    store.setCalendarConnected(true);
                  }}
                  connected={store.calendarConnected}
                />
              </div>
            )}

            {store.currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    What are you into?
                  </h1>
                  <p className="text-[#6B6B6B] mt-1">Pick at least 5 activities you enjoy</p>
                </div>
                <InterestPicker
                  selectedInterests={store.selectedInterests}
                  onToggle={(id) => {
                    if (store.selectedInterests.includes(id)) {
                      store.removeInterest(id);
                    } else {
                      store.addInterest(id);
                    }
                  }}
                />
              </div>
            )}

            {store.currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    Your preferences
                  </h1>
                  <p className="text-[#6B6B6B] mt-1">Help us match you with the perfect hangouts</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1A1A1A] mb-3">Budget per outing</h3>
                  <BudgetSlider
                    value={store.preferences.budgetTier}
                    onChange={(tier) => store.updatePreferences({ budgetTier: tier as 'free' | 'budget' | 'moderate' | 'splurge' | 'no_limit' })}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1A1A1A] mb-3">Dietary restrictions</h3>
                  <DietaryPicker
                    selected={store.preferences.dietaryRestrictions}
                    onToggle={(id) => {
                      const current = store.preferences.dietaryRestrictions;
                      store.updatePreferences({
                        dietaryRestrictions: current.includes(id)
                          ? current.filter((d) => d !== id)
                          : [...current, id],
                      });
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1A1A1A] mb-3">Drink preference</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {DRINK_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => store.updatePreferences({ drinkPreference: opt.id })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                          store.preferences.drinkPreference === opt.id
                            ? 'border-[#7C5CFC] bg-[#7C5CFC]/5'
                            : 'border-[#E5E3E0] bg-white hover:border-[#E5E3E0]/80'
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs font-medium text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1A1A1A] mb-3">Energy level</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {ENERGY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => store.updatePreferences({ activityEnergy: opt.id })}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                          store.preferences.activityEnergy === opt.id
                            ? 'border-[#7C5CFC] bg-[#7C5CFC]/5'
                            : 'border-[#E5E3E0] bg-white'
                        }`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1A1A1A] mb-3">Indoor / Outdoor</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {INDOOR_OUTDOOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => store.updatePreferences({ indoorOutdoor: opt.id })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                          store.preferences.indoorOutdoor === opt.id
                            ? 'border-[#7C5CFC] bg-[#7C5CFC]/5'
                            : 'border-[#E5E3E0] bg-white'
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {store.currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    Add your friends
                  </h1>
                  <p className="text-[#6B6B6B] mt-1">You can always add friends later</p>
                </div>
                <FriendSearch onSelect={(userId) => console.log('Add friend:', userId)} />
                <div className="flex flex-col items-center gap-3 pt-4">
                  <Button variant="secondary" size="md" className="w-full">
                    Share invite link
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 pt-6 pb-4">
        {store.currentStep > 1 && (
          <Button variant="ghost" onClick={handleBack} className="flex-1">
            Back
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed()}
          loading={saving}
          className="flex-1"
        >
          {store.currentStep === 5 ? "Let's Hang!" : 'Next'}
        </Button>
      </div>
    </div>
  );
}
