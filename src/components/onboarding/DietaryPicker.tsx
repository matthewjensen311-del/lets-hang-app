'use client';

import { Chip } from '@/components/ui/Chip';
import { DIETARY_OPTIONS } from '@/lib/constants/dietary';

interface DietaryPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function DietaryPicker({ selected, onToggle }: DietaryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {DIETARY_OPTIONS.map((option) => (
        <Chip
          key={option.id}
          emoji={option.emoji}
          label={option.label}
          selected={selected.includes(option.id)}
          onToggle={() => onToggle(option.id)}
        />
      ))}
    </div>
  );
}
