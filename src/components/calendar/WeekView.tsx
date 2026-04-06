'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

interface AvailabilitySlot {
  day: number;
  startTime: string;
  endTime: string;
}

interface BusySlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface WeekViewProps {
  availabilitySlots?: AvailabilitySlot[];
  busySlots?: BusySlot[];
  onSlotClick?: (day: number, time: string) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const START_HOUR = 7;
const END_HOUR = 23;

function timeToRow(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - START_HOUR) * 2 + (m >= 30 ? 1 : 0);
}

function getWeekDates(): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}${ampm}`;
}

export function WeekView({ availabilitySlots = [], busySlots = [], onSlotClick }: WeekViewProps) {
  const weekDates = useMemo(() => getWeekDates(), []);
  const today = new Date();
  const todayDay = (today.getDay() + 6) % 7; // 0=Mon

  const hours = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i),
    [],
  );

  const availabilityMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const slot of availabilitySlots) {
      const startRow = timeToRow(slot.startTime);
      const endRow = timeToRow(slot.endTime);
      for (let r = startRow; r < endRow; r++) {
        map.set(`${slot.day}-${r}`, true);
      }
    }
    return map;
  }, [availabilitySlots]);

  const busyMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const slot of busySlots) {
      const date = new Date(slot.date);
      const dayIndex = (date.getDay() + 6) % 7;
      const startRow = timeToRow(slot.startTime);
      const endRow = timeToRow(slot.endTime);
      for (let r = startRow; r < endRow; r++) {
        map.set(`${dayIndex}-${r}`, true);
      }
    }
    return map;
  }, [busySlots]);

  function formatSlotTime(row: number): string {
    const totalMinutes = (START_HOUR * 60) + (row * 30);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#E5E3E0]">
          <div className="p-2" />
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={cn(
                'flex flex-col items-center py-2 text-center',
                i === todayDay && 'bg-[#FF6B35]/5',
              )}
            >
              <span className="text-xs font-medium text-[#9B9B9B]">{day}</span>
              <span
                className={cn(
                  'text-sm font-semibold mt-0.5',
                  i === todayDay
                    ? 'h-7 w-7 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] text-white flex items-center justify-center'
                    : 'text-[#1A1A1A]',
                )}
              >
                {weekDates[i].getDate()}
              </span>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)]">
              {/* Time label */}
              <div className="flex items-start justify-end pr-2 pt-0 text-xs text-[#9B9B9B] h-[40px]">
                <span className="-mt-2">{formatHour(hour)}</span>
              </div>
              {/* Day cells for this hour - two 30-min rows */}
              {DAYS.map((_, dayIndex) => {
                const row1 = (hour - START_HOUR) * 2;
                const row2 = row1 + 1;
                const key1 = `${dayIndex}-${row1}`;
                const key2 = `${dayIndex}-${row2}`;

                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className={cn(
                      'flex flex-col border-l border-t border-[#E5E3E0]',
                      dayIndex === todayDay && 'bg-[#FF6B35]/[0.02]',
                    )}
                  >
                    {[key1, key2].map((key, subIndex) => {
                      const isAvailable = availabilityMap.has(key);
                      const isBusy = busyMap.has(key);
                      const row = subIndex === 0 ? row1 : row2;

                      return (
                        <button
                          key={key}
                          type="button"
                          className={cn(
                            'h-[20px] w-full transition-colors duration-100',
                            isAvailable &&
                              'bg-gradient-to-r from-[#FF6B35]/40 via-[#FF3F80]/40 to-[#7C5CFC]/40',
                            isBusy && 'bg-gray-300 bg-[length:8px_8px] bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.4)_2px,rgba(255,255,255,0.4)_4px)]',
                            !isAvailable && !isBusy && 'bg-white hover:bg-[#F2F0ED]/50',
                          )}
                          onClick={() => onSlotClick?.(dayIndex, formatSlotTime(row))}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
