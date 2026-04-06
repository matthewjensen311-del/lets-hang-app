'use client';

import { forwardRef } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils/cn';

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
}

const Toggle = forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  ToggleProps
>(({ className, label, id, ...props }, ref) => {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const toggle = (
    <SwitchPrimitive.Root
      ref={ref}
      id={toggleId}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=unchecked]:bg-[#E5E3E0]',
        'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FF6B35] data-[state=checked]:via-[#FF3F80] data-[state=checked]:to-[#7C5CFC]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] ring-0 transition-transform duration-200',
          'data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5',
        )}
      />
    </SwitchPrimitive.Root>
  );

  if (label) {
    return (
      <div className="flex items-center gap-3">
        {toggle}
        <label
          htmlFor={toggleId}
          className="cursor-pointer text-sm font-medium text-[#1A1A1A]"
        >
          {label}
        </label>
      </div>
    );
  }

  return toggle;
});

Toggle.displayName = 'Toggle';

export { Toggle };
