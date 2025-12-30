import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

// GET all messages
export async function GET() {
  try {
    const db = await getDb();
    
    const messages = await db.collection('community_messages')
      .find({})
      .sort({ createdAt: 1 }) // Ascending order for chat
      .limit(200) // Last 200 messages
      .toArray();

    // Get user info for each message
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await db.collection('users').findOne(
          { _id: message.user_id },
          { projection: { password: 0 } }
        );

        return {
          id: message._id.toString(),
          user_id: message.user_id.toString(),
          username: user?.username || 'Unknown',
          content: message.content,
          createdAt: message.createdAt,
        };
      })
    );

    return NextResponse.json(messagesWithUsers);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

// POST new message
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

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection('community_messages').insertOne({
      user_id: new ObjectId(user.id),
      content: content.trim(),
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
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
