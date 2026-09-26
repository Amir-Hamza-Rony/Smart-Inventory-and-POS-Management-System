import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Return, Sale, Product, ActivityLog, User, Customer } from '@/models';
import { generateReturnNumber } from '@/lib/utils';
import { getUserFromRequest } from '@/lib/auth';
import { createActivityLog, notifyReturnRequest, checkAndNotifyLowStock } from '@/lib/notifications';

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
    const { saleId, items, refundMethod, notes } = body;

    if (!saleId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = authUser.userId;

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
      customerName: sale.customerId ? (await Customer.findById(sale.customerId).select('name').lean())?.name : undefined,
      items: returnItems,
      subtotal,
      tax,
      total,
      refundMethod: refundMethod || 'CASH',
      userId,
      notes,
      status: 'PENDING',
    });

    // Update product stock (increase) and check low stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      const newStock = product.stock + item.quantity;

      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });

      // Check and notify low stock (in case it was out of stock before)
      await checkAndNotifyLowStock(
        product._id.toString(),
        newStock,
        product.minStock,
        product.name,
        product.sku
      );

      // Log stock activity
      await createActivityLog({
        userId,
        action: 'STOCK_IN',
        entity: 'PRODUCT',
        entityId: product._id.toString(),
        entityName: product.name,
        details: `Stock increased by ${item.quantity} via return ${returnNumber}. New stock: ${newStock}`,
        metadata: { previousStock: product.stock, newStock, quantity: item.quantity, referenceId: returnDoc._id.toString(), referenceType: 'RETURN' },
      });
    }

    // Update sale status if all items returned
    const totalReturnedQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalSaleQty = sale.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalReturnedQty === totalSaleQty) {
      await Sale.findByIdAndUpdate(saleId, { status: 'REFUNDED' });
    }

    // Log activity
    await createActivityLog({
      userId,
      action: 'CREATE_RETURN',
      entity: 'RETURN',
      entityId: returnDoc._id.toString(),
      entityName: returnNumber,
      details: `Created return ${returnNumber} for sale ${sale.saleNumber}`,
      metadata: { total, itemCount: items.length, refundMethod: refundMethod || 'CASH' },
    });

    // Send notifications
    await notifyReturnRequest(returnDoc, userId);

    await returnDoc.populate('userId', 'name email');
    await returnDoc.populate('saleId', 'saleNumber');
    if (returnDoc.customerId) {
      await returnDoc.populate('customerId', 'name');
    }

    return NextResponse.json(returnDoc, { status: 201 });
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json({ error: 'Failed to create return', details: error.message }, { status: 500 });
  }
}