import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Category, Product } from '@/models';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeProductCount = searchParams.get('includeProductCount') === 'true';

    let categories = await Category.find().sort({ name: 1 }).lean();

    if (includeProductCount) {
      const categoryIds = categories.map(c => c._id);
      const productCounts = await Product.aggregate([
        { $match: { categoryId: { $in: categoryIds }, isActive: true } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      ]);
      const countMap = new Map(productCounts.map(p => [p._id.toString(), p.count]));
      categories = categories.map(category => ({
        ...category,
        productCount: countMap.get(category._id.toString()) || 0,
      }));
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const category = await Category.create({ name, description });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}