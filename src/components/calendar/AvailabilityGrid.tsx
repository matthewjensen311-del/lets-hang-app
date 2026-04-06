'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  availableCount: number;
}

interface AvailabilityGridProps {
  slots: AvailabilitySlot[];
  totalUsers: number;
  onSlotClick?: (slot: AvailabilitySlot) => void;
}

const START_HOUR = 7;
const END_HOUR = 23;

function timeToRow(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - START_HOUR) * 2 + (m >= 30 ? 1 : 0);
}

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}${ampm}`;
}

function getIntensityColor(ratio: number): string {
  if (ratio <= 0) return 'bg-white';
  if (ratio <= 0.25) return 'bg-[#00D4AA]/15';
  if (ratio <= 0.5) return 'bg-[#00D4AA]/30';
  if (ratio <= 0.75) return 'bg-[#00D4AA]/50';
  return 'bg-[#00D4AA]/70';
}

export function AvailabilityGrid({ slots, totalUsers, onSlotClick }: AvailabilityGridProps) {
  const [activeTooltip, setActiveTooltip] = useState<{ key: string; slot: AvailabilitySlot } | null>(null);

  const uniqueDates = useMemo(() => {
    const dates = [...new Set(slots.map((s) => s.date))].sort();
    return dates;
  }, [slots]);

  const slotMap = useMemo(() => {
    const map = new Map<string, AvailabilitySlot>();
    for (const slot of slots) {
      const startRow = timeToRow(slot.startTime);
      const endRow = timeToRow(slot.endTime);
      for (let r = startRow; r < endRow; r++) {
        map.set(`${slot.date}-${r}`, slot);
      }
    }
    return map;
  }, [slots]);

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  function formatDateHeader(dateStr: string): { day: string; date: number } {
    const d = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return { day: dayNames[d.getDay()], date: d.getDate() };
  }

  return (
    <div className="overflow-x-auto relative">
      <div className="min-w-[500px]">
        {/* Header */}
        <div
          className="grid border-b border-[#E5E3E0]"
          style={{ gridTemplateColumns: `60px repeat(${uniqueDates.length}, 1fr)` }}
        >
          <div className="p-2" />
          {uniqueDates.map((date) => {
            const { day, date: dayNum } = formatDateHeader(date);
            return (
              <div key={date} className="flex flex-col items-center py-2">
                <span className="text-xs font-medium text-[#9B9B9B]">{day}</span>
                <span className="text-sm font-semibold text-[#1A1A1A]">{dayNum}</span>
              </div>
            );
          })}
        </div>

        {/* Grid body */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid"
            style={{ gridTemplateColumns: `60px repeat(${uniqueDates.length}, 1fr)` }}
          >
            <div className="flex items-start justify-end pr-2 text-xs text-[#9B9B9B] h-[40px]">
              <span className="-mt-2">{formatHour(hour)}</span>
            </div>
            {uniqueDates.map((date) => {
              const row1 = (hour - START_HOUR) * 2;
              const row2 = row1 + 1;

              return (
                <div key={`${date}-${hour}`} className="flex flex-col border-l border-t border-[#E5E3E0]">
                  {[row1, row2].map((row) => {
                    const key = `${date}-${row}`;
                    const slot = slotMap.get(key);
                    const ratio = slot ? slot.availableCount / totalUsers : 0;
                    const isActive = activeTooltip?.key === key;

                    return (
                      <div key={key} className="relative">
                        <button
                          type="button"
                          className={cn(
                            'h-[20px] w-full transition-colors duration-100',
                            getIntensityColor(ratio),
                            isActive && 'ring-2 ring-[#00D4AA] ring-inset',
                          )}
                          onClick={() => {
                            if (slot) {
                              setActiveTooltip(isActive ? null : { key, slot });
                              onSlotClick?.(slot);
                            }
                          }}
                        />
                        <AnimatePresence>
                          {isActive && slot && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-1 px-3 py-1.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-medium whitespace-nowrap shadow-lg"
                            >
                              {slot.availableCount} of {totalUsers} available
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
