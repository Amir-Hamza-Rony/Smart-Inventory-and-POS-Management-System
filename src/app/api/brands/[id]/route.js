import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Product } from '@/models';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const brand = await Brand.findById(id).lean();

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Get product count
    const productCount = await Product.countDocuments({ brandId: id });

    return NextResponse.json({ ...brand, productCount });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const brand = await Brand.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).lean();

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Brand name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // Check if brand has products
    const productCount = await Product.countDocuments({ brandId: id });
    if (productCount > 0) {
      return NextResponse.json({ error: 'Cannot delete brand with existing products' }, { status: 400 });
    }

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}