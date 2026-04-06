'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar, Link2, Bell, Shield, User, LogOut, Trash2, ChevronRight,
  ExternalLink, CreditCard, Car, MessageSquare, Ticket
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';

interface CalendarConnection {
  id: string;
  provider: string;
  provider_account_id: string;
  is_active: boolean;
  last_synced_at: string | null;
}

const INTEGRATIONS = [
  { name: 'OpenTable', description: 'Auto-book restaurant reservations', icon: '🍽️', color: 'bg-red-50' },
  { name: 'Ticketmaster', description: 'Score tickets to shows and events', icon: '🎫', color: 'bg-blue-50' },
  { name: 'Uber/Lyft', description: 'Coordinate rides to your hangout', icon: '🚗', color: 'bg-gray-50' },
  { name: 'Venmo/Splitwise', description: 'Split costs after your hangout', icon: '💳', color: 'bg-green-50' },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    friendRequests: true,
    hangoutInvites: true,
    hangoutUpdates: true,
    hangoutReminders: true,
    rsvpUpdates: true,
  });
  const [privacyPrefs, setPrivacyPrefs] = useState({
    showInSuggestions: true,
    showCityToNonFriends: false,
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('calendar_connections')
        .select('id, provider, provider_account_id, is_active, last_synced_at')
        .eq('user_id', user.id);
      setConnections((data as CalendarConnection[]) || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    // In production, this would call a server-side function
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleConnectGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/settings`,
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
      },
    });
  };

  const handleDisconnect = async (connectionId: string) => {
    await supabase.from('calendar_connections').delete().eq('id', connectionId);
    setConnections(connections.filter((c) => c.id !== connectionId));
  };

  return (
    <div className="px-4 py-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          Settings
        </h1>
      </motion.div>

      {/* Calendar Connections */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider">Calendar Connections</h2>
        {connections.length > 0 ? (
          connections.map((conn) => (
            <Card key={conn.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F2F0ED] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#7C5CFC]" />
                </div>
                <div>
                  <p className="font-medium text-sm capitalize">{conn.provider} Calendar</p>
                  <p className="text-xs text-[#9B9B9B]">
                    {conn.last_synced_at ? `Last synced ${new Date(conn.last_synced_at).toLocaleDateString()}` : 'Not synced yet'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDisconnect(conn.id)}>
                Disconnect
              </Button>
            </Card>
          ))
        ) : (
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2F0ED] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#6B6B6B]" />
              </div>
              <p className="text-sm text-[#6B6B6B]">No calendars connected</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleConnectGoogle}>
              Connect
            </Button>
          </Card>
        )}
      </section>

      {/* Integrations (Coming Soon) */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider">Integrations</h2>
        {INTEGRATIONS.map((integration) => (
          <Card key={integration.name} className="flex items-center justify-between opacity-75">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center text-xl`}>
                {integration.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{integration.name}</p>
                <p className="text-xs text-[#9B9B9B]">{integration.description}</p>
              </div>
            </div>
            <Badge variant="default" className="text-[10px]">Coming Soon</Badge>
          </Card>
        ))}
      </section>

      {/* Notification Preferences */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider">Notifications</h2>
        <Card className="space-y-4">
          {Object.entries({
            friendRequests: 'Friend requests',
            hangoutInvites: 'Hangout invites',
            hangoutUpdates: 'Hangout updates',
            hangoutReminders: 'Hangout reminders',
            rsvpUpdates: 'RSVP updates',
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-[#1A1A1A]">{label}</span>
              <Toggle
                checked={notifPrefs[key as keyof typeof notifPrefs]}
                onCheckedChange={(checked) => setNotifPrefs({ ...notifPrefs, [key]: checked })}
              />
            </div>
          ))}
        </Card>
      </section>

      {/* Privacy */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider">Privacy</h2>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#1A1A1A]">Show me in friend suggestions</span>
            <Toggle
              checked={privacyPrefs.showInSuggestions}
              onCheckedChange={(checked) => setPrivacyPrefs({ ...privacyPrefs, showInSuggestions: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#1A1A1A]">Show city to non-friends</span>
            <Toggle
              checked={privacyPrefs.showCityToNonFriends}
              onCheckedChange={(checked) => setPrivacyPrefs({ ...privacyPrefs, showCityToNonFriends: checked })}
            />
          </div>
        </Card>
      </section>

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider">Account</h2>
        <Button variant="secondary" className="w-full justify-between" onClick={handleSignOut}>
          <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</span>
          <ChevronRight className="w-4 h-4 text-[#9B9B9B]" />
        </Button>
        <Button variant="ghost" className="w-full justify-between text-[#FF3F80]" onClick={() => setShowDeleteModal(true)}>
          <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete Account</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </section>

      {/* About */}
      <section className="text-center py-4">
        <p className="text-xs text-[#9B9B9B]">Let&apos;s Hang v1.0.0</p>
        <p className="text-xs text-[#9B9B9B] mt-1">Made with ❤️ for better hangouts</p>
      </section>

      {/* Delete Account Modal */}
      <Modal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Account"
        description="This action cannot be undone. All your data, friends, and hangout history will be permanently deleted."
      >
        <div className="flex gap-3 mt-4">
          <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleDeleteAccount}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
