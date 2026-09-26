import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Purchase, Supplier } from '@/models';

export async function GET() {
  try {
    await connectDB();

    const [pending, received, totalValue, totalDue] = await Promise.all([
      Purchase.countDocuments({ status: 'PENDING' }),
      Purchase.countDocuments({ status: 'RECEIVED' }),
      Purchase.aggregate([
        { $match: { status: { $in: ['PENDING', 'RECEIVED'] } } },
        { $group: { _id: null, totalValue: { $sum: '$total' } } },
      ]),
      Supplier.aggregate([
        { $match: { isActive: true, dueAmount: { $gt: 0 } } },
        { $group: { _id: null, totalDue: { $sum: '$dueAmount' } } },
      ]),
    ]);

    return NextResponse.json({
      pending,
      received,
      totalValue: totalValue[0]?.totalValue || 0,
      totalDue: totalDue[0]?.totalDue || 0,
    });
  } catch (error) {
    console.error('Error fetching purchase stats:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase stats' }, { status: 500 });
  }
}