import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    
    const destination = await db.collection('destinations').findOne({
      _id: new ObjectId(id)
    });
    
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...destination,
      id: destination._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Destinations error:', error);
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
    
    // Build update object
    const updateFields = {};
    const allowedFields = [
      'nama_destinasi', 'lokasi', 'ketinggian', 'kesulitan', 
      'durasi', 'deskripsi', 'jalur_pendakian', 'fasilitas', 'tips', 'gambar'
    ];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateFields[field] = data[field];
      }
    });
    
    updateFields.updatedAt = new Date();

    const result = await db.collection('destinations').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Destination not found' },
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
    console.error('Destinations error:', error);
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
    const result = await db.collection('destinations').deleteOne({
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
    console.error('Destinations error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
