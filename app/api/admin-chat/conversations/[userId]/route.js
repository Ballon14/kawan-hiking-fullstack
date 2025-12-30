import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

// GET messages with specific user
export async function GET(request, { params }) {
  try {
    await requireAdmin();
    const { userId } = await params;
    
    const db = await getDb();

    const messages = await db.collection('admin_chat_messages')
      .find({ user_id: new ObjectId(userId) })
      .sort({ createdAt: 1 })
      .toArray();

    // Mark admin messages as read
    await db.collection('admin_chat_messages').updateMany(
      { 
        user_id: new ObjectId(userId),
        is_admin_message: false,
        is_read: false 
      },
      { $set: { is_read: true } }
    );

    return NextResponse.json(
      messages.map(msg => ({
        id: msg._id.toString(),
        user_id: msg.user_id.toString(),
        content: msg.content,
        is_admin_message: msg.is_admin_message || false,
        is_read: msg.is_read || false,
        createdAt: msg.createdAt,
      }))
    );
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get user messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

// POST reply to user
export async function POST(request, { params }) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection('admin_chat_messages').insertOne({
      user_id: new ObjectId(userId),
      content: content.trim(),
      is_admin_message: true,
      is_read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: 'Reply sent successfully',
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Send reply error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
