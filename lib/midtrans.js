import midtransClient from 'midtrans-client';

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Create Midtrans Snap transaction
 * @param {Object} params - Transaction parameters
 * @param {string} params.orderId - Unique order ID
 * @param {number} params.amount - Transaction amount
 * @param {Object} params.customerDetails - Customer information
 * @param {Array} params.itemDetails - Items being purchased
 * @returns {Promise<Object>} Snap token and redirect URL
 */
export async function createTransaction(params) {
  const { orderId, amount, customerDetails, itemDetails } = params;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: customerDetails,
    item_details: itemDetails,
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/finish`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    console.error('Midtrans create transaction error:', error);
    throw error;
  }
}

/**
 * Get transaction status from Midtrans
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Transaction status
 */
export async function getTransactionStatus(orderId) {
  try {
    const status = await snap.transaction.status(orderId);
    return status;
  } catch (error) {
    console.error('Midtrans get status error:', error);
    throw error;
  }
}

/**
 * Generate unique order ID
 * @param {string} type - Payment type (open_trip / private_trip)
 * @returns {string} Unique order ID
 */
export function generateOrderId(type) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${type.toUpperCase()}-${timestamp}-${random}`;
}

export default snap;
