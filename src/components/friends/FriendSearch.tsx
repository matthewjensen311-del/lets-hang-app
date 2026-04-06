'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Check, Clock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface SearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  friendship_status: 'none' | 'pending' | 'accepted' | null;
}

interface FriendSearchProps {
  onSelect?: (userId: string) => void;
  selectedIds?: string[];
}

export function FriendSearch({ onSelect, selectedIds = [] }: FriendSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      // Search failed silently
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSendRequest = async (userId: string) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresseeId: userId }),
      });
      if (res.ok) {
        setSentRequests((prev) => new Set([...prev, userId]));
        onSelect?.(userId);
      }
    } catch {
      // Request failed silently
    }
  };

  const getButtonState = (result: SearchResult) => {
    if (selectedIds.includes(result.id)) return 'selected';
    if (sentRequests.has(result.id)) return 'sent';
    if (result.friendship_status === 'accepted') return 'friends';
    if (result.friendship_status === 'pending') return 'pending';
    return 'add';
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by username or name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        iconLeft={<Search className="w-4 h-4" />}
      />

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton variant="circle" width="40px" height="40px" />
              <div className="flex-1">
                <Skeleton variant="text" width="120px" />
                <Skeleton variant="text" width="80px" height="12px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-1">
          {results.map((result) => {
            const state = getButtonState(result);
            return (
              <div
                key={result.id}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F2F0ED] transition-colors"
              >
                <Avatar
                  src={result.avatar_url || undefined}
                  fallback={result.display_name[0]}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1A1A1A] truncate">{result.display_name}</p>
                  <p className="text-sm text-[#6B6B6B] truncate">@{result.username}</p>
                </div>
                {state === 'add' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<UserPlus className="w-3.5 h-3.5" />}
                    onClick={() => handleSendRequest(result.id)}
                  >
                    Add
                  </Button>
                )}
                {state === 'sent' && (
                  <Button variant="secondary" size="sm" disabled icon={<Clock className="w-3.5 h-3.5" />}>
                    Sent
                  </Button>
                )}
                {state === 'pending' && (
                  <Button variant="secondary" size="sm" disabled icon={<Clock className="w-3.5 h-3.5" />}>
                    Pending
                  </Button>
                )}
                {state === 'friends' && (
                  <Button variant="ghost" size="sm" disabled icon={<Check className="w-3.5 h-3.5" />}>
                    Friends
                  </Button>
                )}
                {state === 'selected' && (
                  <Button variant="secondary" size="sm" disabled icon={<Check className="w-3.5 h-3.5" />}>
                    Selected
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#6B6B6B]">No one found</p>
          <p className="text-sm text-[#9B9B9B] mt-1">Try a different search or invite them!</p>
        </div>
      )}
    </div>
  );
}
