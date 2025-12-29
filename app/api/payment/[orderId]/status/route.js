import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getTransactionStatus } from '@/lib/midtrans';

export async function GET(request, { params }) {
  try {
    const { orderId } = await params;

    const db = await getDb();
    
    // Get payment from DB
    const payment = await db.collection('payments').findOne({
      order_id: orderId
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get latest status from Midtrans
    try {
      const midtransStatus = await getTransactionStatus(orderId);
      
      // Update DB if status changed
      if (midtransStatus.transaction_status !== payment.status) {
        await db.collection('payments').updateOne(
          { order_id: orderId },
          {
            $set: {
              status: midtransStatus.transaction_status,
              midtrans_response: midtransStatus,
              updatedAt: new Date(),
            },
          }
        );
      }

      return NextResponse.json({
        order_id: orderId,
        status: midtransStatus.transaction_status,
        transaction_id: midtransStatus.transaction_id,
        payment_type: midtransStatus.payment_type,
        amount: payment.amount,
      });
    } catch (midtransError) {
      // Return DB status if Midtrans API fails
      return NextResponse.json({
        order_id: orderId,
        status: payment.status,
        amount: payment.amount,
      });
    }
  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
