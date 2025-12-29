import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDb();
    const destinations = await db.collection('destinations')
      .find({})
      .sort({ _id: -1 })
      .toArray();
    
    // Convert _id to id for frontend compatibility
    const formattedDestinations = destinations.map(dest => ({
      ...dest,
      id: dest._id.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(formattedDestinations);
  } catch (error) {
    console.error('Destinations error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const {
      nama_destinasi,
      lokasi,
      ketinggian,
      kesulitan,
      durasi,
      deskripsi,
      jalur_pendakian,
      fasilitas,
      tips,
      gambar,
    } = await request.json();

    if (!nama_destinasi) {
      return NextResponse.json(
        { error: 'nama_destinasi required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('destinations').insertOne({
      nama_destinasi,
      lokasi: lokasi || null,
      ketinggian: ketinggian || null,
      kesulitan: kesulitan || null,
      durasi: durasi || null,
      deskripsi: deskripsi || null,
      jalur_pendakian: jalur_pendakian || null,
      fasilitas: fasilitas || null,
      tips: tips || null,
      gambar: gambar || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Create destination error:', error);
    return NextResponse.json(
      { error: 'Failed to create destination' },
      { status: 500 }
    );
  }
}
