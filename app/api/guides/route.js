import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDb();
    const guides = await db.collection('guides')
      .find({})
      .sort({ _id: -1 })
      .toArray();
    
    const formattedGuides = guides.map(guide => ({
      ...guide,
      id: guide._id.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(formattedGuides);
  } catch (error) {
    console.error('Guides error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const data = await request.json();

    if (!data.nama) {
      return NextResponse.json(
        { error: 'nama required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('guides').insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ 
      id: result.insertedId.toString() 
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Create guide error:', error);
    return NextResponse.json(
      { error: 'Failed to create guide' },
      { status: 500 }
    );
  }
}
