import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    const [rows] = await pool.query(
      `SELECT 
        r.*, 
        t.nama_trip,
        t.tanggal_berangkat,
        t.durasi,
        t.harga_per_orang,
        t.dilaksanakan,
        t.fasilitas,
        t.itinerary,
        t.dokumentasi
       FROM open_trip_registrations r 
       JOIN open_trips t ON r.trip_id = t.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [user.id]
    );
    return NextResponse.json(rows);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get user open trip registrations error:', err);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
