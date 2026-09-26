import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Sale, Product } from '@/models';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const completedQuery = { ...dateQuery, status: 'COMPLETED' };

    // Summary stats
    const [sales, totalRevenueResult, uniqueCustomersResult] = await Promise.all([
      Sale.find(completedQuery).lean(),
      Sale.aggregate([
        { $match: completedQuery },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Sale.aggregate([
        { $match: completedQuery },
        { $group: { _id: '$customerId' } },
        { $count: 'count' },
      ]),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const totalSales = sales.length;
    const uniqueCustomers = uniqueCustomersResult[0]?.count || 0;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Daily sales
    const dailySalesMap = new Map();
    sales.forEach(sale => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!dailySalesMap.has(date)) {
        dailySalesMap.set(date, { date, revenue: 0, orders: 0 });
      }
      const day = dailySalesMap.get(date);
      day.revenue += sale.total;
      day.orders += 1;
    });
    const dailySales = Array.from(dailySalesMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    // Top products
    const productSalesMap = new Map();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.productId.toString();
        if (!productSalesMap.has(key)) {
          productSalesMap.set(key, {
            productId: item.productId,
            name: item.productName,
            quantity: 0,
            revenue: 0,
          });
        }
        const prod = productSalesMap.get(key);
        prod.quantity += item.quantity;
        prod.revenue += item.total;
      });
    });
    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by category
    const categorySalesMap = new Map();
    for (const sale of sales) {
      for (const item of sale.items) {
        const product = await Product.findById(item.productId).populate('categoryId', 'name').lean();
        if (product?.categoryId) {
          const catName = product.categoryId.name;
          if (!categorySalesMap.has(catName)) {
            categorySalesMap.set(catName, { name: catName, revenue: 0, count: 0 });
          }
          const cat = categorySalesMap.get(catName);
          cat.revenue += item.total;
          cat.count += item.quantity;
        }
      }
    }
    const salesByCategory = Array.from(categorySalesMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    // Sales by payment method
    const paymentMethodMap = new Map();
    sales.forEach(sale => {
      if (!paymentMethodMap.has(sale.paymentMethod)) {
        paymentMethodMap.set(sale.paymentMethod, { method: sale.paymentMethod, count: 0, revenue: 0 });
      }
      const pm = paymentMethodMap.get(sale.paymentMethod);
      pm.count += 1;
      pm.revenue += sale.total;
    });
    const salesByPaymentMethod = Array.from(paymentMethodMap.values())
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalSales,
        avgOrderValue,
        uniqueCustomers,
      },
      dailySales,
      topProducts,
      salesByCategory,
      salesByPaymentMethod,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}