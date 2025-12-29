import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDb();
    const trips = await db.collection('open_trips')
      .find({})
      .sort({ _id: -1 })
      .toArray();
    
    const formattedTrips = trips.map(trip => ({
      ...trip,
      id: trip._id.toString(),
      id_destinasi: trip.id_destinasi?.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(formattedTrips);
  } catch (error) {
    console.error('Open trips error:', error);
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

    const db = await getDb();
    
    // Convert id_destinasi to ObjectId if present
    if (data.id_destinasi) {
      data.id_destinasi = new ObjectId(data.id_destinasi);
    }

    const result = await db.collection('open_trips').insertOne({
      ...data,
      dilaksanakan: data.dilaksanakan || false,
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
    console.error('Create open trip error:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
