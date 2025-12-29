import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const user = await requireAuth();
    const { id: tripId } = await params;
    const {
      nama_lengkap,
      email,
      nomor_hp,
      jumlah_peserta,
      catatan,
      alamat,
      kontak_darurat_nama,
      kontak_darurat_nomor,
      riwayat_penyakit,
      kondisi_fit,
    } = await request.json();

    if (!tripId || !nama_lengkap || !email || !nomor_hp || !jumlah_peserta) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const [tripRows] = await pool.query(
      'SELECT id, nama_trip FROM open_trips WHERE id=?',
      [tripId]
    );
    if (tripRows.length === 0) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO open_trip_registrations 
        (trip_id, user_id, username, nama_lengkap, email, nomor_hp, jumlah_peserta, catatan, alamat, kontak_darurat_nama, kontak_darurat_nomor, riwayat_penyakit, kondisi_fit, status, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        tripId,
        user?.id || null,
        user?.username || null,
        String(nama_lengkap).trim().substring(0, 255),
        String(email).trim().substring(0, 255),
        String(nomor_hp).trim().substring(0, 30),
        parseInt(jumlah_peserta) || 1,
        catatan ? String(catatan).trim() : null,
        alamat ? String(alamat).trim() : null,
        kontak_darurat_nama ? String(kontak_darurat_nama).trim() : null,
        kontak_darurat_nomor ? String(kontak_darurat_nomor).trim() : null,
        riwayat_penyakit ? String(riwayat_penyakit).trim() : null,
        kondisi_fit ? 1 : 0,
      ]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Register open trip error:', err);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
