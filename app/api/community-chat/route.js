import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDb();
    
    // Get all community messages
    const messages = await db.collection('community_messages')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: { createdAt: 1 }
        },
        {
          $limit: 100 // Last 100 messages
        }
      ])
      .toArray();
    
    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      content: msg.content,
      username: msg.user?.username || msg.user?.nama || 'Unknown',
      is_admin: msg.user?.role === 'admin',
      createdAt: msg.createdAt,
    }));
    
    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Get community messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    
    const { content } = await request.json();
    
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection('community_messages').insertOne({
      user_id: new ObjectId(user.id),
      content: content.trim(),
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      id: result.insertedId.toString(),
      message: 'Message sent successfully'
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Send community message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
