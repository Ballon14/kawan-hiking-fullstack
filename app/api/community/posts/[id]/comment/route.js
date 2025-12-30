import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

// POST comment
export async function POST(request, { params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const comment = {
      id: new ObjectId().toString(),
      user_id: user.id,
      username: user.username,
      content: content.trim(),
      createdAt: new Date(),
    };

    await db.collection('community_posts').updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { comments: comment },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      comment,
      message: 'Comment added successfully',
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Comment post error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
