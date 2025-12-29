'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFinishPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const statusCode = searchParams.get('status_code');
    const transactionStatus = searchParams.get('transaction_status');

    if (orderId) {
      checkPaymentStatus(orderId);
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  async function checkPaymentStatus(orderId) {
    try {
      const response = await fetch(`/api/payment/${orderId}/status`);
      const data = await response.json();

      setPaymentDetails(data);

      if (data.status === 'settlement' || data.status === 'capture') {
        setStatus('success');
      } else if (data.status === 'pending') {
        setStatus('pending');
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Check status error:', error);
      setStatus('error');
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Mengecek status pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Pembayaran Berhasil!</h1>
            <p className="text-slate-400 mb-6">
              Terima kasih, pembayaran Anda telah berhasil diproses.
            </p>
            {paymentDetails && (
              <div className="bg-slate-900 rounded-lg p-4 mb-6 text-left">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="text-white font-mono">{paymentDetails.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-white font-semibold">
                      Rp {paymentDetails.amount?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Pembayaran Pending</h1>
            <p className="text-slate-400 mb-6">
              Pembayaran Anda sedang diproses. Mohon tunggu konfirmasi.
            </p>
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Pembayaran Gagal</h1>
            <p className="text-slate-400 mb-6">
              Maaf, pembayaran Anda tidak berhasil. Silakan coba lagi.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="block w-full px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Coba Lagi
              </button>
              <Link
                href="/dashboard"
                className="block w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
