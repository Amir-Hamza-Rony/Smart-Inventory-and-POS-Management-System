import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Return, Product, ActivityLog, User } from '@/models';

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
    const { action, userId } = body;

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
      await ActivityLog.create({
        userId,
        userName: (await User.findById(userId).lean()).name || 'Unknown',
        userEmail: (await User.findById(userId).lean()).email || 'unknown@email.com',
        action: 'COMPLETE_RETURN',
        entity: 'RETURN',
        entityId: returnDoc._id,
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
      await ActivityLog.create({
        userId,
        userName: (await User.findById(userId).lean()).name || 'Unknown',
        userEmail: (await User.findById(userId).lean()).email || 'unknown@email.com',
        action: 'REJECT_RETURN',
        entity: 'RETURN',
        entityId: returnDoc._id,
        entityName: returnDoc.returnNumber,
        details: `Rejected return ${returnDoc.returnNumber}`,
      });
    }

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error('Error updating return status:', error);
    return NextResponse.json({ error: 'Failed to update return status' }, { status: 500 });
  }
}