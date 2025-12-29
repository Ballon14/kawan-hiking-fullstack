import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const user = await requireAuth();
    const { id: tripId } = await params;
    const data = await request.json();

    const {
      nama_lengkap,
      email,
      nomor_hp,
      jumlah_peserta,
      catatan,
      alamat,
      kontak_darurat_nama,
      kontak_darurat_nomor,
      riwayat_penyakit,
      kondisi_fit,
    } = data;

    if (!tripId || !jumlah_peserta || jumlah_peserta < 1) {
      return NextResponse.json(
        { error: 'Trip ID and valid participants required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if trip exists
    const trip = await db.collection('open_trips').findOne({
      _id: new ObjectId(tripId)
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Check kuota
    const existingCount = await db.collection('open_trip_registrations')
      .countDocuments({ 
        trip_id: new ObjectId(tripId),
        payment_status: { $ne: 'failed' }
      });

    if (existingCount + parseInt(jumlah_peserta) > trip.kuota) {
      return NextResponse.json(
        { error: 'Kuota tidak mencukupi' },
        { status: 400 }
      );
    }

    // Create registration
    const result = await db.collection('open_trip_registrations').insertOne({
      trip_id: new ObjectId(tripId),
      user_id: user?.id ? new ObjectId(user.id) : null,
      username: user?.username || nama_lengkap,
      nama_lengkap: nama_lengkap || user?.username,
      email: email || user?.email,
      nomor_hp: nomor_hp || user?.nomor_hp,
      jumlah_peserta: parseInt(jumlah_peserta),
      catatan: catatan || null,
      alamat: alamat || user?.alamat || null,
      kontak_darurat_nama: kontak_darurat_nama || null,
      kontak_darurat_nomor: kontak_darurat_nomor || null,
      riwayat_penyakit: riwayat_penyakit || null,
      kondisi_fit: Boolean(kondisi_fit),
      status: 'pending',
      payment_status: 'pending',
      total_harga: trip.harga_per_orang * parseInt(jumlah_peserta),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      id: result.insertedId.toString(),
      message: 'Registration successful. Please proceed to payment.'
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Register open trip error:', error);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
