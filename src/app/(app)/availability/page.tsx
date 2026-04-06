'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Copy, Check } from 'lucide-react';
import { useAvailability } from '@/hooks/useAvailability';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { TimeSlotPicker } from '@/components/calendar/TimeSlotPicker';
import { Skeleton } from '@/components/ui/Skeleton';
import { getDayName } from '@/lib/utils/dates';

const DAYS = [0, 1, 2, 3, 4, 5, 6]; // Sunday through Saturday

export default function AvailabilityPage() {
  const { availability, loading, setAvailability } = useAvailability();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localSlots, setLocalSlots] = useState<Record<number, { startTime: string; endTime: string }[]>>({});

  const daySlots = useCallback(
    (day: number) => {
      if (localSlots[day]) return localSlots[day];
      return availability
        .filter((a) => a.day_of_week === day && a.is_active)
        .map((a) => ({ startTime: a.start_time, endTime: a.end_time }));
    },
    [availability, localSlots]
  );

  const handleSlotsChange = (day: number, slots: { startTime: string; endTime: string }[]) => {
    setLocalSlots((prev) => ({ ...prev, [day]: slots }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const windows = Object.entries(localSlots).flatMap(([day, slots]) =>
      slots.map((s) => ({
        day_of_week: parseInt(day),
        start_time: s.startTime,
        end_time: s.endTime,
        is_active: true,
      }))
    );

    // Also include unchanged days from existing availability
    DAYS.forEach((day) => {
      if (!localSlots[day]) {
        availability
          .filter((a) => a.day_of_week === day && a.is_active)
          .forEach((a) => {
            windows.push({
              day_of_week: day,
              start_time: a.start_time,
              end_time: a.end_time,
              is_active: true,
            });
          });
      }
    });

    await setAvailability(windows);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyToWeekdays = () => {
    const currentDaySlots = daySlots(selectedDay);
    const update: Record<number, { startTime: string; endTime: string }[]> = {};
    [1, 2, 3, 4, 5].forEach((day) => {
      update[day] = [...currentDaySlots];
    });
    setLocalSlots((prev) => ({ ...prev, ...update }));
    setSaved(false);
  };

  const copyToWeekend = () => {
    const currentDaySlots = daySlots(selectedDay);
    setLocalSlots((prev) => ({
      ...prev,
      0: [...currentDaySlots],
      6: [...currentDaySlots],
    }));
    setSaved(false);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          When are you down to hang?
        </h1>
        <p className="text-[#6B6B6B] mt-1">Set your recurring availability so friends know when you&apos;re free</p>
      </motion.div>

      {/* Day Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {DAYS.map((day) => {
          const slots = daySlots(day);
          const isActive = slots.length > 0;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all ${
                selectedDay === day
                  ? 'bg-gradient-to-b from-[#FF6B35] to-[#FF3F80] text-white shadow-lg shadow-[#FF6B35]/20'
                  : isActive
                    ? 'bg-[#7C5CFC]/10 text-[#7C5CFC] border border-[#7C5CFC]/20'
                    : 'bg-white text-[#6B6B6B] border border-[#E5E3E0]'
              }`}
            >
              <span className="text-xs font-medium">{getDayName(day).slice(0, 3)}</span>
              {isActive && selectedDay !== day && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Copy Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" icon={<Copy className="w-3.5 h-3.5" />} onClick={copyToWeekdays}>
          Copy to weekdays
        </Button>
        <Button variant="ghost" size="sm" icon={<Copy className="w-3.5 h-3.5" />} onClick={copyToWeekend}>
          Copy to weekend
        </Button>
      </div>

      {/* Time Slot Picker */}
      {loading ? (
        <Skeleton variant="card" height="400px" />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E5E3E0]">
            <h3 className="font-semibold text-[#1A1A1A]">
              {getDayName(selectedDay)}
            </h3>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Drag to select available times</p>
          </div>
          <TimeSlotPicker
            selectedSlots={daySlots(selectedDay)}
            onChange={(slots) => handleSlotsChange(selectedDay, slots)}
          />
        </Card>
      )}

      {/* Save Button */}
      <div className="sticky bottom-20 lg:bottom-4 z-10">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleSave}
          loading={saving}
          icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        >
          {saved ? 'Saved!' : 'Save Availability'}
        </Button>
      </div>
    </div>
  );
}
