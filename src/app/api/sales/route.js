import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Sale, Product, Settings, User, ActivityLog } from '@/models';
import { generateSaleNumber, formatCurrency } from '@/lib/utils';
import { getUserFromRequest } from '@/lib/auth';
import { createActivityLog, notifySaleCompleted, checkAndNotifyLowStock } from '@/lib/notifications';

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
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('userId', 'name email')
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    return NextResponse.json({ sales, total, page, limit });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { items, paymentMethod, taxRate, discount, discountType, customerId, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in sale' }, { status: 400 });
    }

    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = authUser.userId;

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify stock and get product details
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discountType === 'percentage'
      ? subtotal * (discount / 100)
      : discount;
    const taxable = subtotal - discountAmount;
    const tax = taxable * (taxRate / 100);
    const total = subtotal - discountAmount + tax;

    // Create sale items with product details
    const saleItems = items.map(item => {
      const product = productMap.get(item.productId);
      return {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: item.price,
        cost: product.cost,
        total: item.price * item.quantity,
      };
    });

    // Create sale
    const saleNumber = generateSaleNumber();
    const sale = await Sale.create({
      saleNumber,
      userId,
      items: saleItems,
      subtotal,
      tax,
      discount: discountAmount,
      discountType,
      total,
      paymentMethod,
      customerId,
      notes,
    });

    // Update product stock and check for low stock
    for (const item of items) {
      const product = productMap.get(item.productId);
      const newStock = product.stock - item.quantity;

      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });

      // Check and notify low stock
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
        action: 'STOCK_OUT',
        entity: 'PRODUCT',
        entityId: product._id.toString(),
        entityName: product.name,
        details: `Stock reduced by ${item.quantity} via sale ${saleNumber}. New stock: ${newStock}`,
        metadata: { previousStock: product.stock, newStock, quantity: item.quantity, referenceId: sale._id.toString(), referenceType: 'SALE' },
      });
    }

    await sale.populate('userId', 'name email');
    if (customerId) {
      await sale.populate('customerId', 'name email');
    }

    // Create activity log for sale
    await createActivityLog({
      userId,
      action: 'CREATE_SALE',
      entity: 'SALE',
      entityId: sale._id.toString(),
      entityName: saleNumber,
      details: `Completed sale ${saleNumber} for ${formatCurrency(total)}`,
      metadata: { total, paymentMethod, itemCount: items.length },
    });

    // Send notifications
    await notifySaleCompleted(sale, userId);

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale', details: error.message }, { status: 500 });
  }
}