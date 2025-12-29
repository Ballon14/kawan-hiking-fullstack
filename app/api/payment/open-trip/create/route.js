import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createTransaction, generateOrderId } from '@/lib/midtrans';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await requireAuth();
    const { tripId, participants } = await request.json();

    if (!tripId || !participants || participants < 1) {
      return NextResponse.json(
        { error: 'Trip ID and valid participants required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get trip details
    const trip = await db.collection('open_trips').findOne({
      _id: new ObjectId(tripId)
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Check kuota
    const existingRegistrations = await db.collection('open_trip_registrations')
      .countDocuments({ trip_id: new ObjectId(tripId), payment_status: 'settlement' });

    if (existingRegistrations + participants > trip.kuota) {
      return NextResponse.json(
        { error: 'Kuota tidak mencukupi' },
        { status: 400 }
      );
    }

    // Calculate amount
    const totalAmount = trip.harga_per_orang * participants;

    // Generate order ID
    const orderId = generateOrderId('open_trip');

    // Create payment record
    const paymentResult = await db.collection('payments').insertOne({
      order_id: orderId,
      user_id: new ObjectId(user.id),
      payment_type: 'open_trip',
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
        first_name: user.username,
        email: user.email || `${user.username}@kawanhiking.com`,
        phone: user.nomor_hp || '08123456789',
      },
      itemDetails: [
        {
          id: tripId,
          price: trip.harga_per_orang,
          quantity: participants,
          name: trip.nama_trip,
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
    console.error('Create open trip payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
