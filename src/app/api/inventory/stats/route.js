import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product } from '@/models';

export async function GET() {
  try {
    await connectDB();

    const [inStock, lowStock, outOfStock, totalValue] = await Promise.all([
      Product.countDocuments({ isActive: true, $expr: { $gt: ['$stock', '$minStock'] } }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$minStock'] }, stock: { $gt: 0 } }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalValue: { $sum: { $multiply: ['$stock', '$cost'] } } } },
      ]),
    ]);

    return NextResponse.json({
      inStock,
      lowStock,
      outOfStock,
      totalValue: totalValue[0]?.totalValue || 0,
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory stats' }, { status: 500 });
  }
}