import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product } from '@/models';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // in-stock, low-stock, out-of-stock
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (status === 'low-stock') {
      query.$expr = { $lte: ['$stock', '$minStock'] };
      query.stock = { $gt: 0 };
    } else if (status === 'out-of-stock') {
      query.stock = 0;
    } else if (status === 'in-stock') {
      query.$expr = { $gt: ['$stock', '$minStock'] };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name')
        .populate({ path: 'brandId', select: 'name', options: { strictPopulate: false } })
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { productId, type, quantity, reason, userId, referenceId, referenceType } = body;

    if (!productId || !type || !quantity || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return NextResponse.json({ error: 'Invalid movement type' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let newStock = product.stock;
    if (type === 'IN') {
      newStock += quantity;
    } else if (type === 'OUT') {
      if (product.stock < quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      newStock -= quantity;
    } else if (type === 'ADJUSTMENT') {
      newStock = quantity;
    }

    product.stock = newStock;
    await product.save();

    // Log activity
    const { ActivityLog, User } = await import('@/models');
    const dbUser = await User.findById(userId).lean();
    await ActivityLog.create({
      userId,
      userName: dbUser?.name || 'Unknown',
      userEmail: dbUser?.email || 'unknown@email.com',
      action: `STOCK_${type}`,
      entity: 'PRODUCT',
      entityId: product._id,
      entityName: product.name,
      details: `Stock ${type.toLowerCase()}: ${quantity} units (${reason || 'No reason provided'}). New stock: ${newStock}`,
      metadata: { previousStock: product.stock - (type === 'IN' ? quantity : type === 'OUT' ? -quantity : 0), newStock, reason, referenceId, referenceType },
    });

    return NextResponse.json({ product: product.toObject() });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}