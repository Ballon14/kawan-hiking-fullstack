import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await requireAuth();
    const { 
      destinasi_id, 
      guide_id, 
      tanggal_keberangkatan, 
      tanggal_mulai,
      tanggal_selesai,
      jumlah_peserta, 
      catatan, 
      budget,
      nama_kontak,
      nomor_hp,
      email
    } = await request.json();

    if (!destinasi_id || !jumlah_peserta) {
      return NextResponse.json(
        { error: 'destinasi_id dan jumlah_peserta wajib diisi' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Get destination details
    let destinasiName = `Destinasi ID ${destinasi_id}`;
    try {
      const destination = await db.collection('destinations').findOne({
        _id: new ObjectId(destinasi_id)
      });
      if (destination) {
        destinasiName = destination.nama_destinasi;
      }
    } catch (e) {
      console.warn('Could not fetch destination name:', e);
    }

    // Get guide name if provided
    let guideName = null;
    if (guide_id) {
      try {
        const guide = await db.collection('guides').findOne({
          _id: new ObjectId(guide_id)
        });
        if (guide) {
          guideName = guide.nama;
        }
      } catch (e) {
        console.warn('Could not fetch guide name:', e);
      }
    }

    // Create trip document with consistent field structure
    const tripData = {
      id_user: new ObjectId(user.id),
      id_destinasi: new ObjectId(destinasi_id),
      destinasi: destinasiName,
      tanggal_mulai: tanggal_mulai ? new Date(tanggal_mulai) : (tanggal_keberangkatan ? new Date(tanggal_keberangkatan) : null),
      tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null,
      jumlah_peserta: parseInt(jumlah_peserta) || 1,
      budget: budget ? parseFloat(budget) : null,
      catatan: catatan || null,
      nama_kontak: nama_kontak || user.username,
      nomor_hp: nomor_hp || null,
      email: email || user.email || null,
      status: 'pending',
      min_peserta: parseInt(jumlah_peserta) || 1,
      harga_paket: null,
      estimasi_biaya: null,
      dilaksanakan: false,
      // Keep custom_form for backward compatibility
      custom_form: {
        username: user.username,
        guide_id: guide_id || null,
        guide_name: guideName,
        tanggal_keberangkatan: tanggal_keberangkatan || tanggal_mulai,
        jumlah_peserta: parseInt(jumlah_peserta),
        catatan: catatan || null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('private_trips').insertOne(tripData);

    return NextResponse.json({
      id: result.insertedId.toString(),
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

