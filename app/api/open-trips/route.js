import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM open_trips ORDER BY id DESC'
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Open trips error:', err);
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
      nama_trip,
      tanggal_berangkat,
      durasi,
      kuota,
      harga_per_orang,
      fasilitas,
      itinerary,
      dokumentasi,
      dilaksanakan,
    } = await request.json();

    // Validate input
    if (!nama_trip || !tanggal_berangkat || !durasi || !kuota || !harga_per_orang) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Sanitize and validate
    const sanitizedNamaTrip = String(nama_trip).trim().substring(0, 255);
    const sanitizedDurasi = parseInt(durasi) || 0;
    const sanitizedKuota = parseInt(kuota) || 0;
    const sanitizedHarga = parseInt(harga_per_orang) || 0;

    if (sanitizedDurasi <= 0 || sanitizedKuota <= 0 || sanitizedHarga < 0) {
      return NextResponse.json(
        { error: 'Invalid numeric values' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO open_trips (nama_trip, tanggal_berangkat, durasi, kuota, harga_per_orang, fasilitas, itinerary, dokumentasi, dilaksanakan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        sanitizedNamaTrip,
        tanggal_berangkat,
        sanitizedDurasi,
        sanitizedKuota,
        sanitizedHarga,
        fasilitas ? JSON.stringify(fasilitas) : null,
        itinerary ? String(itinerary).trim().substring(0, 5000) : null,
        dokumentasi ? JSON.stringify(dokumentasi) : null,
        dilaksanakan || 0,
      ]
    );
    
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Create open trip error:', err);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
