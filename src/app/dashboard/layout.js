'use client';

import { Header, Sidebar } from '@/components/layout';
import { useUIStore } from '@/stores/posStore';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
        style={{ minWidth: 0 }}
      >
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}