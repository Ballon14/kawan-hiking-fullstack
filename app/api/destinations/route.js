import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM destinations ORDER BY id DESC'
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Destinations error:', err);
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

    const [result] = await pool.query(
      'INSERT INTO destinations (nama_destinasi, lokasi, ketinggian, kesulitan, durasi, deskripsi, jalur_pendakian, fasilitas, tips, gambar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        nama_destinasi,
        lokasi || null,
        ketinggian || null,
        kesulitan || null,
        durasi || null,
        deskripsi || null,
        jalur_pendakian ? JSON.stringify(jalur_pendakian) : null,
        fasilitas ? JSON.stringify(fasilitas) : null,
        tips ? JSON.stringify(tips) : null,
        gambar || null,
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
    console.error('Create destination error:', err);
    return NextResponse.json(
      { error: 'Failed to create destination' },
      { status: 500 }
    );
  }
}
