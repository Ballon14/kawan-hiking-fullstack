import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const notificationJson = await request.json();

    const apiClient = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const statusResponse = await apiClient.transaction.notification(notificationJson);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const orderIdMatch = orderId.match(/^OPEN-TRIP-(\d+)-/);
    if (!orderIdMatch) {
      return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
    }

    const registrationId = parseInt(orderIdMatch[1]);

    const [registrationRows] = await pool.query(
      'SELECT * FROM open_trip_registrations WHERE id = ?',
      [registrationId]
    );

    if (registrationRows.length === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    let paymentStatus = 'pending';
    let registrationStatus = 'pending';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'pending';
      } else if (fraudStatus === 'accept') {
        paymentStatus = 'paid';
        registrationStatus = 'confirmed';
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'paid';
      registrationStatus = 'confirmed';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending';
    } else if (['deny', 'expire', 'cancel'].includes(transactionStatus)) {
      paymentStatus = 'expired';
    }

    await pool.query(
      `UPDATE open_trip_registrations 
       SET payment_status = ?, status = ?, payment_reference = ?
       WHERE id = ?`,
      [paymentStatus, registrationStatus, orderId, registrationId]
    );

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
