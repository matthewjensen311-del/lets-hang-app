'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { INTEREST_CATEGORIES } from '@/lib/constants/interests';
import { Badge } from '@/components/ui/Badge';

interface InterestPickerProps {
  selectedInterests: string[];
  onToggle: (id: string) => void;
}

function getThresholdMessage(count: number): string | null {
  if (count >= 10) return 'Your friends are lucky!';
  if (count >= 8) return "You're interesting!";
  if (count >= 5) return 'Great taste!';
  return null;
}

export function InterestPicker({ selectedInterests, onToggle }: InterestPickerProps) {
  const count = selectedInterests.length;
  const message = getThresholdMessage(count);

  return (
    <div className="flex flex-col gap-6">
      {INTEREST_CATEGORIES.map((category) => (
        <div key={category.id}>
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {category.interests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);

              return (
                <motion.button
                  key={interest.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  animate={isSelected ? { scale: [0.95, 1.02, 1] } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  onClick={() => onToggle(interest.id)}
                  className="relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] focus-visible:ring-offset-2"
                >
                  {/* Gradient border wrapper */}
                  <div
                    className={cn(
                      'rounded-2xl',
                      isSelected
                        ? 'bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] p-[2px]'
                        : 'border border-[#E5E3E0] p-0',
                    )}
                  >
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center py-4 px-3 rounded-[14px] transition-colors duration-150',
                        isSelected
                          ? 'bg-[rgba(255,107,53,0.06)]'
                          : 'bg-white',
                      )}
                    >
                      <span className="text-3xl mb-1.5">{interest.emoji}</span>
                      <span className="text-sm font-medium text-[#1A1A1A] text-center leading-tight">
                        {interest.label}
                      </span>
                    </div>
                  </div>

                  {/* Check badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#7C5CFC] flex items-center justify-center shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom count badge and messages */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-3 border-t border-[#E5E3E0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={count >= 5 ? 'brand' : 'default'}>
            {count} selected
          </Badge>
          {count < 5 && (
            <span className="text-sm text-[#9B9B9B]">
              Pick at least {5 - count} more
            </span>
          )}
        </div>
        <AnimatePresence mode="wait">
          {message && (
            <motion.span
              key={message}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm font-medium bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] bg-clip-text text-transparent"
            >
              {message}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
