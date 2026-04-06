'use client';

import { cn } from '@/lib/utils/cn';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { ChevronRight } from 'lucide-react';

interface GroupCardProps {
  group: {
    id: string;
    emoji: string;
    name: string;
    memberCount: number;
    members?: { avatar_url: string | null }[];
    lastHangoutDate?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function GroupCard({ group, onClick, className }: GroupCardProps) {
  return (
    <Card
      hoverable
      className={cn('flex items-center gap-4 cursor-pointer', className)}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F2F0ED] flex items-center justify-center text-2xl flex-shrink-0">
        {group.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1A1A1A] truncate">{group.name}</p>
        <p className="text-sm text-[#6B6B6B]">{group.memberCount} members</p>
      </div>
      {group.members && group.members.length > 0 && (
        <AvatarGroup max={4} size="sm">
          {group.members.map((m, i) => (
            <Avatar key={i} src={m.avatar_url || undefined} fallback="?" size="sm" />
          ))}
        </AvatarGroup>
      )}
      <ChevronRight className="w-4 h-4 text-[#9B9B9B] flex-shrink-0" />
    </Card>
  );
}
