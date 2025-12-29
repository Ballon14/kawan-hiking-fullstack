import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Verify Midtrans signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = body;

    // Generate signature for verification
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    // Verify signature
    if (hash !== signature_key) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const db = await getDb();

    // Determine payment status
    let paymentStatus = 'pending';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || fraud_status === undefined) {
        paymentStatus = 'settlement';
      }
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'expire' ||
      transaction_status === 'cancel'
    ) {
      paymentStatus = 'failed';
    }

    // Update payment record
    const payment = await db.collection('payments').findOne({ order_id });

    if (!payment) {
      console.error('Payment not found:', order_id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    await db.collection('payments').updateOne(
      { order_id },
      {
        $set: {
          status: paymentStatus,
          transaction_id,
          payment_method: payment_type,
          midtrans_response: body,
          updatedAt: new Date(),
        },
      }
    );

    // If payment successful, update trip status
    if (paymentStatus === 'settlement') {
      if (payment.payment_type === 'open_trip') {
        // Create registration record
        await db.collection('open_trip_registrations').insertOne({
          trip_id: payment.trip_id,
          user_id: payment.user_id,
          payment_id: payment._id,
          jumlah_peserta: payment.participants,
          total_harga: payment.amount,
          payment_status: 'settlement',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (payment.payment_type === 'private_trip') {
        // Update private trip payment status
        await db.collection('private_trips').updateOne(
          { _id: payment.trip_id },
          {
            $set: {
              'custom_form.payment_status': 'paid',
              'custom_form.payment_id': payment._id,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
