'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Slider } from '@/components/ui/Slider';

interface BudgetSliderProps {
  value: string;
  onChange: (tier: string) => void;
}

const TIERS = ['free', 'budget', 'moderate', 'splurge', 'no_limit'] as const;

const TIER_LABELS: Record<string, string> = {
  free: 'Free ($0)',
  budget: 'Budget ($1-15)',
  moderate: 'Moderate ($15-40)',
  splurge: 'Splurge ($40-80)',
  no_limit: 'No Limit ($80+)',
};

const TIER_EMOJIS: Record<string, string> = {
  free: '\u{1F193}',
  budget: '\u{1F4B5}',
  moderate: '\u{1F4B0}',
  splurge: '\u{1F48E}',
  no_limit: '\u{1F451}',
};

export function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  const currentIndex = TIERS.indexOf(value as (typeof TIERS)[number]);
  const safeIndex = currentIndex === -1 ? 2 : currentIndex;

  return (
    <div className="flex flex-col gap-6">
      {/* Current tier display */}
      <div className="flex flex-col items-center gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="text-4xl"
          >
            {TIER_EMOJIS[value] || TIER_EMOJIS.moderate}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-semibold bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] bg-clip-text text-transparent"
          >
            {TIER_LABELS[value] || TIER_LABELS.moderate}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[safeIndex]}
          min={0}
          max={4}
          step={1}
          onValueChange={([v]: number[]) => {
            onChange(TIERS[v]);
          }}
        />
      </div>

      {/* Snap point labels */}
      <div className="flex justify-between px-1">
        {TIERS.map((tier, i) => (
          <button
            key={tier}
            type="button"
            onClick={() => onChange(tier)}
            className={cn(
              'flex flex-col items-center gap-0.5 transition-colors duration-150',
              i === safeIndex
                ? 'text-[#1A1A1A]'
                : 'text-[#9B9B9B] hover:text-[#6B6B6B]',
            )}
          >
            <span className="text-lg">{TIER_EMOJIS[tier]}</span>
            <span className="text-xs font-medium text-center leading-tight max-w-[60px]">
              {TIER_LABELS[tier].split(' (')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
