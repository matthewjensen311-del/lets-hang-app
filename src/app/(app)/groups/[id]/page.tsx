'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Users, Clock, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { GroupMemberList } from '@/components/groups/GroupMemberList';
import { AvailabilityGrid } from '@/components/calendar/AvailabilityGrid';

interface GroupDetail {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  created_by: string;
  group_members: {
    user_id: string;
    role: 'admin' | 'member';
    profiles: { id: string; display_name: string; username: string; avatar_url: string | null };
  }[];
}

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'availability' | 'hangouts'>('members');
  const [sharedAvailability, setSharedAvailability] = useState<{ date: string; startTime: string; endTime: string; availableCount: number }[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setMyUserId(user?.id || null);

      const { data } = await supabase
        .from('groups')
        .select('*, group_members(user_id, role, profiles(id, display_name, username, avatar_url))')
        .eq('id', params.id)
        .single();

      if (data) {
        setGroup(data as unknown as GroupDetail);

        // Fetch shared availability for all group members
        const memberIds = (data as unknown as GroupDetail).group_members.map((m) => m.user_id);
        try {
          const res = await fetch('/api/calendar/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userIds: memberIds,
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            }),
          });
          if (res.ok) {
            const { slots } = await res.json();
            setSharedAvailability(slots.map((s: Record<string, string>) => ({ ...s, availableCount: memberIds.length })));
          }
        } catch {
          // Silently fail
        }
      }
      setLoading(false);
    }
    load();
  }, [supabase, params.id]);

  const isAdmin = group?.group_members.some((m) => m.user_id === myUserId && m.role === 'admin') ?? false;

  const handleRemoveMember = async (userId: string) => {
    if (!group) return;
    await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', userId);
    setGroup({
      ...group,
      group_members: group.group_members.filter((m) => m.user_id !== userId),
    });
  };

  const handlePromoteMember = async (userId: string) => {
    if (!group) return;
    await supabase.from('group_members').update({ role: 'admin' }).eq('group_id', group.id).eq('user_id', userId);
    setGroup({
      ...group,
      group_members: group.group_members.map((m) =>
        m.user_id === userId ? { ...m, role: 'admin' as const } : m
      ),
    });
  };

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-4">
        <Skeleton variant="text" width="60%" height="32px" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="card" height="200px" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[#6B6B6B]">Group not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/groups')}>Back to Groups</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'members' as const, label: 'Members', icon: Users },
    { id: 'availability' as const, label: 'Availability', icon: Calendar },
    { id: 'hangouts' as const, label: 'Hangouts', icon: Clock },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A]">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-5xl mb-3">{group.emoji || '👥'}</div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          {group.name}
        </h1>
        {group.description && <p className="text-[#6B6B6B] mt-1">{group.description}</p>}
        <p className="text-sm text-[#9B9B9B] mt-1">{group.group_members.length} members</p>
      </motion.div>

      {/* Plan Hangout CTA */}
      <Button
        variant="primary"
        className="w-full"
        onClick={() => router.push(`/hangout/new?group=${group.id}`)}
      >
        Plan Group Hangout
      </Button>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F2F0ED] rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'members' && (
          <GroupMemberList
            members={group.group_members.map((m) => ({
              id: m.user_id,
              avatar_url: m.profiles.avatar_url,
              display_name: m.profiles.display_name,
              username: m.profiles.username,
              role: m.role,
            }))}
            isAdmin={isAdmin}
            currentUserId={myUserId || undefined}
            onRemove={handleRemoveMember}
            onPromote={handlePromoteMember}
          />
        )}

        {activeTab === 'availability' && (
          <div className="space-y-3">
            <p className="text-sm text-[#6B6B6B]">
              Darker blocks = more members available. Tap a slot to start planning.
            </p>
            {sharedAvailability.length > 0 ? (
              <AvailabilityGrid
                slots={sharedAvailability}
                totalUsers={group.group_members.length}
                onSlotClick={(slot) => router.push(`/hangout/new?group=${group.id}&date=${slot.date}&start=${slot.startTime}`)}
              />
            ) : (
              <Card className="text-center py-8">
                <p className="text-[#6B6B6B]">No shared availability this week</p>
                <p className="text-sm text-[#9B9B9B] mt-1">Ask members to set their availability</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'hangouts' && (
          <Card className="text-center py-8">
            <p className="text-[#6B6B6B]">No hangouts yet</p>
            <p className="text-sm text-[#9B9B9B] mt-1">Plan your first group hangout!</p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
