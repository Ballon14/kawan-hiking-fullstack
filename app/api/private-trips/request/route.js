import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await requireAuth();
    const { destinasi_id, guide_id, tanggal_keberangkatan, jumlah_peserta, catatan, username } = await request.json();

    if (!destinasi_id || !tanggal_keberangkatan || !jumlah_peserta) {
      return NextResponse.json(
        { error: 'destinasi_id, tanggal_keberangkatan, dan jumlah_peserta wajib diisi' },
        { status: 400 }
      );
    }

    // Get destination name
    const [destRows] = await pool.query('SELECT nama_destinasi FROM destinations WHERE id = ?', [destinasi_id]);
    const destinasiName = destRows[0]?.nama_destinasi || `Destinasi ID ${destinasi_id}`;

    // Get guide name if provided
    let guideName = null;
    if (guide_id) {
      const [guideRows] = await pool.query('SELECT nama FROM guides WHERE id = ?', [guide_id]);
      guideName = guideRows[0]?.nama || null;
    }

    const requestData = {
      destinasi: destinasiName,
      min_peserta: parseInt(jumlah_peserta) || 1,
      harga_paket: 0,
      paket_pilihan: JSON.stringify([]),
      custom_form: JSON.stringify({
        username: username || user.username,
        guide_id: guide_id || null,
        guide_name: guideName,
        tanggal_keberangkatan: tanggal_keberangkatan,
        jumlah_peserta: parseInt(jumlah_peserta),
        catatan: catatan || null,
        status: 'pending'
      }),
      estimasi_biaya: null,
      dokumentasi: JSON.stringify([]),
      dilaksanakan: 0
    };

    const [result] = await pool.query(
      'INSERT INTO private_trips (destinasi, min_peserta, harga_paket, paket_pilihan, custom_form, estimasi_biaya, dokumentasi, dilaksanakan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        requestData.destinasi,
        requestData.min_peserta,
        requestData.harga_paket,
        requestData.paket_pilihan,
        requestData.custom_form,
        requestData.estimasi_biaya,
        requestData.dokumentasi,
        requestData.dilaksanakan
      ]
    );

    return NextResponse.json({
      id: result.insertId,
      message: 'Permintaan trip berhasil dikirim. Admin akan menghubungi Anda segera.'
    }, { status: 201 });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create private trip request error:', err);
    return NextResponse.json(
      { error: 'Gagal mengirim permintaan trip' },
      { status: 500 }
    );
  }
}
