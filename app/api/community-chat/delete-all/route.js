import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';

export async function POST() {
  try {
    await requireAdmin();
    
    const db = await getDb();
    
    const result = await db.collection('community_messages').deleteMany({});

    return NextResponse.json({ 
      deletedCount: result.deletedCount,
      message: `All ${result.deletedCount} messages deleted successfully`
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Delete all messages error:', error);
    return NextResponse.json(
      { error: 'Failed to delete all messages' },
      { status: 500 }
    );
  }
}
