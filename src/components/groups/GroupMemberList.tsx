'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MoreHorizontal, Shield, UserMinus, ShieldPlus } from 'lucide-react';
import { useState } from 'react';

interface Member {
  id: string;
  avatar_url?: string | null;
  display_name: string;
  username: string;
  role: 'admin' | 'member';
}

interface GroupMemberListProps {
  members: Member[];
  isAdmin: boolean;
  currentUserId?: string;
  onRemove?: (id: string) => void;
  onPromote?: (id: string) => void;
}

export function GroupMemberList({ members, isAdmin, currentUserId, onRemove, onPromote }: GroupMemberListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {members.map((member) => {
        const isSelf = member.id === currentUserId;
        const showActions = isAdmin && !isSelf;

        return (
          <div key={member.id} className="rounded-2xl">
            <div className="flex items-center gap-3 p-3 hover:bg-[#F2F0ED] rounded-2xl transition-colors">
              <Avatar
                src={member.avatar_url || undefined}
                fallback={member.display_name[0]}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#1A1A1A] truncate">{member.display_name}</p>
                  {isSelf && <span className="text-xs text-[#9B9B9B]">(you)</span>}
                </div>
                <p className="text-sm text-[#6B6B6B] truncate">@{member.username}</p>
              </div>
              {member.role === 'admin' && (
                <Badge variant="brand" className="flex items-center gap-1 text-[10px]">
                  <Shield className="w-3 h-3" />
                  Admin
                </Badge>
              )}
              {showActions && (
                <button
                  onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                  className="p-1.5 rounded-lg text-[#9B9B9B] hover:text-[#6B6B6B] hover:bg-[#E5E3E0] transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>
            {expandedId === member.id && showActions && (
              <div className="flex gap-2 px-3 pb-3 ml-[52px]">
                {member.role === 'member' && onPromote && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ShieldPlus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      onPromote(member.id);
                      setExpandedId(null);
                    }}
                  >
                    Make Admin
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<UserMinus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (confirm(`Remove ${member.display_name} from the group?`)) {
                        onRemove(member.id);
                        setExpandedId(null);
                      }
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
