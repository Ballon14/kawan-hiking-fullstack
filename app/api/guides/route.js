import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM guides ORDER BY id DESC'
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Guides error:', err);
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
      nama,
      bio,
      pengalaman,
      sertifikasi,
      foto,
      spesialisasi,
    } = await request.json();

    if (!nama) {
      return NextResponse.json(
        { error: 'nama required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO guides (nama, bio, pengalaman, sertifikasi, foto, spesialisasi) VALUES (?, ?, ?, ?, ?, ?)',
      [
        nama,
        bio || null,
        pengalaman || null,
        sertifikasi ? JSON.stringify(sertifikasi) : null,
        foto || null,
        spesialisasi ? JSON.stringify(spesialisasi) : null,
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
    console.error('Create guide error:', err);
    return NextResponse.json(
      { error: 'Failed to create guide' },
      { status: 500 }
    );
  }
}
