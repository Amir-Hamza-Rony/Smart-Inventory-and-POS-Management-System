import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Return, Sale, Product, ActivityLog, User } from '@/models';
import { generateReturnNumber } from '@/lib/utils';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [returns, total] = await Promise.all([
      Return.find(query)
        .populate('saleId', 'saleNumber')
        .populate('customerId', 'name')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Return.countDocuments(query),
    ]);

    return NextResponse.json({ returns, total, page, limit });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { saleId, items, refundMethod, userId, notes } = body;

    if (!saleId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify sale exists and is completed
    const sale = await Sale.findById(saleId).lean();
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    if (sale.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Can only return completed sales' }, { status: 400 });
    }

    // Verify items are from this sale and quantities don't exceed original
    const saleItemsMap = new Map(sale.items.map(item => [item.productId.toString(), item]));

    for (const item of items) {
      const saleItem = saleItemsMap.get(item.productId);
      if (!saleItem) {
        return NextResponse.json({ error: `Product ${item.productId} not found in this sale` }, { status: 400 });
      }
      if (item.quantity > saleItem.quantity) {
        return NextResponse.json({ error: `Return quantity exceeds purchased quantity for ${saleItem.productName}` }, { status: 400 });
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = sale.tax / sale.subtotal * 100;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    // Create return items
    const returnItems = items.map(item => {
      const saleItem = saleItemsMap.get(item.productId);
      return {
        productId: saleItem.productId,
        productName: saleItem.productName,
        sku: saleItem.sku,
        saleId: sale._id,
        saleNumber: sale.saleNumber,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        reason: item.reason,
      };
    });

    // Create return
    const returnNumber = generateReturnNumber();
    const returnDoc = await Return.create({
      returnNumber,
      saleId: sale._id,
      saleNumber: sale.saleNumber,
      customerId: sale.customerId,
      customerName: sale.customerId ? (await Sale.populate(sale, { path: 'customerId', select: 'name' })).customerId?.name : undefined,
      items: returnItems,
      subtotal,
      tax,
      total,
      refundMethod: refundMethod || 'CASH',
      userId,
      notes,
      status: 'PENDING',
    });

    // Update product stock (increase)
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOps);

    // Update sale status if all items returned
    const totalReturnedQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalSaleQty = sale.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalReturnedQty === totalSaleQty) {
      await Sale.findByIdAndUpdate(saleId, { status: 'REFUNDED' });
    }

    // Log activity
    await ActivityLog.create({
      userId,
      userName: (await User.findById(userId).lean()).name || 'Unknown',
      userEmail: (await User.findById(userId).lean()).email || 'unknown@email.com',
      action: 'CREATE_RETURN',
      entity: 'RETURN',
      entityId: returnDoc._id,
      entityName: returnNumber,
      details: `Created return ${returnNumber} for sale ${sale.saleNumber}`,
    });

    await returnDoc.populate('userId', 'name email');
    await returnDoc.populate('saleId', 'saleNumber');
    if (returnDoc.customerId) {
      await returnDoc.populate('customerId', 'name');
    }

    return NextResponse.json(returnDoc, { status: 201 });
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json({ error: 'Failed to create return' }, { status: 500 });
  }
}