'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Edit2, Save, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getInterestById } from '@/lib/constants/interests';
import type { Profile, UserPreferences } from '@/types/user';

const BUDGET_LABELS: Record<string, string> = {
  free: 'Free ($0)',
  budget: 'Budget ($1-15)',
  moderate: 'Moderate ($15-40)',
  splurge: 'Splurge ($40-80)',
  no_limit: 'No Limit ($80+)',
};

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '', city: '', state: '' });
  const [stats, setStats] = useState({ hangoutCount: 0, friendCount: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: prefsData }, { data: hangoutCount }, { data: friendCount }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
        supabase.from('hangout_participants').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('friendships').select('id', { count: 'exact', head: true }).or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq('status', 'accepted'),
      ]);

      const p = profileData as unknown as Profile;
      setProfile(p);
      setPreferences(prefsData as unknown as UserPreferences);
      if (p) {
        setEditForm({ display_name: p.display_name || '', bio: p.bio || '', city: p.city || '', state: p.state || '' });
      }
      setStats({ hangoutCount: hangoutCount?.length || 0, friendCount: friendCount?.length || 0 });
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update(editForm).eq('id', profile.id);
    setProfile({ ...profile, ...editForm });
    setEditing(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton variant="circle" width="80px" height="80px" />
          <Skeleton variant="text" width="150px" height="24px" />
          <Skeleton variant="text" width="100px" />
        </div>
        <Skeleton variant="card" height="100px" />
        <Skeleton variant="card" height="150px" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="relative inline-block">
          <Avatar src={profile.avatar_url || undefined} fallback={(profile.display_name || '?')[0]} size="xl" />
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-[#E5E3E0] shadow-sm flex items-center justify-center hover:bg-[#F2F0ED]">
            <Camera className="w-4 h-4 text-[#6B6B6B]" />
          </button>
        </div>

        {editing ? (
          <div className="mt-4 space-y-3 text-left">
            <Input label="Display Name" value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
            <Input label="Bio" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} helperText={`${editForm.bio.length}/160`} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              <Input label="State" value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(false)} icon={<X className="w-4 h-4" />}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mt-4 text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              {profile.display_name}
            </h1>
            <p className="text-[#6B6B6B]">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-[#6B6B6B] mt-2 max-w-[300px] mx-auto">{profile.bio}</p>}
            {profile.city && (
              <div className="flex items-center justify-center gap-1 mt-2 text-sm text-[#9B9B9B]">
                <MapPin className="w-3.5 h-3.5" />
                {profile.city}{profile.state ? `, ${profile.state}` : ''}
              </div>
            )}
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => setEditing(true)} icon={<Edit2 className="w-3.5 h-3.5" />}>
              Edit Profile
            </Button>
          </>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.hangoutCount}</p>
          <p className="text-sm text-[#6B6B6B]">Hangouts</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.friendCount}</p>
          <p className="text-sm text-[#6B6B6B]">Friends</p>
        </Card>
      </div>

      {/* Interests */}
      {preferences && (preferences.interests as string[]).length > 0 && (
        <Card>
          <h3 className="font-semibold mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {(preferences.interests as string[]).map((interestId) => {
              const interest = getInterestById(interestId);
              if (!interest) return null;
              return <Chip key={interestId} label={interest.label} emoji={interest.emoji} selected size="sm" onToggle={() => {}} />;
            })}
          </div>
        </Card>
      )}

      {/* Preferences Summary */}
      {preferences && (
        <Card>
          <h3 className="font-semibold mb-3">Preferences</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B6B6B]">Budget</span>
              <Badge variant="default">{BUDGET_LABELS[preferences.budget_tier] || preferences.budget_tier}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B6B6B]">Energy</span>
              <Badge variant="default">{preferences.activity_energy}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B6B6B]">Setting</span>
              <Badge variant="default">{preferences.indoor_outdoor}</Badge>
            </div>
            {(preferences.dietary_restrictions as string[]).length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-[#6B6B6B]">Dietary</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                  {(preferences.dietary_restrictions as string[]).map((d) => (
                    <Badge key={d} variant="warning" className="text-[10px]">{d}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
