'use client';

import Link from 'next/link';
import { Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TopBarProps {
  hasUnread?: boolean;
}

export function TopBar({ hasUnread = false }: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'bg-white/80 backdrop-blur-xl border-b border-[#E5E3E0]',
        'px-4 h-14 flex items-center justify-between',
      )}
    >
      <Link href="/home" className="select-none">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] bg-clip-text text-transparent">
          Let&apos;s Hang
        </h1>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative p-2 rounded-full text-[#6B6B6B] hover:bg-[#F2F0ED] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[#FF3F80] ring-2 ring-white" />
          )}
        </Link>

        <Link
          href="/settings"
          className="p-2 rounded-full text-[#6B6B6B] hover:bg-[#F2F0ED] transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
