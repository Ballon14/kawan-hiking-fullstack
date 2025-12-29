import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM private_trips ORDER BY id DESC'
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Private trips error:', err);
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
      destinasi,
      min_peserta,
      harga_paket,
      paket_pilihan,
      custom_form,
      estimasi_biaya,
      dokumentasi,
      dilaksanakan,
    } = await request.json();

    const [result] = await pool.query(
      'INSERT INTO private_trips (destinasi, min_peserta, harga_paket, paket_pilihan, custom_form, estimasi_biaya, dokumentasi, dilaksanakan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        destinasi,
        min_peserta,
        harga_paket,
        JSON.stringify(paket_pilihan),
        JSON.stringify(custom_form),
        estimasi_biaya || null,
        JSON.stringify(dokumentasi),
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
    console.error('Private trips error:', err);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
