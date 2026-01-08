import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

// GET single registration
export async function GET(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = await getDb();
    
    const registration = await db.collection('open_trip_registrations').findOne({
      _id: new ObjectId(id)
    });
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    // Get trip details
    let trip = null;
    if (registration.trip_id) {
      trip = await db.collection('open_trips').findOne({
        _id: new ObjectId(registration.trip_id)
      });
    }
    
    return NextResponse.json({
      ...registration,
      id: registration._id.toString(),
      trip_id: registration.trip_id?.toString(),
      nama_trip: trip?.nama_trip || 'Unknown Trip',
      _id: undefined
    });
  } catch (err) {
    if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error('Get registration error:', err);
    return NextResponse.json({ error: 'Failed to get registration' }, { status: 500 });
  }
}

// PATCH update registration status
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const db = await getDb();
    
    const { status, payment_status, admin_notes } = body;
    
    const updateData = {
      updated_at: new Date()
    };
    
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    
    const result = await db.collection('open_trip_registrations').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Registration updated successfully' });
  } catch (err) {
    if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error('Update registration error:', err);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}

// DELETE registration
export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = await getDb();
    
    const result = await db.collection('open_trip_registrations').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Registration deleted successfully' });
  } catch (err) {
    if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error('Delete registration error:', err);
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
  }
}
