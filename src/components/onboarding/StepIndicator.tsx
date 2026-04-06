'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepIndicator({ currentStep, totalSteps = 5 }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center w-full gap-0">
      {steps.map((step, index) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isFuture = step > currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Dot */}
            <motion.div
              className={cn(
                'relative rounded-full shrink-0',
                isCurrent ? 'h-4 w-4' : 'h-3 w-3',
              )}
              initial={false}
              animate={{
                scale: isCurrent ? 1 : 0.85,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {(isCompleted || isCurrent) && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC]" />
              )}
              {isFuture && (
                <div className="absolute inset-0 rounded-full border-2 border-[#E5E3E0] bg-white" />
              )}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC]"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="relative h-[2px] w-8 sm:w-12 mx-1">
                <div className="absolute inset-0 bg-[#E5E3E0] rounded-full" />
                {step < currentStep && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
