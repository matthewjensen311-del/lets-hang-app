'use client';

import { MapPin, Star, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';

interface VenueCardProps {
  name: string;
  address: string;
  photoUrl?: string;
  rating?: number;
  priceLevel?: number;
  googlePlaceId?: string;
}

function getPriceLabel(level: number): string {
  return '$'.repeat(Math.max(1, Math.min(level, 4)));
}

export function VenueCard({ name, address, photoUrl, rating, priceLevel, googlePlaceId }: VenueCardProps) {
  const directionsUrl = googlePlaceId
    ? `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <Card variant="elevated" className="overflow-hidden p-0">
      {/* Photo */}
      {photoUrl ? (
        <div className="h-[120px] overflow-hidden">
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-[120px] bg-gradient-to-br from-[#FF6B35]/10 via-[#FF3F80]/10 to-[#7C5CFC]/10 flex items-center justify-center">
          <MapPin className="h-8 w-8 text-[#9B9B9B]/40" />
        </div>
      )}

      <div className="p-4 flex flex-col gap-1.5">
        <h4 className="text-base font-bold text-[#1A1A1A] leading-tight">{name}</h4>
        <p className="text-sm text-[#9B9B9B] leading-snug">{address}</p>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {rating != null && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-[#FFD23F] text-[#FFD23F]" />
                <span className="text-sm font-medium text-[#1A1A1A]">{rating.toFixed(1)}</span>
              </div>
            )}
            {priceLevel != null && (
              <span className="text-sm font-medium text-[#00D4AA]">
                {getPriceLabel(priceLevel)}
              </span>
            )}
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#7C5CFC] hover:text-[#6B4DE0] transition-colors"
          >
            <Navigation className="h-3.5 w-3.5" />
            Directions
          </a>
        </div>
      </div>
    </Card>
  );
}
