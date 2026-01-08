import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    const db = await getDb();
    
    // Query by user id (ObjectId) or username in custom_form for backward compatibility
    const trips = await db.collection('private_trips')
      .find({
        $or: [
          { id_user: new ObjectId(user.id) },
          { 'custom_form.username': user.username }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Format response
    const formattedTrips = trips.map(trip => ({
      ...trip,
      id: trip._id.toString(),
      id_destinasi: trip.id_destinasi?.toString(),
      id_user: trip.id_user?.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(formattedTrips);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get my private trips error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user trips' },
      { status: 500 }
    );
  }
}
