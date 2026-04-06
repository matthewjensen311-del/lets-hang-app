import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageTransition } from '@/components/layout/PageTransition';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />

      <main className="flex-1 w-full mx-auto px-4 pt-4 pb-20 lg:pb-4 lg:max-w-[480px]">
        <PageTransition>{children}</PageTransition>
      </main>

      <BottomNav />
    </div>
  );
}
