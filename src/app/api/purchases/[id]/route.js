import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Purchase, Product, Supplier, ActivityLog, User } from '@/models';
import { getUserFromRequest } from '@/lib/auth';
import { createActivityLog, notifyPurchaseReceived } from '@/lib/notifications';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const purchase = await Purchase.findById(id)
      .populate('supplierId', 'name company email phone address contactPerson')
      .populate('userId', 'name email')
      .lean();

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const purchase = await Purchase.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
      .populate('supplierId', 'name company')
      .populate('userId', 'name email')
      .lean();

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Only allow deletion of pending purchases
    if (purchase.status !== 'PENDING') {
      return NextResponse.json({ error: 'Can only delete pending purchases' }, { status: 400 });
    }

    // Reverse supplier due amount
    await Supplier.findByIdAndUpdate(purchase.supplierId, {
      $inc: { dueAmount: -purchase.total }
    });

    await Purchase.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = authUser.userId;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    let updatedPurchase = purchase;

    if (action === 'receive') {
      // Mark as received and update product stock
      if (purchase.status === 'RECEIVED') {
        return NextResponse.json({ error: 'Purchase already received' }, { status: 400 });
      }

      // Update product stock
      const bulkOps = purchase.items.map(item => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOps);

      // Log stock movements for each product (STOCK_IN with entity: PRODUCT)
      for (const item of purchase.items) {
        await createActivityLog({
          userId,
          action: 'STOCK_IN',
          entity: 'PRODUCT',
          entityId: item.productId.toString(),
          entityName: item.productName,
          details: `Stock increased by ${item.quantity} via purchase receipt ${purchase.purchaseNumber}`,
          metadata: { quantity: item.quantity, referenceId: purchase._id.toString(), referenceType: 'PURCHASE' },
        });
      }

      updatedPurchase = await Purchase.findByIdAndUpdate(
        id,
        { status: 'RECEIVED', receivedDate: new Date() },
        { new: true }
      )
        .populate('supplierId', 'name company')
        .populate('userId', 'name email')
        .lean();

      // Log activity
      await createActivityLog({
        userId,
        action: 'RECEIVE_PURCHASE',
        entity: 'PURCHASE',
        entityId: purchase._id.toString(),
        entityName: purchase.purchaseNumber,
        details: `Received purchase ${purchase.purchaseNumber} from ${purchase.supplierName}`,
        metadata: { supplierId: purchase.supplierId.toString(), itemCount: purchase.items.length },
      });

      // Send notifications
      await notifyPurchaseReceived(purchase, userId);
    } else if (action === 'cancel') {
      if (purchase.status === 'RECEIVED') {
        return NextResponse.json({ error: 'Cannot cancel received purchase' }, { status: 400 });
      }

      // Reverse supplier due amount
      await Supplier.findByIdAndUpdate(purchase.supplierId, {
        $inc: { dueAmount: -purchase.total }
      });

      updatedPurchase = await Purchase.findByIdAndUpdate(
        id,
        { status: 'CANCELLED' },
        { new: true }
      )
        .populate('supplierId', 'name company')
        .populate('userId', 'name email')
        .lean();

      // Log activity
      await createActivityLog({
        userId,
        action: 'CANCEL_PURCHASE',
        entity: 'PURCHASE',
        entityId: purchase._id.toString(),
        entityName: purchase.purchaseNumber,
        details: `Cancelled purchase ${purchase.purchaseNumber}`,
      });
    }

    return NextResponse.json(updatedPurchase);
  } catch (error) {
    console.error('Error updating purchase status:', error);
    return NextResponse.json({ error: 'Failed to update purchase status', details: error.message }, { status: 500 });
  }
}