import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models';

export async function GET() {
  try {
    await connectDB();

    let settings = await Settings.findById('settings').lean();

    if (!settings) {
      settings = await Settings.create({ _id: 'settings' });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { storeName, taxRate, currency, receiptFooter } = body;

    const settings = await Settings.findByIdAndUpdate(
      'settings',
      { storeName, taxRate, currency, receiptFooter },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}