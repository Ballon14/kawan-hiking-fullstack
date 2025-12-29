import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT * FROM guides WHERE id=?',
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Guides error:', err);
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
      nama,
      bio,
      pengalaman,
      sertifikasi,
      foto,
      spesialisasi,
    } = await request.json();

    const [existingRows] = await pool.query(
      'SELECT * FROM guides WHERE id=?',
      [id]
    );
    if (existingRows.length === 0) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }

    const existing = existingRows[0];

    const [result] = await pool.query(
      'UPDATE guides SET nama=?, bio=?, pengalaman=?, sertifikasi=?, foto=?, spesialisasi=? WHERE id=?',
      [
        nama !== undefined ? nama : existing.nama,
        bio !== undefined ? bio : existing.bio,
        pengalaman !== undefined ? pengalaman : existing.pengalaman,
        sertifikasi !== undefined ? JSON.stringify(sertifikasi) : existing.sertifikasi,
        foto !== undefined ? foto : existing.foto,
        spesialisasi !== undefined ? JSON.stringify(spesialisasi) : existing.spesialisasi,
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
    console.error('Guides error:', err);
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
      'DELETE FROM guides WHERE id=?',
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
    console.error('Guides error:', err);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
