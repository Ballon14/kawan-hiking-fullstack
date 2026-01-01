import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const db = await getDb();
    
    // Get all registrations with trip details using aggregation
    const registrations = await db.collection('open_trip_registrations')
      .aggregate([
        {
          $lookup: {
            from: 'open_trips',
            localField: 'trip_id',
            foreignField: '_id',
            as: 'trip'
          }
        },
        {
          $unwind: {
            path: '$trip',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: { _id: -1 }
        }
      ])
      .toArray();
    
    // Format the response
    const formattedRegistrations = registrations.map(reg => ({
      ...reg,
      id: reg._id.toString(),
      trip_id: reg.trip_id?.toString(),
      nama_trip: reg.trip?.nama_trip || 'Unknown Trip',
      _id: undefined,
      trip: undefined
    }));
    
    return NextResponse.json(formattedRegistrations);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('List open trip registrations error:', err);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
