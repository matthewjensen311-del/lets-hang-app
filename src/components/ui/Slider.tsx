'use client';

import { forwardRef } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils/cn';

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
}

const Slider = forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, showValue = false, ...props }, ref) => {
  const value = props.value ?? props.defaultValue ?? [0];

  return (
    <div className="flex flex-col gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-[#1A1A1A]">{label}</span>
          )}
          {showValue && (
            <span className="text-sm tabular-nums text-[#6B6B6B]">
              {value[0]}
              {value.length > 1 ? ` - ${value[1]}` : ''}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#E5E3E0]">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC]" />
        </SliderPrimitive.Track>
        {(props.value ?? props.defaultValue ?? [0]).map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className={cn(
              'block h-5 w-5 rounded-full border-2 border-white bg-gradient-to-br from-[#FF6B35] to-[#7C5CFC] shadow-[0_1px_4px_rgba(0,0,0,0.15)]',
              'transition-transform duration-150 hover:scale-110',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = 'Slider';

export { Slider };
