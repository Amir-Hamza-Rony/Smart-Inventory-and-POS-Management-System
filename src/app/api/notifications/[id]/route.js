import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Notification } from '@/models';

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isRead } = body;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { isRead, readAt: isRead ? new Date() : null },
      { new: true }
    ).lean();

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'markAllRead') {
      await Notification.updateMany(
        { userId: user.userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}

// Helper function to get user from request
async function getUserFromRequest(request) {
  const { getUserFromRequest } = await import('@/lib/auth');
  return getUserFromRequest(request);
}