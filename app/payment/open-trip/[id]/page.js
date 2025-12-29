'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api-client';
import PaymentButton from '@/components/PaymentButton';
import Link from 'next/link';

export default function OpenTripPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTrip();
    }
  }, [params.id]);

  async function fetchTrip() {
    try {
      const data = await apiGet(`/api/open-trips/${params.id}`);
      setTrip(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Trip tidak ditemukan</h1>
          <Link href="/open-trip" className="text-emerald-400 hover:underline">
            Kembali ke Open Trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-3xl font-bold text-white mb-2">Pembayaran Open Trip</h1>
          <p className="text-slate-400">Selesaikan pembayaran untuk mengonfirmasi pendaftaran Anda</p>
        </div>

        {/* Trip Summary */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Detail Trip</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Nama Trip:</span>
              <span className="text-white font-semibold">{trip.nama_trip}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Tanggal:</span>
              <span className="text-white">
                {new Date(trip.tanggal_berangkat).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Durasi:</span>
              <span className="text-white">{trip.durasi} Hari</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Jumlah Peserta:</span>
              <span className="text-white">1 Orang</span>
            </div>
            
            <div className="border-t border-slate-700 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total Pembayaran:</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatPrice(trip.harga_per_orang)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Metode Pembayaran</h2>
          <p className="text-slate-400 text-sm mb-6">
            Anda akan diarahkan ke halaman pembayaran Midtrans yang aman untuk menyelesaikan transaksi.
          </p>
          
          <PaymentButton
            tripType="open_trip"
            tripId={trip.id}
            participants={1}
            buttonText="Bayar Sekarang"
            buttonClass="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg"
            onSuccess={(result) => {
              router.push(`/payment/finish?order_id=${result.order_id}`);
            }}
            onPending={(result) => {
              router.push(`/payment/finish?order_id=${result.order_id}`);
            }}
            onError={(result) => {
              alert('Pembayaran gagal. Silakan coba lagi.');
            }}
          />
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="text-sm text-blue-300">
              <p className="font-semibold mb-1">Informasi Pembayaran:</p>
              <ul className="space-y-1 text-blue-200">
                <li>• Pembayaran aman melalui Midtrans</li>
                <li>• Mendukung berbagai metode pembayaran</li>
                <li>• Konfirmasi otomatis setelah pembayaran berhasil</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cancel Link */}
        <div className="text-center mt-6">
          <Link 
            href={`/open-trip/${trip.id}`}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Kembali ke Detail Trip
          </Link>
        </div>
      </div>
    </div>
  );
}
