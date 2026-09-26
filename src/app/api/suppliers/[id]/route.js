import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Supplier, Purchase } from '@/models';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const supplier = await Supplier.findById(id).lean();

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Get purchase history
    const purchases = await Purchase.find({ supplierId: id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ supplier, purchases });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).lean();

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Supplier already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // Check if supplier has purchases
    const purchaseCount = await Purchase.countDocuments({ supplierId: id });
    if (purchaseCount > 0) {
      return NextResponse.json({ error: 'Cannot delete supplier with existing purchases' }, { status: 400 });
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
}