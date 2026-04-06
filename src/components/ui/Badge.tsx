import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const badgeVariants = {
  default: 'bg-[#F2F0ED] text-[#1A1A1A]',
  success: 'bg-[#00D4AA]/15 text-[#00997A]',
  warning: 'bg-[#FFD23F]/20 text-[#9B7A00]',
  error: 'bg-[#FF3F80]/15 text-[#D1275B]',
  brand:
    'bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] text-white',
} as const;

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
  size?: keyof typeof badgeSizes;
  dot?: boolean;
}

const dotColors: Record<keyof typeof badgeVariants, string> = {
  default: 'bg-[#6B6B6B]',
  success: 'bg-[#00D4AA]',
  warning: 'bg-[#FFD23F]',
  error: 'bg-[#FF3F80]',
  brand: 'bg-white',
};

function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        badgeVariants[variant],
        badgeSizes[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
