import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Product } from '@/models';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeProductCount = searchParams.get('includeProductCount') === 'true';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let brands = await Brand.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Brand.countDocuments(query);

    if (includeProductCount) {
      // Get product counts for each brand
      const brandIds = brands.map(b => b._id);
      const productCounts = await Product.aggregate([
        { $match: { brandId: { $in: brandIds } } },
        { $group: { _id: '$brandId', count: { $sum: 1 } } },
      ]);
      const countMap = new Map(productCounts.map(p => [p._id.toString(), p.count]));
      brands = brands.map(brand => ({
        ...brand,
        productCount: countMap.get(brand._id.toString()) || 0,
      }));
    }

    return NextResponse.json({ brands, total, page, limit });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, logoUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const brand = await Brand.create({ name, description, logoUrl });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Brand name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}