import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

// GET all conversations (grouped by user)
export async function GET() {
  try {
    await requireAdmin();
    const db = await getDb();

    // Get all messages and group by user
    const messages = await db.collection('admin_chat_messages')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Group by user_id and get last message
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const userId = msg.user_id.toString();
      
      if (!conversationsMap.has(userId)) {
        const user = await db.collection('users').findOne(
          { _id: msg.user_id },
          { projection: { password: 0 } }
        );
        
        // Count unread
        const unreadCount = await db.collection('admin_chat_messages')
          .countDocuments({
            user_id: msg.user_id,
            is_admin_message: false,
            is_read: false,
          });
        
        conversationsMap.set(userId, {
          user_id: userId,
          username: user?.username || 'Unknown',
          last_message: msg.content,
          last_message_time: msg.createdAt,
          unread_count: unreadCount,
          is_last_from_admin: msg.is_admin_message,
        });
      }
    }

    return NextResponse.json(Array.from(conversationsMap.values()));
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}
