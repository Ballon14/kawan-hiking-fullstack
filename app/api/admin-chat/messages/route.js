import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

// GET user's messages with admin
export async function GET() {
  try {
    const user = await requireAuth();
    const db = await getDb();

    const messages = await db.collection('admin_chat_messages')
      .find({ user_id: new ObjectId(user.id) })
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

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
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get admin chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

// POST new message to admin
export async function POST(request) {
  try {
    const user = await requireAuth();
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection('admin_chat_messages').insertOne({
      user_id: new ObjectId(user.id),
      content: content.trim(),
      is_admin_message: false,
      is_read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: 'Message sent successfully',
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Send admin chat message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
