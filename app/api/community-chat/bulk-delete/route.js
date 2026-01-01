import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
  try {
    await requireAdmin();
    
    const { messageIds } = await request.json();
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json({ error: 'Message IDs are required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Convert string IDs to ObjectIds
    const objectIds = messageIds.map(id => new ObjectId(id));
    
    const result = await db.collection('community_messages').deleteMany({
      _id: { $in: objectIds }
    });

    return NextResponse.json({ 
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} messages deleted successfully`
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Bulk delete messages error:', error);
    return NextResponse.json(
      { error: 'Failed to delete messages' },
      { status: 500 }
    );
  }
}
