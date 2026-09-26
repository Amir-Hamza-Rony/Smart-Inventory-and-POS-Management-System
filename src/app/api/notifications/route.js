import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Notification } from '@/models';

export async function GET(request) {
  try {
    await connectDB();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isRead = searchParams.get('isRead');

    const query = { userId: user.userId };

    if (isRead !== null) {
      query.isRead = isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: user.userId, isRead: false }),
    ]);

    return NextResponse.json({ notifications, total, page, limit, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// Helper function to get user from request
async function getUserFromRequest(request) {
  const { getUserFromRequest } = await import('@/lib/auth');
  return getUserFromRequest(request);
}