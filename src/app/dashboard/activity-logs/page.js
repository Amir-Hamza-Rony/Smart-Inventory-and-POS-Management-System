'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { Search, Filter, RefreshCw, Download, User, AlertTriangle, ShoppingCart, Package, DollarSign, Truck, RotateCcw, Settings, Key } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ActivityLogsPage() {
  const { sidebarOpen } = useUIStore();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actions, setActions] = useState([]);
  const [entities, setEntities] = useState([]);
  const [users, setUsers] = useState([]);

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    fetchLogs();
    fetchFilters();
  }, [currentPage, search, actionFilter, entityFilter, userFilter, startDate, endDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      });
      if (actionFilter) params.set('action', actionFilter);
      if (entityFilter) params.set('entity', entityFilter);
      if (userFilter) params.set('userId', userFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/activity-logs?${params}`);
      const data = await response.json();
      if (data.logs) {
        setLogs(data.logs);
        setTotalPages(Math.ceil(data.total / 50));
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      // Get unique actions, entities, and users from recent logs
      const response = await fetch('/api/activity-logs?limit=500');
      const data = await response.json();
      if (data.logs) {
        const uniqueActions = [...new Set(data.logs.map(l => l.action).filter(Boolean))].sort();
        const uniqueEntities = [...new Set(data.logs.map(l => l.entity).filter(Boolean))].sort();
        const uniqueUsers = [...new Map(data.logs.map(l => [l.userId, { id: l.userId, name: l.userName, email: l.userEmail }])).values()];

        setActions(uniqueActions);
        setEntities(uniqueEntities);
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      CREATE_SALE: ShoppingCart,
      UPDATE_SALE: ShoppingCart,
      DELETE_SALE: ShoppingCart,
      CREATE_PURCHASE: Truck,
      RECEIVE_PURCHASE: Truck,
      CANCEL_PURCHASE: Truck,
      CREATE_RETURN: RotateCcw,
      COMPLETE_RETURN: RotateCcw,
      REJECT_RETURN: RotateCcw,
      CREATE_PRODUCT: Package,
      UPDATE_PRODUCT: Package,
      DELETE_PRODUCT: Package,
      STOCK_IN: Package,
      STOCK_OUT: Package,
      STOCK_ADJUSTMENT: Package,
      CREATE_SUPPLIER: User,
      UPDATE_SUPPLIER: User,
      DELETE_SUPPLIER: User,
      CREATE_CUSTOMER: User,
      UPDATE_CUSTOMER: User,
      DELETE_CUSTOMER: User,
      CREATE_CATEGORY: Package,
      UPDATE_CATEGORY: Package,
      DELETE_CATEGORY: Package,
      CREATE_BRAND: Package,
      UPDATE_BRAND: Package,
      DELETE_BRAND: Package,
      LOGIN: Key,
      LOGOUT: Key,
      CHANGE_PASSWORD: Key,
      UPDATE_PROFILE: User,
      UPDATE_SETTINGS: Settings,
    };
    return icons[action] || AlertTriangle;
  };

  const getActionColor = (action) => {
    if (action.startsWith('CREATE_')) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (action.startsWith('UPDATE_')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (action.startsWith('DELETE_')) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (action.startsWith('RECEIVE_') || action.startsWith('COMPLETE_')) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (action.startsWith('CANCEL_') || action.startsWith('REJECT_')) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (action.startsWith('STOCK_')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('PASSWORD')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page is only accessible to administrators.
        </p>
      </div>
    );
  }

  return (
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor all system activities and user actions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchLogs}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search details..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  options={[{ value: '', label: 'All Actions' }, ...actions.map(a => ({ value: a, label: formatAction(a) }))]}
                  className="w-full lg:w-48"
                />
                <Select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  options={[{ value: '', label: 'All Entities' }, ...entities.map(e => ({ value: e, label: e }))]}
                  className="w-full lg:w-40"
                />
                <Select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  options={[{ value: '', label: 'All Users' }, ...users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))]}
                  className="w-full lg:w-56"
                />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                  className="w-full lg:w-40"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                  className="w-full lg:w-40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading activity logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No activity logs found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Time</th>
                        <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">User</th>
                        <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Action</th>
                        <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Entity</th>
                        <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Details</th>
                        <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">IP / UA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{log.userName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{log.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium capitalize',
                                getActionColor(log.action)
                              )}>
                                {formatAction(log.action)}
                              </span>
                              <getActionIcon(log.action) className="w-4 h-4 text-gray-400" />
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {log.entity}
                            {log.entityName && <span className="ml-1 font-medium text-gray-900 dark:text-white">: {log.entityName}</span>}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {log.details || '-'}
                          </td>
                          <td className="p-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {log.ipAddress || '-'}
                            {log.userAgent && <span className="ml-1">{log.userAgent.slice(0, 30)}...</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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