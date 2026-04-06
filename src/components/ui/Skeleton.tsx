'use client';

import { cn } from '@/lib/utils/cn';

export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'rect';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}
`;

const variantStyles = {
  text: 'w-full h-4 rounded-md',
  circle: 'rounded-full',
  card: 'w-full h-[200px] rounded-2xl',
  rect: 'rounded-md',
} as const;

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps) {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        className={cn(variantStyles[variant], className)}
        style={{
          width: width ?? (variant === 'circle' ? 48 : undefined),
          height:
            height ??
            (variant === 'circle'
              ? 48
              : variant === 'text'
                ? 16
                : variant === 'card'
                  ? 200
                  : undefined),
          background:
            'linear-gradient(90deg, #E5E3E0 25%, #F2F0ED 50%, #E5E3E0 75%)',
          backgroundSize: '800px 100%',
          animation: 'shimmer 1.5s infinite linear',
        }}
      />
    </>
  );
}
