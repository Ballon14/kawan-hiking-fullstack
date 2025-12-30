import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    const db = await getDb();

    // Get user's registrations
    const registrations = await db.collection('open_trip_registrations')
      .find({ user_id: new ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    // Get trip details for each registration
    const registrationsWithTrips = await Promise.all(
      registrations.map(async (reg) => {
        const trip = await db.collection('open_trips').findOne({
          _id: reg.trip_id
        });

        return {
          id: reg._id.toString(),
          trip_id: reg.trip_id.toString(),
          trip_name: trip?.nama_trip || 'Open Trip',
          jumlah_peserta: reg.jumlah_peserta,
          total_harga: reg.total_harga,
          payment_status: reg.payment_status,
          status: reg.status,
          createdAt: reg.createdAt,
          updatedAt: reg.updatedAt,
        };
      })
    );

    return NextResponse.json(registrationsWithTrips);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get user open trip registrations error:', error);
    return NextResponse.json(
      { error: 'Failed to get registrations' },
      { status: 500 }
    );
  }
}
