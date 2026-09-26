import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Sale, Product, Customer, Purchase, Supplier, Return } from '@/models';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month

    // Calculate date ranges
    const now = new Date();
    let startDate, endDate;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'week') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const dateQuery = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const completedQuery = { ...dateQuery, status: 'COMPLETED' };

    // Fetch all stats in parallel
    const [
      salesData,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
      totalSuppliers,
      pendingPurchases,
      pendingReturns,
      dueAmounts,
    ] = await Promise.all([
      // Sales stats
      Sale.aggregate([
        { $match: completedQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalSales: { $sum: 1 },
            avgOrderValue: { $avg: '$total' },
          },
        },
      ]),
      // Product counts
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$minStock'] }, stock: { $gt: 0 } }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      Customer.countDocuments(),
      Supplier.countDocuments({ isActive: true }),
      Purchase.countDocuments({ status: 'PENDING' }),
      Return.countDocuments({ status: 'PENDING' }),
      Supplier.aggregate([
        { $match: { isActive: true, dueAmount: { $gt: 0 } } },
        { $group: { _id: null, totalDue: { $sum: '$dueAmount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const salesSummary = salesData[0] || { totalRevenue: 0, totalSales: 0, avgOrderValue: 0 };
    const dueSummary = dueAmounts[0] || { totalDue: 0, count: 0 };

    // Get low stock products list
    const lowStockList = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] },
    })
      .populate('categoryId', 'name')
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    // Get recent sales
    const recentSales = await Sale.find(completedQuery)
      .populate('userId', 'name')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get sales chart data (daily for the period)
    let chartDays;
    if (period === 'today') {
      // Hourly for today
      chartDays = 1;
    } else if (period === 'week') {
      chartDays = 7;
    } else {
      chartDays = 30;
    }

    const salesChart = await Sale.aggregate([
      { $match: completedQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing dates with zero values
    const chartData = [];
    for (let i = 0; i < chartDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const existing = salesChart.find(s => s._id === dateStr);
      chartData.push({
        date: dateStr,
        revenue: existing?.revenue || 0,
        orders: existing?.orders || 0,
      });
    }

    return NextResponse.json({
      stats: {
        todayRevenue: salesSummary.totalRevenue,
        todaySales: salesSummary.totalSales,
        avgOrderValue: salesSummary.avgOrderValue,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCustomers,
        totalSuppliers,
        pendingPurchases,
        pendingReturns,
        totalDue: dueSummary.totalDue,
        suppliersWithDue: dueSummary.count,
      },
      lowStockProducts: lowStockList,
      recentSales,
      salesChart: chartData,
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard overview' }, { status: 500 });
  }
}