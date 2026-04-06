'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Chip } from '@/components/ui/Chip';
import { getInterestById } from '@/lib/constants/interests';
import { VIBE_TAGS } from '@/lib/constants/vibes';

interface VibeSelectorProps {
  mode: 'interests' | 'describe';
  onModeChange: (mode: 'interests' | 'describe') => void;
  matchedInterests?: string[];
  selectedInterests: string[];
  onInterestToggle: (id: string) => void;
  selectedTags: string[];
  onTagToggle: (id: string) => void;
  vibeText: string;
  onVibeTextChange: (text: string) => void;
}

const PLACEHOLDER_EXAMPLES = [
  'A chill Sunday afternoon catching up over coffee and a walk...',
  'An epic night out with dancing and late-night tacos...',
  'A low-key movie night with snacks and board games...',
  'An adventurous day trip with hiking and a scenic picnic...',
  'A fancy dinner followed by cocktails and live jazz...',
];

export function VibeSelector({
  mode,
  onModeChange,
  matchedInterests = [],
  selectedInterests,
  onInterestToggle,
  selectedTags,
  onTagToggle,
  vibeText,
  onVibeTextChange,
}: VibeSelectorProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (mode !== 'describe') return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="flex flex-col gap-5">
      {/* Tab toggle */}
      <div className="flex rounded-xl bg-[#F2F0ED] p-1">
        {(['interests', 'describe'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onModeChange(tab)}
            className={cn(
              'relative flex-1 py-2.5 text-sm font-medium rounded-[10px] transition-colors duration-200',
              mode === tab ? 'text-[#1A1A1A]' : 'text-[#9B9B9B]',
            )}
          >
            {mode === tab && (
              <motion.div
                layoutId="vibe-tab-bg"
                className="absolute inset-0 bg-white rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {tab === 'interests' ? 'Match Interests' : 'Describe a Vibe'}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {mode === 'interests' ? (
          <motion.div
            key="interests"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {matchedInterests.length > 0 ? (
              matchedInterests.map((id) => {
                const interest = getInterestById(id);
                if (!interest) return null;
                return (
                  <Chip
                    key={id}
                    emoji={interest.emoji}
                    label={interest.label}
                    selected={selectedInterests.includes(id)}
                    onToggle={() => onInterestToggle(id)}
                  />
                );
              })
            ) : (
              <p className="text-sm text-[#9B9B9B] py-4 text-center w-full">
                No shared interests found. Try &quot;Describe a Vibe&quot; instead!
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="describe"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="relative">
              <textarea
                value={vibeText}
                onChange={(e) => onVibeTextChange(e.target.value)}
                placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
                rows={4}
                className={cn(
                  'w-full rounded-xl border border-[#E5E3E0] bg-white px-4 py-3 text-[16px] leading-relaxed text-[#1A1A1A]',
                  'placeholder:text-[#9B9B9B] placeholder:transition-opacity',
                  'focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20',
                  'shadow-[0_1px_2px_rgba(0,0,0,0.04)] resize-none',
                )}
              />
            </div>

            {/* Quick-select vibe tags */}
            <div>
              <p className="text-xs font-medium text-[#9B9B9B] mb-2 uppercase tracking-wide">
                Quick vibes
              </p>
              <div className="flex flex-wrap gap-2">
                {VIBE_TAGS.map((tag) => (
                  <Chip
                    key={tag.id}
                    emoji={tag.emoji}
                    label={tag.label}
                    selected={selectedTags.includes(tag.id)}
                    onToggle={() => onTagToggle(tag.id)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
