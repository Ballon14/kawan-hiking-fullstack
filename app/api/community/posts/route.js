import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

// GET all posts
export async function GET() {
  try {
    const db = await getDb();
    
    const posts = await db.collection('community_posts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Get user info for each post
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await db.collection('users').findOne(
          { _id: post.user_id },
          { projection: { password: 0 } }
        );

        return {
          id: post._id.toString(),
          user_id: post.user_id.toString(),
          username: user?.username || 'Unknown',
          content: post.content,
          image: post.image,
          likes: post.likes || [],
          comments: post.comments || [],
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
      })
    );

    return NextResponse.json(postsWithUsers);
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to get posts' },
      { status: 500 }
    );
  }
}

// POST new post
export async function POST(request) {
  try {
    const user = await requireAuth();
    const { content, image } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection('community_posts').insertOne({
      user_id: new ObjectId(user.id),
      content: content.trim(),
      image: image || null,
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: 'Post created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
