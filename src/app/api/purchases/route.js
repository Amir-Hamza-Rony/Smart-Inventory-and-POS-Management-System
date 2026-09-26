import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { Purchase, Supplier, Product, ActivityLog, User } from '@/models';
import { generatePurchaseNumber } from '@/lib/utils';
import { getUserFromRequest } from '@/lib/auth';
import { createActivityLog, notifyPurchaseCreated } from '@/lib/notifications';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query = {};

    if (status) {
      query.status = status;
    }

    if (supplierId) {
      query.supplierId = supplierId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate('supplierId', 'name company')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Purchase.countDocuments(query),
    ]);

    return NextResponse.json({ purchases, total, page, limit });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { supplierId, items, taxRate, discount, discountType, expectedDate, notes } = body;

    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = authUser.userId;

    // Validate supplier ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return NextResponse.json({ error: 'Invalid supplier ID' }, { status: 400 });
    }

    // Verify supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 400 });
    }

    // Validate product IDs are valid ObjectIds
    for (const item of items) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return NextResponse.json({ error: 'Invalid product ID in items' }, { status: 400 });
      }
    }

    // Verify products and get costs
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const item of items) {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.unitCost || productMap.get(item.productId.toString()).cost) * item.quantity, 0);
    const discountAmount = discountType === 'percentage'
      ? subtotal * (discount / 100)
      : discount;
    const taxable = subtotal - discountAmount;
    const tax = taxable * (taxRate / 100);
    const total = subtotal - discountAmount + tax;

    // Create purchase items with product details
    const purchaseItems = items.map(item => {
      const product = productMap.get(item.productId.toString());
      return {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitCost: item.unitCost || product.cost,
        total: (item.unitCost || product.cost) * item.quantity,
      };
    });

    // Create purchase
    const purchaseNumber = generatePurchaseNumber();
    const purchase = await Purchase.create({
      purchaseNumber,
      supplierId,
      supplierName: supplier.name,
      items: purchaseItems,
      subtotal,
      tax,
      discount: discountAmount,
      discountType,
      total,
      userId,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      notes,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paidAmount: 0,
    });

    // Update supplier due amount
    await Supplier.findByIdAndUpdate(supplierId, {
      $inc: { dueAmount: total }
    });

    // Log activity
    await createActivityLog({
      userId,
      action: 'CREATE_PURCHASE',
      entity: 'PURCHASE',
      entityId: purchase._id.toString(),
      entityName: purchaseNumber,
      details: `Created purchase ${purchaseNumber} for supplier ${supplier.name}`,
    });

    // Send notifications
    await notifyPurchaseCreated(purchase, userId);

    await purchase.populate('userId', 'name email');
    await purchase.populate('supplierId', 'name company');

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: 'Failed to create purchase', details: error.message }, { status: 500 });
  }
}