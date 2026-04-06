'use client';

import { type ReactNode } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils/cn';

const avatarSizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
} as const;

const onlineDotSizes = {
  sm: 'h-2 w-2 border',
  md: 'h-2.5 w-2.5 border-[1.5px]',
  lg: 'h-3 w-3 border-2',
  xl: 'h-4 w-4 border-2',
} as const;

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: keyof typeof avatarSizes;
  online?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  online,
  className,
}: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#F2F0ED]',
          avatarSizes[size],
          className,
        )}
      >
        <AvatarPrimitive.Image
          src={src ?? undefined}
          alt={alt}
          className="h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] font-semibold text-white"
          delayMs={300}
        >
          {fallback ? getInitials(fallback) : '?'}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white',
            onlineDotSizes[size],
            online ? 'bg-[#00D4AA]' : 'bg-[#9B9B9B]',
          )}
        />
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: keyof typeof avatarSizes;
  className?: string;
}

function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  const overlapMap: Record<string, string> = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((child, i) => (
        <div
          key={i}
          className={cn(
            'relative ring-2 ring-white rounded-full',
            i > 0 && overlapMap[size],
          )}
          style={{ zIndex: visible.length - i }}
        >
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full bg-[#F2F0ED] font-medium text-[#6B6B6B] ring-2 ring-white',
            avatarSizes[size],
            overlapMap[size],
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
