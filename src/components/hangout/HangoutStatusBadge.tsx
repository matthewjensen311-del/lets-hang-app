'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';

type HangoutStatus = 'proposed' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface HangoutStatusBadgeProps {
  status: HangoutStatus;
}

const STATUS_CONFIG: Record<
  HangoutStatus,
  {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'error' | 'brand';
    pulse?: boolean;
  }
> = {
  proposed: { label: 'Proposed', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  in_progress: { label: 'Live', variant: 'brand', pulse: true },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

export function HangoutStatusBadge({ status }: HangoutStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (config.pulse) {
    return (
      <Badge variant={config.variant} dot>
        <motion.span
          className="inline-flex"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {config.label}
        </motion.span>
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
