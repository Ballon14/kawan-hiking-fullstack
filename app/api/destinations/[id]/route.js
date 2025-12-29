import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT * FROM destinations WHERE id=?',
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Destinations error:', err);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
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

    // Check if destination exists
    const [existingRows] = await pool.query(
      'SELECT * FROM destinations WHERE id=?',
      [id]
    );
    if (existingRows.length === 0) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    const existing = existingRows[0];

    const [result] = await pool.query(
      'UPDATE destinations SET nama_destinasi=?, lokasi=?, ketinggian=?, kesulitan=?, durasi=?, deskripsi=?, jalur_pendakian=?, fasilitas=?, tips=?, gambar=? WHERE id=?',
      [
        nama_destinasi !== undefined ? nama_destinasi : existing.nama_destinasi,
        lokasi !== undefined ? lokasi : existing.lokasi,
        ketinggian !== undefined ? ketinggian : existing.ketinggian,
        kesulitan !== undefined ? kesulitan : existing.kesulitan,
        durasi !== undefined ? durasi : existing.durasi,
        deskripsi !== undefined ? deskripsi : existing.deskripsi,
        jalur_pendakian !== undefined ? JSON.stringify(jalur_pendakian) : existing.jalur_pendakian,
        fasilitas !== undefined ? JSON.stringify(fasilitas) : existing.fasilitas,
        tips !== undefined ? JSON.stringify(tips) : existing.tips,
        gambar !== undefined ? gambar : existing.gambar,
        id,
      ]
    );
    
    return NextResponse.json({ affectedRows: result.affectedRows });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Destinations error:', err);
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
      'DELETE FROM destinations WHERE id=?',
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
    console.error('Destinations error:', err);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
