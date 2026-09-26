'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import {
  DollarSign, ShoppingCart, TrendingUp, Users, Package, AlertTriangle,
  Clock, ArrowUpRight, ArrowDownRight, Minus, Plus, Eye
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function DashboardOverviewPage() {
  const { sidebarOpen } = useUIStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    fetchOverview();
  }, [period]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/overview?period=${period}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Today\'s Revenue',
      value: data?.stats ? formatCurrency(data.stats.todayRevenue) : '$0.00',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Today\'s Sales',
      value: data?.stats ? formatNumber(data.stats.todaySales) : '0',
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCart,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Avg Order Value',
      value: data?.stats ? formatCurrency(data.stats.avgOrderValue) : '$0.00',
      change: '-2.1%',
      changeType: 'negative',
      icon: TrendingUp,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Total Products',
      value: data?.stats ? formatNumber(data.stats.totalProducts) : '0',
      change: 'Low Stock: ' + (data?.stats?.lowStockProducts || 0),
      changeType: data?.stats?.lowStockProducts > 0 ? 'warning' : 'neutral',
      icon: Package,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Customers',
      value: data?.stats ? formatNumber(data.stats.totalCustomers) : '0',
      change: '+5 this month',
      changeType: 'positive',
      icon: Users,
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
    },
    {
      title: 'Suppliers Due',
      value: data?.stats ? formatCurrency(data.stats.totalDue) : '$0.00',
      change: data?.stats ? `${data.stats.suppliersWithDue} suppliers` : '0 suppliers',
      changeType: data?.stats?.suppliersWithDue > 0 ? 'warning' : 'neutral',
      icon: Clock,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  const quickActions = [
    { title: 'New Sale', href: '/dashboard', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700' },
    { title: 'Add Product', href: '/products', icon: Package, color: 'bg-green-600 hover:bg-green-700' },
    { title: 'New Purchase', href: '/dashboard/purchases', icon: ArrowDownRight, color: 'bg-purple-600 hover:bg-purple-700' },
    { title: 'View Reports', href: '/reports', icon: TrendingUp, color: 'bg-orange-600 hover:bg-orange-700' },
  ];

  const CHART_COLORS = ['#3b82f6', '#10b981'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your business.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {statCards.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stat.changeType === 'positive' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                        {stat.changeType === 'negative' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                        {stat.changeType === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        {stat.changeType === 'neutral' && <Minus className="w-4 h-4 text-gray-500" />}
                        <span className={`text-xs font-medium ${
                          stat.changeType === 'positive' ? 'text-green-500' :
                          stat.changeType === 'negative' ? 'text-red-500' :
                          stat.changeType === 'warning' ? 'text-yellow-500' :
                          'text-gray-500'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`${stat.iconBg} rounded-xl p-3`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sales Trend ({period === 'today' ? 'Hourly' : period === 'week' ? 'Daily' : 'Daily'})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.salesChart || []}>
                      <defs>
                        <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="orders-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => {
                        const d = new Date(v);
                        return period === 'today' ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                      }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        labelFormatter={(v) => {
                          const d = new Date(v);
                          return period === 'today' ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#revenue-gradient)" strokeWidth={2} />
                      <Area type="monotone" dataKey="orders" stroke="#10b981" fillOpacity={1} fill="url(#orders-gradient)" strokeWidth={2} yAxisId="right" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <a
                      key={index}
                      href={action.href}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl text-white transition-colors ${action.color}`}
                    >
                      <action.icon className="w-8 h-8 mb-2" />
                      <span className="font-medium text-center">{action.title}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock & Recent Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Low Stock Products
                  </div>
                  {data?.lowStockProducts && data.lowStockProducts.length > 0 && (
                    <Badge variant="warning">{data.lowStockProducts.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {data.lowStockProducts.slice(0, 10).map((product) => (
                      <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {product.categoryId?.name || 'Uncategorized'} • SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            product.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {product.stock === 0 ? 'Out of Stock' : `Stock: ${product.stock} (Min: ${product.minStock})`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>All products are well stocked!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Sales
                  <a href="/sales" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.recentSales && data.recentSales.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {data.recentSales.map((sale) => (
                      <div key={sale._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{sale.saleNumber}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {sale.userId?.name || 'Unknown'} • {sale.items.length} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(sale.total)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sales yet today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
  );
}