'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface ProgressBarProps {
  /** Continuous progress value from 0 to 100 */
  value: number;
  /** Number of discrete steps (enables step mode) */
  steps?: number;
  /** Current step in discrete mode (0-indexed) */
  currentStep?: number;
  /** Show percentage or step label */
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  steps,
  currentStep,
  showLabel = false,
  className,
}: ProgressBarProps) {
  const isDiscrete = steps != null && steps > 0;
  const clampedValue = Math.max(0, Math.min(100, value));

  // In discrete mode, derive the fill percentage from currentStep
  const fillPercent = isDiscrete
    ? currentStep != null
      ? (currentStep / (steps! - 1)) * 100
      : clampedValue
    : clampedValue;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 text-sm font-medium text-[#6B6B6B]">
          {isDiscrete && currentStep != null
            ? `Step ${currentStep + 1} of ${steps}`
            : `${Math.round(clampedValue)}%`}
        </div>
      )}

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#E5E3E0]">
        {/* Animated fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #FF6B35, #7C5CFC)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />

        {/* Step dots */}
        {isDiscrete &&
          Array.from({ length: steps! }).map((_, i) => {
            const leftPercent = steps! > 1 ? (i / (steps! - 1)) * 100 : 0;
            const isFilled = currentStep != null ? i <= currentStep : false;

            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${leftPercent}%` }}
              >
                <div
                  className={cn(
                    'h-3 w-3 rounded-full border-2 transition-colors duration-200',
                    isFilled
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]'
                      : 'border-[#E5E3E0] bg-white',
                  )}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
