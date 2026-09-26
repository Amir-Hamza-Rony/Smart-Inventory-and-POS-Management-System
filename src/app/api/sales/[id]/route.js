import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Sale } from '@/models';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const sale = await Sale.findById(id)
      .populate('userId', 'name email')
      .populate('customerId', 'name email phone')
      .lean();

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const sale = await Sale.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('customerId', 'name email phone')
      .lean();

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const sale = await Sale.findByIdAndDelete(id);

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
  }
}