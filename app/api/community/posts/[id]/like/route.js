import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

// POST like/unlike
export async function POST(request, { params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const db = await getDb();

    const post = await db.collection('community_posts').findOne({
      _id: new ObjectId(id)
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const userId = user.id;
    const likes = post.likes || [];
    const isLiked = likes.includes(userId);

    // Toggle like
    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $push: { likes: userId } };

    await db.collection('community_posts').updateOne(
      { _id: new ObjectId(id) },
      { ...update, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json({
      liked: !isLiked,
      message: isLiked ? 'Unliked' : 'Liked',
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Like post error:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    );
  }
}
