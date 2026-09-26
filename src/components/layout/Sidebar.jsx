'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, BarChart2, Users, Settings, ChevronLeft, ChevronRight, FileText, Truck, CreditCard, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, activeTab, setActiveTab } = useUIStore();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'POS', href: '/dashboard', icon: ShoppingCart, tab: 'pos' },
    { name: 'Products', href: '/products', icon: Package, tab: 'products' },
    { name: 'Sales', href: '/sales', icon: BarChart2, tab: 'sales' },
    { name: 'Customers', href: '/customers', icon: Users, tab: 'customers' },
    { name: 'Settings', href: '/settings', icon: Settings, tab: 'settings' },
  ];

  const adminOnly = [
    { name: 'Reports', href: '/reports', icon: FileText, tab: 'reports' },
    { name: 'Inventory', href: '/inventory', icon: Truck, tab: 'inventory' },
    { name: 'Payments', href: '/payments', icon: CreditCard, tab: 'payments' },
  ];

  const userMenuItems = [
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
    { name: 'Sign Out', href: '/', icon: LogOut, action: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar - fixed on all screens */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
        aria-label="Sidebar navigation"
        style={{ height: '100vh' }}
      >
        {/* Top spacing for header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700" />

        {/* Navigation content */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href || activeTab === item.tab
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
              onClick={() => setActiveTab(item.tab)}
              title={sidebarOpen ? undefined : item.name}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {sidebarOpen && <span className="truncate">{item.name}</span>}
            </Link>
          ))}

          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

          {adminOnly.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href || activeTab === item.tab
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
              onClick={() => setActiveTab(item.tab)}
              title={sidebarOpen ? undefined : item.name}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {sidebarOpen && <span className="truncate">{item.name}</span>}
            </Link>
          ))}

          {/* User section */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2" />
          {userMenuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
              title={sidebarOpen ? undefined : item.name}
              onClick={async (e) => {
                if (item.action) {
                  e.preventDefault();
                  await logout();
                  window.location.href = '/';
                }
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {sidebarOpen && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse/Expand button at bottom */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
