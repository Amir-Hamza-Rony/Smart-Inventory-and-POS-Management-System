import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Supplier } from '@/models';
import { createActivityLog, notifyPaymentDue } from '@/lib/notifications';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isActive = searchParams.get('isActive');

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(query),
    ]);

    return NextResponse.json({ suppliers, total, page, limit });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, company, email, phone, address, contactPerson, taxId, paymentTerms, notes, dueAmount, userId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supplier = await Supplier.create({
      name,
      company,
      email,
      phone,
      address,
      contactPerson,
      taxId,
      paymentTerms: paymentTerms || 30,
      dueAmount: dueAmount || 0,
      notes,
    });

    // Log activity
    if (userId) {
      await createActivityLog({
        userId,
        action: 'CREATE_SUPPLIER',
        entity: 'SUPPLIER',
        entityId: supplier._id.toString(),
        entityName: supplier.name,
        details: `Added new supplier: ${supplier.name}`,
      });
    }

    // Notify about payment due if there's a due amount
    if (supplier.dueAmount > 0) {
      await notifyPaymentDue(supplier);
    }

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Supplier already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}