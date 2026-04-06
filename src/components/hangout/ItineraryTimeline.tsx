'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { ItineraryCard } from './ItineraryCard';

interface ItineraryItem {
  order: number;
  type: string;
  title: string;
  description: string;
  venue_name: string;
  venue_address?: string;
  venue_photo_url?: string;
  venue_rating?: number;
  venue_price_level?: number;
  estimated_cost_per_person?: number;
  why_this_fits?: string;
  suggested_time?: string;
  booking_url?: string;
}

interface ItineraryTimelineProps {
  items: ItineraryItem[];
  onSwap?: (order: number) => void;
  activeIndex?: number;
}

export function ItineraryTimeline({ items, onSwap, activeIndex = -1 }: ItineraryTimelineProps) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="relative flex flex-col">
      {sortedItems.map((item, index) => {
        const isActive = index === activeIndex;
        const isPast = activeIndex >= 0 && index < activeIndex;
        const isFuture = activeIndex >= 0 && index > activeIndex;
        const isLast = index === sortedItems.length - 1;

        return (
          <div key={item.order} className="relative flex gap-4">
            {/* Timeline left column */}
            <div className="flex flex-col items-center shrink-0 w-6">
              {/* Dot */}
              <div className="relative z-10">
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border-2 mt-6',
                    isPast || isActive
                      ? 'bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] border-transparent'
                      : 'bg-white border-[#E5E3E0]',
                  )}
                />
                {isActive && (
                  <motion.div
                    className="absolute inset-0 mt-6 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC]"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    'w-[2px] flex-1 min-h-[16px]',
                    isPast || isActive
                      ? 'bg-gradient-to-b from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC]'
                      : 'bg-[#E5E3E0]',
                  )}
                />
              )}
            </div>

            {/* Card */}
            <div className="flex-1 pb-6">
              <ItineraryCard
                item={item}
                isActive={isActive}
                isPast={isPast}
                onSwap={onSwap ? () => onSwap(item.order) : undefined}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
