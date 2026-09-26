'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, BarChart2, Users, Settings, ChevronLeft, ChevronRight, FileText, Truck, CreditCard, User, LogOut, LayoutDashboard, Box, ShoppingBag, RotateCcw, Bell, Activity, Tag, Image, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function getIconComponent(iconName) {
  const icons = {
    LayoutDashboard,
    ShoppingCart,
    Package,
    BarChart2,
    Users,
    Settings,
    FileText,
    Box,
    ShoppingBag,
    RotateCcw,
    Bell,
    Activity,
    Tag,
    Image,
    Building2,
  };
  return icons[iconName] || LayoutDashboard;
}

export function Sidebar({ collapsed = false, onToggle, onSignOut }) {
  const pathname = usePathname();

  // Static navigation - all items always visible with text when expanded
  const navigation = [
    { name: 'Dashboard', href: '/dashboard/overview', icon: LayoutDashboard, tab: 'overview' },
    { name: 'POS', href: '/dashboard', icon: ShoppingCart, tab: 'pos' },
    { name: 'Products', href: '/products', icon: Package, tab: 'products' },
    { name: 'Sales', href: '/sales', icon: ShoppingBag, tab: 'sales' },
    { name: 'Customers', href: '/customers', icon: Users, tab: 'customers' },
    { name: 'Reports', href: '/reports', icon: BarChart2, tab: 'reports' },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Box, tab: 'inventory' },
    { name: 'Purchases', href: '/dashboard/purchases', icon: Truck, tab: 'purchases' },
    { name: 'Suppliers', href: '/dashboard/suppliers', icon: Building2, tab: 'suppliers' },
    { name: 'Returns', href: '/dashboard/returns', icon: RotateCcw, tab: 'returns' },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, tab: 'notifications' },
    { name: 'Categories', href: '/dashboard/categories', icon: Tag, tab: 'categories' },
    { name: 'Brands', href: '/dashboard/brands', icon: Image, tab: 'brands' },
  ];

  const userMenuItems = [
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
    { name: 'Sign Out', href: '/', icon: LogOut, action: true },
  ];

  return (
    <aside
      className={cn(
        'h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Sidebar navigation"
      style={{ height: '100vh', minWidth: collapsed ? '64px' : '256px' }}
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
              pathname === item.href
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
            onClick={() => !collapsed && onToggle?.()}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </Link>
        ))}

        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

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
            title={collapsed ? item.name : undefined}
            onClick={(e) => {
              if (item.action) {
                e.preventDefault();
                onSignOut?.();
              } else if (!collapsed) {
                onToggle?.();
              }
            }}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse/Expand button at bottom */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <ChevronLeft className="w-5 h-5 mx-auto" />
          )}
        </button>
      </div>
    </aside>
  );
}