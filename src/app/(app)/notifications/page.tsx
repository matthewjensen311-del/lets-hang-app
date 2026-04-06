'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bell, UserPlus, UserCheck, Calendar, CalendarCheck, Clock, Users, CheckCircle, Sparkles } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  friend_request: UserPlus,
  friend_accepted: UserCheck,
  hangout_invite: Calendar,
  hangout_update: CalendarCheck,
  hangout_reminder: Clock,
  itinerary_ready: Sparkles,
  rsvp_update: CheckCircle,
  group_invite: Users,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  friend_request: 'bg-[#7C5CFC]/10 text-[#7C5CFC]',
  friend_accepted: 'bg-[#00D4AA]/10 text-[#00D4AA]',
  hangout_invite: 'bg-[#FF6B35]/10 text-[#FF6B35]',
  hangout_update: 'bg-[#FFD23F]/10 text-[#FFD23F]',
  hangout_reminder: 'bg-[#FF3F80]/10 text-[#FF3F80]',
  itinerary_ready: 'bg-[#7C5CFC]/10 text-[#7C5CFC]',
  rsvp_update: 'bg-[#00D4AA]/10 text-[#00D4AA]',
  group_invite: 'bg-[#FF6B35]/10 text-[#FF6B35]',
};

function getNotificationHref(type: string, data: Record<string, unknown> | null): string {
  if (!data) return '#';
  switch (type) {
    case 'friend_request':
    case 'friend_accepted':
      return `/friends/${data.friend_id || ''}`;
    case 'hangout_invite':
    case 'hangout_update':
    case 'hangout_reminder':
    case 'itinerary_ready':
    case 'rsvp_update':
      return `/hangout/${data.hangout_id || ''}`;
    case 'group_invite':
      return `/groups/${data.group_id || ''}`;
    default:
      return '#';
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const groupedNotifications = notifications.reduce<Record<string, typeof notifications>>((acc, n) => {
    const date = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let group: string;
    if (date.toDateString() === today.toDateString()) group = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) group = 'Yesterday';
    else group = 'Earlier';

    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          Notifications
        </h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rect" height="72px" className="rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="No notifications right now. Go plan a hangout!"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">{group}</h3>
              <div className="space-y-2">
                {items.map((notification, i) => {
                  const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                  const colorClass = NOTIFICATION_COLORS[notification.type] || 'bg-[#F2F0ED] text-[#6B6B6B]';
                  const href = getNotificationHref(notification.type, notification.data as Record<string, unknown> | null);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <button
                        onClick={() => {
                          if (!notification.is_read) markAsRead(notification.id);
                          if (href !== '#') router.push(href);
                        }}
                        className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-colors ${
                          notification.is_read ? 'bg-white' : 'bg-[#7C5CFC]/[0.03]'
                        } border border-[#E5E3E0] hover:border-[#7C5CFC]/20`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${notification.is_read ? 'text-[#1A1A1A]' : 'text-[#1A1A1A] font-semibold'}`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 rounded-full bg-[#FF3F80] flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          {notification.body && (
                            <p className="text-sm text-[#6B6B6B] mt-0.5 line-clamp-2">{notification.body}</p>
                          )}
                          <p className="text-xs text-[#9B9B9B] mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
