'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Users2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { GroupCard } from '@/components/groups/GroupCard';

interface GroupPreview {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  group_members: { user_id: string; profiles: { avatar_url: string | null; display_name: string } }[];
}

export default function GroupsPage() {
  const supabase = createClient();
  const [groups, setGroups] = useState<GroupPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('group_members')
        .select('group_id, groups(id, name, emoji, description, group_members(user_id, profiles(avatar_url, display_name)))')
        .eq('user_id', user.id);

      if (data) {
        const mapped = data
          .map((gm: Record<string, unknown>) => gm.groups as unknown as GroupPreview)
          .filter(Boolean);
        setGroups(mapped);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          Groups
        </h1>
        <Link href="/groups/new">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Create
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height="80px" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="Better with the squad"
          description="Create a group to plan hangouts with your crew"
          actionLabel="Create Group"
          actionHref="/groups/new"
        />
      ) : (
        <div className="space-y-3">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link href={`/groups/${g.id}`}>
                <GroupCard
                  group={{
                    id: g.id,
                    emoji: g.emoji || '👥',
                    name: g.name,
                    memberCount: g.group_members.length,
                    members: g.group_members.map((m) => ({ avatar_url: m.profiles.avatar_url })),
                  }}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
