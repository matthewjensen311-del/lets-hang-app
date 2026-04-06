'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ChipProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
} as const;

export function Chip({
  label,
  emoji,
  selected,
  onToggle,
  size = 'md',
}: ChipProps) {
  return (
    <div
      className="relative inline-flex rounded-[999px]"
      style={
        selected
          ? {
              background:
                'linear-gradient(135deg, #FF6B35, #FF3F80, #7C5CFC)',
              padding: '2px',
            }
          : { padding: '1px' }
      }
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        animate={selected ? { scale: [0.9, 1.05, 1] } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        onClick={onToggle}
        className={cn(
          'inline-flex items-center justify-center rounded-[999px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] focus-visible:ring-offset-2 select-none',
          sizes[size],
          selected
            ? 'bg-[rgba(255,107,53,0.08)] text-[#1A1A1A]'
            : 'border border-[#E5E3E0] bg-white text-[#1A1A1A]',
        )}
      >
        {emoji && <span className="shrink-0">{emoji}</span>}
        <span>{label}</span>
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <Check
              className={cn(
                size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
                'text-[#FF6B35]',
              )}
            />
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
