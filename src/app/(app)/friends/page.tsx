'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, UserPlus, Users, Inbox, Sparkles } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { FriendCard } from '@/components/friends/FriendCard';
import { FriendRequestCard } from '@/components/friends/FriendRequestCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type Tab = 'friends' | 'requests' | 'suggested';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const { friends, pendingRequests, loading, acceptRequest, declineRequest } = useFriends();

  const filteredFriends = friends.filter(
    (f) =>
      (f.profile.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.profile.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { id: Tab; label: string; count?: number; icon: React.ElementType }[] = [
    { id: 'friends', label: 'Friends', count: friends.length, icon: Users },
    { id: 'requests', label: 'Requests', count: pendingRequests.length, icon: Inbox },
    { id: 'suggested', label: 'Suggested', icon: Sparkles },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          Friends
        </h1>
        <Link href="/friends?add=true">
          <Button variant="primary" size="sm" icon={<UserPlus className="w-4 h-4" />}>
            Add
          </Button>
        </Link>
      </div>

      <Input
        placeholder="Search friends..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        iconLeft={<Search className="w-4 h-4" />}
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F2F0ED] rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[#1A1A1A] shadow-sm'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant={tab.id === 'requests' && tab.count > 0 ? 'error' : 'default'} className="text-[10px] px-1.5 py-0.5">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'friends' && (
          <>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rect" height="72px" className="rounded-2xl" />
                ))}
              </div>
            ) : filteredFriends.length === 0 ? (
              <EmptyState
                icon={Users}
                title={searchQuery ? 'No matches found' : 'Your crew awaits'}
                description={searchQuery ? 'Try a different search' : 'Add friends to see when you\'re all free'}
                actionLabel="Add Friends"
                actionHref="/friends?add=true"
              />
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((f) => (
                  <Link key={f.id} href={`/friends/${f.profile.id}`}>
                    <FriendCard
                      friend={{
                        id: f.profile.id,
                        avatar_url: f.profile.avatar_url,
                        display_name: f.profile.display_name || '',
                        username: f.profile.username,
                      }}
                    />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No pending requests"
                description="When someone sends you a friend request, it'll show up here"
              />
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <FriendRequestCard
                    key={req.id}
                    request={{
                      id: req.id,
                      profile: { ...req.profile, display_name: req.profile.display_name || '' },
                      createdAt: req.created_at,
                    }}
                    onAccept={() => acceptRequest(req.id)}
                    onDecline={() => declineRequest(req.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'suggested' && (
          <EmptyState
            icon={Sparkles}
            title="Suggestions coming soon"
            description="We'll suggest friends based on mutual connections and shared interests"
          />
        )}
      </motion.div>
    </div>
  );
}
