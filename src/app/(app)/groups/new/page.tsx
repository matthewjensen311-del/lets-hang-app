'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Smile } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Check } from 'lucide-react';

const POPULAR_EMOJI = ['👥', '🎉', '🏀', '🍕', '🎮', '🎵', '☕', '🏖️', '🎬', '🧗', '🍻', '🎭', '💪', '🌮', '🎯', '🃏', '🚴', '🎶', '📚', '🌄'];

export default function NewGroupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { friends } = useFriends();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name, description, emoji, created_by: user.id })
      .select()
      .single();

    if (error || !group) {
      setCreating(false);
      return;
    }

    // Add creator as admin
    const members = [
      { group_id: group.id, user_id: user.id, role: 'admin' as const },
      ...selectedMembers.map((id) => ({
        group_id: group.id,
        user_id: id,
        role: 'member' as const,
      })),
    ];

    await supabase.from('group_members').insert(members);

    // Send notifications to members
    const notifications = selectedMembers.map((userId) => ({
      user_id: userId,
      type: 'group_invite' as const,
      title: 'Group Invite',
      body: `You've been added to ${name}`,
      data: { group_id: group.id },
    }));
    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    router.push(`/groups/${group.id}`);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          Create a Group
        </h1>
      </motion.div>

      {/* Emoji + Name */}
      <div className="flex items-start gap-3">
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-16 h-16 rounded-2xl bg-[#F2F0ED] border border-[#E5E3E0] flex items-center justify-center text-3xl hover:border-[#7C5CFC] transition-colors"
          >
            {emoji}
          </button>
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-2xl shadow-lg border border-[#E5E3E0] z-10 grid grid-cols-5 gap-2 w-[200px]">
              {POPULAR_EMOJI.map((e) => (
                <button
                  key={e}
                  onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-[#F2F0ED] rounded-lg transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1">
          <Input
            label="Group Name"
            placeholder="Weekend Crew"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <Input
        label="Description (optional)"
        placeholder="What's this group about?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Add Members */}
      <div>
        <h3 className="text-sm font-medium text-[#1A1A1A] mb-3">Add Members</h3>
        {selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedMembers.map((id) => {
              const friend = friends.find((f) => f.profile.id === id);
              if (!friend) return null;
              return (
                <div key={id} className="flex items-center gap-2 bg-[#7C5CFC]/10 rounded-full pl-1 pr-3 py-1">
                  <Avatar src={friend.profile.avatar_url || undefined} fallback={(friend.profile.display_name || '?')[0]} size="sm" />
                  <span className="text-sm font-medium">{friend.profile.display_name || ''}</span>
                  <button onClick={() => toggleMember(id)} className="text-[#9B9B9B] hover:text-[#FF3F80] text-lg leading-none">&times;</button>
                </div>
              );
            })}
          </div>
        )}
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {friends.map((f) => {
            const isSelected = selectedMembers.includes(f.profile.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleMember(f.profile.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                  isSelected ? 'border-[#7C5CFC] bg-[#7C5CFC]/5' : 'border-transparent hover:bg-[#F2F0ED]'
                }`}
              >
                <Avatar src={f.profile.avatar_url || undefined} fallback={(f.profile.display_name || '?')[0]} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{f.profile.display_name || ''}</p>
                  <p className="text-xs text-[#6B6B6B]">@{f.profile.username}</p>
                </div>
                {isSelected && <Check className="w-5 h-5 text-[#7C5CFC]" />}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={handleCreate}
        loading={creating}
        disabled={!name.trim()}
      >
        Create Group
      </Button>
    </div>
  );
}
