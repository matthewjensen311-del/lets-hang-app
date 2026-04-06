'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, PlusCircle, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Tab {
  label: string;
  icon: typeof Home;
  href: string;
  center?: boolean;
}

const tabs: Tab[] = [
  { label: 'Home', icon: Home, href: '/home' },
  { label: 'Friends', icon: Users, href: '/friends' },
  { label: 'Plan', icon: PlusCircle, href: '/hangout/new', center: true },
  { label: 'Notifications', icon: Bell, href: '/notifications' },
  { label: 'Profile', icon: User, href: '/profile' },
];

interface BottomNavProps {
  unreadCount?: number;
}

export function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 lg:hidden',
        'bg-white/80 backdrop-blur-xl border-t border-[#E5E3E0]',
        'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full shadow-lg',
                    'bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC]',
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-[10px] mt-1 font-medium text-[#6B6B6B]">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive
                      ? 'text-[#FF6B35]'
                      : 'text-[#6B6B6B]',
                  )}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                {tab.label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#FF3F80] text-white text-[10px] font-semibold leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-[#FF6B35]' : 'text-[#6B6B6B]',
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
