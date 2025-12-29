import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export async function POST(request, { params }) {
  try {
    const user = await requireAuth();
    const { registrationId } = await params;

    // Get registration data
    const [registrationRows] = await pool.query(
      `SELECT r.*, t.nama_trip, t.harga_per_orang 
       FROM open_trip_registrations r
       JOIN open_trips t ON r.trip_id = t.id
       WHERE r.id = ? AND r.user_id = ?`,
      [registrationId, user.id]
    );

    if (registrationRows.length === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const registration = registrationRows[0];

    if (registration.payment_status === 'paid') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
      return NextResponse.json({
        error: 'Payment gateway not configured. Please contact administrator.'
      }, { status: 500 });
    }

    const totalAmount = parseInt(registration.harga_per_orang) * parseInt(registration.jumlah_peserta);

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    const parameter = {
      transaction_details: {
        order_id: `OPEN-TRIP-${registrationId}-${Date.now()}`,
        gross_amount: totalAmount,
      },
      item_details: [{
        id: `TRIP-${registration.trip_id}`,
        price: totalAmount,
        quantity: 1,
        name: `Open Trip: ${registration.nama_trip} (${registration.jumlah_peserta} peserta)`,
      }],
      customer_details: {
        first_name: registration.nama_lengkap,
        email: registration.email,
        phone: registration.nomor_hp,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/open-trip/${registration.trip_id}/pembayaran?status=success`,
        unfinish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/open-trip/${registration.trip_id}/pembayaran?status=pending`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/open-trip/${registration.trip_id}/pembayaran?status=error`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    if (!transaction || !transaction.token) {
      return NextResponse.json({
        error: 'Failed to create payment transaction. No token received.'
      }, { status: 500 });
    }

    const orderId = parameter.transaction_details.order_id;
    await pool.query(
      `UPDATE open_trip_registrations 
       SET payment_reference = ?, payment_deadline = DATE_ADD(NOW(), INTERVAL 24 HOUR)
       WHERE id = ?`,
      [orderId, registrationId]
    );

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
    });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create payment error:', err);
    return NextResponse.json({
      error: 'Failed to create payment transaction'
    }, { status: 500 });
  }
}
