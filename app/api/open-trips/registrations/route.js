import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const [rows] = await pool.query(
      `SELECT r.*, t.nama_trip FROM open_trip_registrations r 
       JOIN open_trips t ON r.trip_id = t.id
       ORDER BY r.id DESC`
    );
    return NextResponse.json(rows);
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
