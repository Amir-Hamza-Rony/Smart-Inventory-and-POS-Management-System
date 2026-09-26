'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { Bell, Check, CheckCheck, X, Filter, Mail, AlertTriangle, ShoppingCart, Truck, RotateCcw, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { sidebarOpen } = useUIStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (filter !== 'all') {
        params.set('isRead', filter === 'unread' ? 'false' : 'true');
      }

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setTotalPages(Math.ceil(data.total / 20));
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, isRead) => {
    if (isRead) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      INFO: Bell,
      SUCCESS: CheckCheck,
      WARNING: AlertTriangle,
      ERROR: X,
      LOW_STOCK: AlertTriangle,
      NEW_ORDER: ShoppingCart,
      PAYMENT_DUE: DollarSign,
      PURCHASE_RECEIVED: Truck,
      RETURN_REQUEST: RotateCcw,
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type) => {
    const colors = {
      INFO: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      SUCCESS: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      WARNING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      ERROR: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      LOW_STOCK: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      NEW_ORDER: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      PAYMENT_DUE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      PURCHASE_RECEIVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      RETURN_REQUEST: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    };
    return colors[type] || colors.INFO;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, 'MMM dd, yyyy');
  };

  return (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Stay updated with your store activities</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead} variant="outline">
                  <Check className="w-4 h-4 mr-2" />
                  Mark All as Read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
              { value: 'read', label: 'Read' },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={filter === tab.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => { setFilter(tab.value); setCurrentPage(1); }}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Notifications List */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notifications</h3>
                  <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                        !notification.isRead && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', getTypeColor(notification.type))}>
                          <getTypeIcon(notification.type) className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className={cn('font-medium text-gray-900 dark:text-white', !notification.isRead && 'font-semibold')}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              {notification.actionUrl && (
                                <a href={notification.actionUrl} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
                                  View Details
                                </a>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="default" className="text-xs capitalize">{notification.type.toLowerCase().replace('_', ' ')}</Badge>
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
  );
}