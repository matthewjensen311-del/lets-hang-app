'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MiniCalendarProps {
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
  highlightedDates?: string[];
}

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MiniCalendar({ selectedDate, onSelect, highlightedDates = [] }: MiniCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());

  const highlightSet = useMemo(() => new Set(highlightedDates), [highlightedDates]);

  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    // Monday = 0
    const startDow = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];

    for (let i = 0; i < startDow; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(viewYear, viewMonth, d));
    }
    // Pad to fill last week
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [viewMonth, viewYear]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="w-full max-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-[#F2F0ED] transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-[#6B6B6B]" />
        </button>
        <span className="text-sm font-semibold text-[#1A1A1A]">
          {monthName} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-[#F2F0ED] transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-[#6B6B6B]" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="flex items-center justify-center h-8 text-xs font-medium text-[#9B9B9B]">
            {label}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="h-10" />;
          }

          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isHighlighted = highlightSet.has(toDateString(date));

          return (
            <button
              key={toDateString(date)}
              type="button"
              onClick={() => onSelect?.(date)}
              className="flex flex-col items-center justify-center h-10 relative group"
            >
              <div
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors duration-150',
                  isSelected &&
                    'bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] text-white',
                  !isSelected && isToday &&
                    'ring-2 ring-[#FF6B35] text-[#1A1A1A]',
                  !isSelected && !isToday &&
                    'text-[#1A1A1A] hover:bg-[#F2F0ED]',
                )}
              >
                {date.getDate()}
              </div>
              {isHighlighted && (
                <motion.div
                  className={cn(
                    'absolute bottom-0.5 h-1 w-1 rounded-full',
                    isSelected ? 'bg-white' : 'bg-gradient-to-r from-[#FF6B35] to-[#7C5CFC]',
                  )}
                  layoutId={`dot-${toDateString(date)}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
