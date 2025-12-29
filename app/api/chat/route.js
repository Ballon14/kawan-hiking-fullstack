import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();
    const db = await getDb();
    
    const messages = await db.collection('chat_messages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    const formattedMessages = messages.map(msg => ({
      ...msg,
      id: msg._id.toString(),
      _id: undefined
    })).reverse();
    
    return NextResponse.json(formattedMessages);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Chat fetch error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const sanitizedMessage = message.trim().slice(0, 1000);
    const db = await getDb();

    const result = await db.collection('chat_messages').insertOne({
      username: user.username,
      message: sanitizedMessage,
      role: user.role,
      is_read: false,
      createdAt: new Date(),
    });

    // If admin, mark user messages as read
    if (user.role === 'admin') {
      await db.collection('chat_messages').updateMany(
        { role: 'user', is_read: false },
        { $set: { is_read: true } }
      );
    }

    const newMessage = await db.collection('chat_messages').findOne({
      _id: result.insertedId
    });

    return NextResponse.json({
      ...newMessage,
      id: newMessage._id.toString(),
      _id: undefined
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Chat send error:', error);
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 });
  }
}
