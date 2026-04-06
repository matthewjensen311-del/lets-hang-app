'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Check, X, Users } from 'lucide-react';
import { useState } from 'react';

interface FriendRequestCardProps {
  request: {
    id: string;
    profile: {
      avatar_url?: string | null;
      display_name: string;
      username: string;
    };
    mutualCount?: number;
    createdAt: string;
  };
  onAccept: () => void;
  onDecline: () => void;
}

export function FriendRequestCard({ request, onAccept, onDecline }: FriendRequestCardProps) {
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (accepted) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-4 rounded-2xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 text-center"
      >
        <p className="font-medium text-[#1A1A1A]">
          You&apos;re now friends with {request.profile.display_name}! 🎉
        </p>
      </motion.div>
    );
  }

  if (declined) return null;

  return (
    <motion.div
      layout
      className="p-4 rounded-2xl bg-white border border-[#E5E3E0]"
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={request.profile.avatar_url || undefined}
          fallback={request.profile.display_name[0]}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#1A1A1A] truncate">{request.profile.display_name}</p>
          <p className="text-sm text-[#6B6B6B] truncate">@{request.profile.username}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {request.mutualCount !== undefined && request.mutualCount > 0 && (
              <span className="text-xs text-[#9B9B9B] flex items-center gap-1">
                <Users className="w-3 h-3" />
                {request.mutualCount} mutual
              </span>
            )}
            <span className="text-xs text-[#9B9B9B]">
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          icon={<Check className="w-4 h-4" />}
          onClick={() => {
            setAccepted(true);
            onAccept();
          }}
        >
          Accept
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          icon={<X className="w-4 h-4" />}
          onClick={() => {
            setDeclined(true);
            onDecline();
          }}
        >
          Decline
        </Button>
      </div>
    </motion.div>
  );
}
