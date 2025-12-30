'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PaymentFinishContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  
  const order_id = searchParams.get('order_id');
  const transaction_status = searchParams.get('transaction_status');

  useEffect(() => {
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      setStatus('success');
    } else if (transaction_status === 'pending') {
      setStatus('pending');
    } else {
      setStatus('failed');
    }
  }, [transaction_status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {status === 'success' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center animate-scale-in">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Pembayaran Berhasil!</h1>
            <p className="text-slate-400 mb-6">
              Terima kasih, pembayaran Anda telah berhasil diproses.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400 mb-1">Order ID</p>
              <p className="text-white font-mono">{order_id}</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/my-trip"
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                Lihat Trip Saya
              </Link>
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
              >
                Kembali ke Home
              </Link>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center animate-scale-in">
            <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Menunggu Pembayaran</h1>
            <p className="text-slate-400 mb-6">
              Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400 mb-1">Order ID</p>
              <p className="text-white font-mono">{order_id}</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/my-trip"
                className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
              >
                Cek Status
              </Link>
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
              >
                Kembali ke Home
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center animate-scale-in">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Pembayaran Gagal</h1>
            <p className="text-slate-400 mb-6">
              Maaf, terjadi kesalahan pada pembayaran Anda.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400 mb-1">Order ID</p>
              <p className="text-white font-mono">{order_id || 'N/A'}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Coba Lagi
              </button>
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
              >
                Kembali ke Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentFinishPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <PaymentFinishContent />
    </Suspense>
  );
}
