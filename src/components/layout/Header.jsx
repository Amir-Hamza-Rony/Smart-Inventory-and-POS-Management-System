'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, ShoppingCart, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import { usePosStore } from '@/stores/posStore';
import { useAuth } from '@/components/providers/AuthProvider';

export function Header({ onMenuClick }) {
  const router = useRouter();
  const { getItemCount } = usePosStore();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use authenticated user if available, fall back to prop
  const user = authUser;
  const itemCount = getItemCount();

  // Fetch notification count and poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications?limit=1');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function getRoleColor(role) {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'MANAGER': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'CASHIER': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 gap-4">

        {/* LEFT: Hamburger menu button only */}
        <div className="flex-shrink-0 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* RIGHT: Cart icon + Notification bell + User profile dropdown */}
        {user && (
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/dashboard" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex-shrink-0">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="sm" className="relative flex-shrink-0">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            <div className="relative flex-shrink-0">
              <button
                className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <span className="hidden md:block max-w-32 truncate text-sm font-medium text-gray-900 dark:text-white">
                  {user.name || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-medium">
                          {user.imageUrl ? (
                            <img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user.role)} capitalize`}>
                            {user.role?.toLowerCase() || 'user'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}