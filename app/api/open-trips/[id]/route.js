import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    
    const trip = await db.collection('open_trips').findOne({
      _id: new ObjectId(id)
    });
    
    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...trip,
      id: trip._id.toString(),
      id_destinasi: trip.id_destinasi?.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Open trips error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();

    const db = await getDb();
    
    // Convert id_destinasi to ObjectId if present
    if (data.id_destinasi) {
      data.id_destinasi = new ObjectId(data.id_destinasi);
    }
    
    const updateFields = { ...data };
    delete updateFields.id;
    delete updateFields._id;
    updateFields.updatedAt = new Date();

    const result = await db.collection('open_trips').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ affectedRows: result.modifiedCount });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Open trips error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    
    const db = await getDb();
    const result = await db.collection('open_trips').deleteOne({
      _id: new ObjectId(id)
    });
    
    return NextResponse.json({ affectedRows: result.deletedCount });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Open trips error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
