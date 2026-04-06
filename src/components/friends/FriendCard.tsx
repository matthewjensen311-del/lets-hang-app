'use client';

import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Users, Sparkles } from 'lucide-react';

interface FriendCardProps {
  friend: {
    id: string;
    avatar_url?: string | null;
    display_name: string;
    username: string;
    mutualCount?: number;
    sharedInterestsCount?: number;
  };
  onClick?: () => void;
  className?: string;
}

export function FriendCard({ friend, onClick, className }: FriendCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E5E3E0] hover:border-[#7C5CFC]/30 transition-all active:scale-[0.98]',
        className
      )}
    >
      <Avatar
        src={friend.avatar_url || undefined}
        fallback={friend.display_name[0]}
        size="md"
      />
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-[#1A1A1A] truncate">{friend.display_name}</p>
        <p className="text-sm text-[#6B6B6B] truncate">@{friend.username}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {friend.mutualCount !== undefined && friend.mutualCount > 0 && (
          <Badge variant="default" className="text-[10px] flex items-center gap-1">
            <Users className="w-3 h-3" />
            {friend.mutualCount}
          </Badge>
        )}
        {friend.sharedInterestsCount !== undefined && friend.sharedInterestsCount > 0 && (
          <Badge variant="brand" className="text-[10px] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {friend.sharedInterestsCount}
          </Badge>
        )}
      </div>
    </button>
  );
}
