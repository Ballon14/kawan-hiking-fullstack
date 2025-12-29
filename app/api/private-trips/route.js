import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const trips = await db.collection('private_trips')
      .find({})
      .sort({ _id: -1 })
      .toArray();
    
    const formattedTrips = trips.map(trip => ({
      ...trip,
      id: trip._id.toString(),
      id_destinasi: trip.id_destinasi?.toString(),
      id_user: trip.id_user?.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(formattedTrips);
  } catch (error) {
    console.error('Private trips error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const db = await getDb();
    
    // Convert ObjectIds if present
    if (data.id_user) {
      data.id_user = new ObjectId(data.id_user);
    }
    if (data.id_destinasi) {
      data.id_destinasi = new ObjectId(data.id_destinasi);
    }

    const result = await db.collection('private_trips').insertOne({
      ...data,
      dilaksanakan: data.dilaksanakan || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      id: result.insertedId.toString() 
    }, { status: 201 });
  } catch (error) {
    console.error('Create private trip error:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
