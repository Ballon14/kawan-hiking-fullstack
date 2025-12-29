import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT * FROM private_trips WHERE id=?',
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Private trips error:', err);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const {
      destinasi,
      min_peserta,
      harga_paket,
      paket_pilihan,
      custom_form,
      estimasi_biaya,
      dokumentasi,
      status,
      dilaksanakan,
    } = await request.json();

    const [oldTripRows] = await pool.query('SELECT * FROM private_trips WHERE id=?', [id]);
    const oldStatus = oldTripRows[0]?.status;
    const oldDilaksanakan = oldTripRows[0]?.dilaksanakan || 0;
    const newDilaksanakan = dilaksanakan !== undefined ? dilaksanakan : oldDilaksanakan;

    const [result] = await pool.query(
      'UPDATE private_trips SET destinasi=?, min_peserta=?, harga_paket=?, paket_pilihan=?, custom_form=?, estimasi_biaya=?, dokumentasi=?, status=?, dilaksanakan=? WHERE id=?',
      [
        destinasi,
        min_peserta,
        harga_paket,
        JSON.stringify(paket_pilihan),
        JSON.stringify(custom_form),
        estimasi_biaya || null,
        JSON.stringify(dokumentasi),
        status || oldStatus,
        newDilaksanakan,
        id,
      ]
    );

    if (newDilaksanakan === 1 && oldDilaksanakan === 0) {
      await pool.query(
        'INSERT INTO history (username, role, action, trip_type, trip_id, request_body) VALUES (?, ?, ?, ?, ?, ?)',
        [user.username, user.role, 'complete', 'private_trip', id, JSON.stringify({ destinasi, min_peserta })]
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
    console.error('Private trips error:', err);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Build dynamic update query for partial updates
    const updates = [];
    const values = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    if (data.dilaksanakan !== undefined) {
      updates.push('dilaksanakan = ?');
      values.push(data.dilaksanakan);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.push('updated_at = NOW()');
    values.push(id);

    const [result] = await pool.query(
      `UPDATE private_trips SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Return updated trip data
    const [rows] = await pool.query(
      'SELECT * FROM private_trips WHERE id = ?',
      [id]
    );

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('PATCH private trip error:', err);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const [result] = await pool.query('DELETE FROM private_trips WHERE id=?', [id]);
    return NextResponse.json({ affectedRows: result.affectedRows });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Private trips error:', err);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
