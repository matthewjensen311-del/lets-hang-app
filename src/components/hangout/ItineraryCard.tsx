'use client';

import { motion } from 'framer-motion';
import {
  Utensils,
  Footprints,
  Wine,
  Music,
  Car,
  MapPin,
  Star,
  RefreshCw,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ItineraryItem {
  order: number;
  type: string;
  title: string;
  description: string;
  venue_name: string;
  venue_address?: string;
  venue_photo_url?: string;
  venue_rating?: number;
  venue_price_level?: number;
  estimated_cost_per_person?: number;
  why_this_fits?: string;
  suggested_time?: string;
  booking_url?: string;
}

interface ItineraryCardProps {
  item: ItineraryItem;
  onSwap?: () => void;
  isActive?: boolean;
  isPast?: boolean;
}

const TYPE_ICONS: Record<string, typeof Utensils> = {
  food: Utensils,
  activity: Footprints,
  drinks: Wine,
  entertainment: Music,
  transport: Car,
  other: MapPin,
};

function getPriceLabel(level: number): string {
  return '$'.repeat(Math.max(1, Math.min(level, 4)));
}

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 fill-[#FFD23F] text-[#FFD23F]" />,
      );
    } else if (i === full && hasHalf) {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 fill-[#FFD23F]/50 text-[#FFD23F]" />,
      );
    } else {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 text-[#E5E3E0]" />,
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export function ItineraryCard({ item, onSwap, isActive = false, isPast = false }: ItineraryCardProps) {
  const Icon = TYPE_ICONS[item.type] || MapPin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(isPast && 'opacity-60')}
    >
      <Card
        variant="elevated"
        className={cn(
          'overflow-hidden relative',
          isActive && 'ring-2 ring-[#FF6B35]',
        )}
      >
        {isActive && (
          <motion.div
            className="absolute inset-0 ring-2 ring-[#FF6B35] rounded-2xl pointer-events-none"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Photo or placeholder */}
        {item.venue_photo_url ? (
          <div className="relative h-[200px] -mx-5 -mt-5 mb-4 overflow-hidden">
            <img
              src={item.venue_photo_url}
              alt={item.venue_name}
              className="h-full w-full object-cover"
            />
            {/* Time badge overlay */}
            {item.suggested_time && (
              <div className="absolute top-3 left-3">
                <Badge variant="brand" size="sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.suggested_time}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-[200px] -mx-5 -mt-5 mb-4 bg-gradient-to-br from-[#FF6B35]/10 via-[#FF3F80]/10 to-[#7C5CFC]/10 flex items-center justify-center">
            <Icon className="h-12 w-12 text-[#9B9B9B]/50" />
            {item.suggested_time && (
              <div className="absolute top-3 left-3">
                <Badge variant="brand" size="sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.suggested_time}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-2">
          {/* Type + title */}
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF6B35]/10 to-[#7C5CFC]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="h-4 w-4 text-[#FF6B35]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#1A1A1A] leading-tight">{item.title}</h3>
              <p className="text-sm text-[#6B6B6B] mt-0.5">{item.venue_name}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#6B6B6B] leading-relaxed">{item.description}</p>

          {/* Rating + Price row */}
          {(item.venue_rating || item.venue_price_level || item.estimated_cost_per_person) && (
            <div className="flex items-center gap-3 flex-wrap">
              {item.venue_rating && (
                <div className="flex items-center gap-1">
                  <RatingStars rating={item.venue_rating} />
                  <span className="text-xs text-[#6B6B6B] ml-0.5">{item.venue_rating.toFixed(1)}</span>
                </div>
              )}
              {item.venue_price_level && (
                <span className="text-sm font-medium text-[#00D4AA]">
                  {getPriceLabel(item.venue_price_level)}
                </span>
              )}
              {item.estimated_cost_per_person != null && (
                <span className="text-xs text-[#9B9B9B]">
                  ~${item.estimated_cost_per_person}/person
                </span>
              )}
            </div>
          )}

          {/* Why this fits */}
          {item.why_this_fits && (
            <p className="text-sm italic text-[#7C5CFC] leading-relaxed">
              &ldquo;{item.why_this_fits}&rdquo;
            </p>
          )}

          {/* Address */}
          {item.venue_address && (
            <p className="text-xs text-[#9B9B9B] flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.venue_address}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-1">
            {onSwap && (
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={onSwap}
              >
                Swap
              </Button>
            )}
            {item.booking_url && (
              <Button
                variant="ghost"
                size="sm"
                icon={<ExternalLink className="h-3.5 w-3.5" />}
                onClick={() => window.open(item.booking_url, '_blank')}
              >
                Book
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
