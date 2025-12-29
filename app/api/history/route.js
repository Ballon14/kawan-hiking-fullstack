import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();
    const db = await getDb();
    
    const history = await db.collection('history')
      .find({})
      .sort({ _id: -1 })
      .limit(100)
      .toArray();
    
    const formattedHistory = history.map(item => ({
      ...item,
      id: item._id.toString(),
      trip_id: item.trip_id?.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(formattedHistory);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('History error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
