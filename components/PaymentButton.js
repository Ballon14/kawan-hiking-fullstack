'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api-client';

export default function PaymentButton({ 
  tripType, 
  tripId, 
  participants = 1,
  buttonText = 'Bayar Sekarang',
  buttonClass = 'px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors',
  onSuccess,
  onPending,
  onError 
}) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    if (loading) return;

    setLoading(true);

    try {
      // Create payment transaction
      const endpoint = tripType === 'open_trip' 
        ? '/api/payment/open-trip/create'
        : '/api/payment/private-trip/create';

      const data = await apiPost(endpoint, {
        tripId,
        participants,
      });

      // Open Midtrans Snap popup
      if (window.snap) {
        window.snap.pay(data.snap_token, {
          onSuccess: function (result) {
            console.log('Payment success:', result);
            if (onSuccess) onSuccess(result);
          },
          onPending: function (result) {
            console.log('Payment pending:', result);
            if (onPending) onPending(result);
          },
          onError: function (result) {
            console.log('Payment error:', result);
            if (onError) onError(result);
          },
          onClose: function () {
            console.log('Payment popup closed');
            setLoading(false);
          },
        });
      } else {
        throw new Error('Midtrans Snap not loaded');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Gagal membuat pembayaran');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`${buttonClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Memproses...
        </span>
      ) : (
        buttonText
      )}
    </button>
  );
}
