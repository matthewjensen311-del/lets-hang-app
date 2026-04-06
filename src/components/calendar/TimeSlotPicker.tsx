'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface TimeSlotPickerProps {
  selectedSlots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

const START_HOUR = 7;
const END_HOUR = 23;
const TOTAL_ROWS = (END_HOUR - START_HOUR) * 2; // 30-min increments

function rowToTime(row: number): string {
  const totalMinutes = START_HOUR * 60 + row * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeToRow(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - START_HOUR) * 2 + (m >= 30 ? 1 : 0);
}

function formatLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 || 12;
  return m === 0 ? `${display} ${ampm}` : `${display}:${String(m).padStart(2, '0')} ${ampm}`;
}

function isRowSelected(row: number, slots: TimeSlot[]): boolean {
  const time = rowToTime(row);
  return slots.some((s) => {
    const start = timeToRow(s.startTime);
    const end = timeToRow(s.endTime);
    return row >= start && row < end;
  });
}

export function TimeSlotPicker({ selectedSlots, onChange }: TimeSlotPickerProps) {
  const [dragging, setDragging] = useState(false);
  const dragStartRow = useRef<number | null>(null);
  const dragCurrentRow = useRef<number | null>(null);
  const [, forceRender] = useState(0);

  const rows = Array.from({ length: TOTAL_ROWS }, (_, i) => i);

  const getDragRange = useCallback((): [number, number] | null => {
    if (dragStartRow.current === null || dragCurrentRow.current === null) return null;
    const minRow = Math.min(dragStartRow.current, dragCurrentRow.current);
    const maxRow = Math.max(dragStartRow.current, dragCurrentRow.current);
    return [minRow, maxRow];
  }, []);

  const commitDrag = useCallback(() => {
    const range = getDragRange();
    if (!range) return;
    const [minRow, maxRow] = range;
    const startTime = rowToTime(minRow);
    const endTime = rowToTime(maxRow + 1);

    // Check if we're deselecting (start row was already selected)
    const wasSelected = isRowSelected(dragStartRow.current!, selectedSlots);

    if (wasSelected) {
      // Remove overlapping slots
      const newSlots = selectedSlots.filter((s) => {
        const sStart = timeToRow(s.startTime);
        const sEnd = timeToRow(s.endTime) - 1;
        return sEnd < minRow || sStart > maxRow;
      });
      onChange(newSlots);
    } else {
      // Merge with existing
      const newSlot: TimeSlot = { startTime, endTime };
      const merged = mergeSlots([...selectedSlots, newSlot]);
      onChange(merged);
    }
  }, [getDragRange, onChange, selectedSlots]);

  function mergeSlots(slots: TimeSlot[]): TimeSlot[] {
    if (slots.length === 0) return [];
    const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const result: TimeSlot[] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const last = result[result.length - 1];
      if (sorted[i].startTime <= last.endTime) {
        last.endTime = sorted[i].endTime > last.endTime ? sorted[i].endTime : last.endTime;
      } else {
        result.push(sorted[i]);
      }
    }
    return result;
  }

  const handlePointerDown = (row: number) => {
    setDragging(true);
    dragStartRow.current = row;
    dragCurrentRow.current = row;
    forceRender((n) => n + 1);
  };

  const handlePointerMove = (row: number) => {
    if (!dragging) return;
    if (dragCurrentRow.current !== row) {
      dragCurrentRow.current = row;
      forceRender((n) => n + 1);
    }
  };

  const handlePointerUp = () => {
    if (dragging) {
      commitDrag();
      setDragging(false);
      dragStartRow.current = null;
      dragCurrentRow.current = null;
    }
  };

  const dragRange = getDragRange();

  return (
    <div
      className="select-none touch-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {rows.map((row) => {
        const time = rowToTime(row);
        const selected = isRowSelected(row, selectedSlots);
        const inDrag = dragging && dragRange && row >= dragRange[0] && row <= dragRange[1];
        const isHourBoundary = row % 2 === 0;

        return (
          <div
            key={row}
            className="flex items-stretch"
            onPointerDown={(e) => {
              e.preventDefault();
              handlePointerDown(row);
            }}
            onPointerMove={() => handlePointerMove(row)}
          >
            {/* Time label */}
            <div className="w-16 shrink-0 flex items-center justify-end pr-3 text-xs text-[#9B9B9B]">
              {isHourBoundary && formatLabel(time)}
            </div>

            {/* Slot */}
            <div
              className={cn(
                'flex-1 h-[40px] border-l-2 border-[#E5E3E0] cursor-pointer transition-colors duration-75',
                isHourBoundary && 'border-t border-t-[#E5E3E0]',
                selected && !inDrag &&
                  'bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] border-l-transparent',
                inDrag &&
                  'bg-gradient-to-r from-[#FF6B35]/70 via-[#FF3F80]/70 to-[#7C5CFC]/70 border-l-transparent',
                !selected && !inDrag && 'bg-white hover:bg-[#F2F0ED]/50',
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
