import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Return, Product, ActivityLog, User } from '@/models';
import { getUserFromRequest } from '@/lib/auth';
import { createActivityLog } from '@/lib/notifications';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const returnDoc = await Return.findById(id)
      .populate('saleId', 'saleNumber')
      .populate('customerId', 'name email phone')
      .populate('userId', 'name email')
      .lean();

    if (!returnDoc) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    return NextResponse.json(returnDoc);
  } catch (error) {
    console.error('Error fetching return:', error);
    return NextResponse.json({ error: 'Failed to fetch return' }, { status: 500 });
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

    const returnDoc = await Return.findById(id);
    if (!returnDoc) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    let updatedReturn = returnDoc;

    if (action === 'complete') {
      if (returnDoc.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Return already completed' }, { status: 400 });
      }

      updatedReturn = await Return.findByIdAndUpdate(
        id,
        { status: 'COMPLETED' },
        { new: true }
      )
        .populate('saleId', 'saleNumber')
        .populate('userId', 'name email')
        .lean();

      // Log activity
      await createActivityLog({
        userId,
        action: 'COMPLETE_RETURN',
        entity: 'RETURN',
        entityId: returnDoc._id.toString(),
        entityName: returnDoc.returnNumber,
        details: `Completed return ${returnDoc.returnNumber}`,
      });
    } else if (action === 'reject') {
      if (returnDoc.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Cannot reject completed return' }, { status: 400 });
      }

      // Reverse stock changes
      const bulkOps = returnDoc.items.map(item => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOps);

      updatedReturn = await Return.findByIdAndUpdate(
        id,
        { status: 'REJECTED' },
        { new: true }
      )
        .populate('saleId', 'saleNumber')
        .populate('userId', 'name email')
        .lean();

      // Log activity
      await createActivityLog({
        userId,
        action: 'REJECT_RETURN',
        entity: 'RETURN',
        entityId: returnDoc._id.toString(),
        entityName: returnDoc.returnNumber,
        details: `Rejected return ${returnDoc.returnNumber}`,
      });
    }

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error('Error updating return status:', error);
    return NextResponse.json({ error: 'Failed to update return status', details: error.message }, { status: 500 });
  }
}