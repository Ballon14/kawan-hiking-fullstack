import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin, requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query('SELECT * FROM open_trips WHERE id=?', [id]);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Get open trip error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const {
      nama_trip,
      tanggal_berangkat,
      durasi,
      kuota,
      harga_per_orang,
      fasilitas,
      itinerary,
      dokumentasi,
      status,
      dilaksanakan,
    } = await request.json();

    // Get old trip data
    const [oldTripRows] = await pool.query(
      'SELECT * FROM open_trips WHERE id=?',
      [id]
    );
    const oldStatus = oldTripRows[0]?.status;
    const oldDilaksanakan = oldTripRows[0]?.dilaksanakan || 0;
    const newDilaksanakan = dilaksanakan !== undefined ? dilaksanakan : oldDilaksanakan;

    const [result] = await pool.query(
      'UPDATE open_trips SET nama_trip=?, tanggal_berangkat=?, durasi=?, kuota=?, harga_per_orang=?, fasilitas=?, itinerary=?, dokumentasi=?, status=?, dilaksanakan=? WHERE id=?',
      [
        nama_trip,
        tanggal_berangkat,
        durasi,
        kuota,
        harga_per_orang,
        JSON.stringify(fasilitas),
        itinerary,
        JSON.stringify(dokumentasi),
        status || oldStatus,
        newDilaksanakan,
        id,
      ]
    );

    // If trip was just marked as completed
    if (newDilaksanakan === 1 && oldDilaksanakan === 0) {
      await pool.query(
        'INSERT INTO history (username, role, action, trip_type, trip_id, request_body) VALUES (?, ?, ?, ?, ?, ?)',
        [
          user.username,
          user.role,
          'complete',
          'open_trip',
          id,
          JSON.stringify({ nama_trip, tanggal_berangkat, durasi, kuota, harga_per_orang }),
        ]
      );
    }
    
    return NextResponse.json({ affectedRows: result.affectedRows });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Open trips error:', err);
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
    
    const [result] = await pool.query(
      'DELETE FROM open_trips WHERE id=?',
      [id]
    );
    
    return NextResponse.json({ affectedRows: result.affectedRows });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Open trips error:', err);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
