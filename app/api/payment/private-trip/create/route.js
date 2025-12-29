import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createTransaction, generateOrderId } from '@/lib/midtrans';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await requireAuth();
    const { tripId } = await request.json();

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get trip details
    const trip = await db.collection('private_trips').findOne({
      _id: new ObjectId(tripId)
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Check if user owns this trip or is admin
    if (trip.id_user?.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if trip is approved
    if (trip.custom_form?.status !== 'aktif') {
      return NextResponse.json(
        { error: 'Trip belum disetujui admin' },
        { status: 400 }
      );
    }

    // Calculate amount
    const participants = trip.custom_form?.jumlah_peserta || trip.min_peserta;
    const totalAmount = trip.harga_paket * participants;

    // Generate order ID
    const orderId = generateOrderId('private_trip');

    // Create payment record
    const paymentResult = await db.collection('payments').insertOne({
      order_id: orderId,
      user_id: new ObjectId(user.id),
      payment_type: 'private_trip',
      trip_id: new ObjectId(tripId),
      amount: totalAmount,
      status: 'pending',
      participants,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create Midtrans transaction
    const snapTransaction = await createTransaction({
      orderId,
      amount: totalAmount,
      customerDetails: {
        first_name: trip.custom_form?.username || user.username,
        email: user.email || `${user.username}@kawanhiking.com`,
        phone: user.nomor_hp || '08123456789',
      },
      itemDetails: [
        {
          id: tripId,
          price: trip.harga_paket,
          quantity: participants,
          name: `Private Trip - ${trip.destinasi}`,
        },
      ],
    });

    // Update payment with snap token
    await db.collection('payments').updateOne(
      { _id: paymentResult.insertedId },
      {
        $set: {
          snap_token: snapTransaction.token,
          snap_redirect_url: snapTransaction.redirect_url,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      order_id: orderId,
      snap_token: snapTransaction.token,
      redirect_url: snapTransaction.redirect_url,
      amount: totalAmount,
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create private trip payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
