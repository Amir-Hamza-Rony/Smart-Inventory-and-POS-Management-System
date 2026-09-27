'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription, AlertTitle } from '@/components/ui';
import { useAuth } from '@/components/providers/AuthProvider';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Clock, Lock, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Reports accessible to ADMIN and MANAGER only
  const canAccess = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    if (!authLoading && !canAccess) {
      router.push('/dashboard/overview');
    }
  }, [authLoading, canAccess, router]);

  useEffect(() => {
    if (canAccess) {
      fetchReports();
    }
  }, [canAccess, dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.set('startDate', dateRange.start);
      if (dateRange.end) params.set('endDate', dateRange.end);

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickRanges = [
    { label: 'Today', start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    { label: 'This Week', start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    { label: 'This Month', start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    { label: 'Last Month', start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0], end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0] },
  ];

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for unauthorized users
  if (!canAccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <Lock className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <Alert variant="destructive">
            <AlertTriangle className="w-5 h-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              This page is only accessible to administrators and managers. Please contact your system administrator if you believe this is an error.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/dashboard/overview')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while fetching reports
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">Loading reports...</div>
      </div>
    );
  }

  const { summary, dailySales, topProducts, salesByCategory, salesByPaymentMethod } = reportData;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-1">
            {quickRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => setDateRange({ start: range.start, end: range.end })}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(summary.totalSales)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.avgOrderValue)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unique Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(summary.uniqueCustomers)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} yAxisId="right" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="revenue"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {salesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByPaymentMethod}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="method"
                    label={({ method, percent }) => `${method} ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {salesByPaymentMethod.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Transactions']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}