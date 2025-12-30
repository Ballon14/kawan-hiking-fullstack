'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api-client';
import Link from 'next/link';

export default function MyTripsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open'); // 'open' or 'private'

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTrips();
  }, [user]);

  async function fetchTrips() {
    try {
      // Fetch open trip registrations
      const openTrips = await apiGet('/api/open-trips/my/registrations');
      // Fetch private trips
      const privateTrips = await apiGet('/api/private-trips');
      
      setTrips({
        open: openTrips || [],
        private: privateTrips.filter(t => t.id_user === user?.id) || []
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    const statusConfig = {
      pending: { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40', label: 'Pending' },
      settlement: { color: 'bg-green-600/20 text-green-400 border-green-600/40', label: 'Terbayar' },
      aktif: { color: 'bg-green-600/20 text-green-400 border-green-600/40', label: 'Aktif' },
      selesai: { color: 'bg-blue-600/20 text-blue-400 border-blue-600/40', label: 'Selesai' },
      ditolak: { color: 'bg-red-600/20 text-red-400 border-red-600/40', label: 'Ditolak' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trip Saya</h1>
          <p className="text-slate-400">Kelola semua trip yang sudah Anda daftarkan</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'open'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Trip ({trips.open?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'private'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Private Trip ({trips.private?.length || 0})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'open' && (
          <div className="space-y-4">
            {trips.open?.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                <div className="text-6xl mb-4">🏔️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Open Trip</h3>
                <p className="text-slate-400 mb-6">Anda belum mendaftar ke Open Trip manapun</p>
                <Link
                  href="/open-trip"
                  className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Lihat Open Trip
                </Link>
              </div>
            ) : (
              trips.open.map((registration) => (
                <div key={registration.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-emerald-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {registration.trip_name || 'Open Trip'}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {new Date(registration.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(registration.payment_status || 'pending')}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Jumlah Peserta:</span>
                      <span className="text-white ml-2 font-semibold">{registration.jumlah_peserta || 1} orang</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total:</span>
                      <span className="text-emerald-400 ml-2 font-semibold">
                        Rp {(registration.total_harga || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {registration.payment_status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <Link
                        href={`/payment/open-trip/${registration.trip_id}`}
                        className="inline-block px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Bayar Sekarang
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'private' && (
          <div className="space-y-4">
            {trips.private?.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                <div className="text-6xl mb-4">⛰️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Private Trip</h3>
                <p className="text-slate-400 mb-6">Anda belum membuat permintaan Private Trip</p>
                <Link
                  href="/private-trip"
                  className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Request Private Trip
                </Link>
              </div>
            ) : (
              trips.private.map((trip) => (
                <div key={trip.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-emerald-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{trip.destinasi}</h3>
                      <p className="text-slate-400 text-sm">
                        {new Date(trip.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(trip.tanggal_selesai).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    {getStatusBadge(trip.custom_form?.status || 'pending')}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-slate-400">Peserta:</span>
                      <span className="text-white ml-2 font-semibold">{trip.min_peserta}-{trip.max_peserta} orang</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Harga Paket:</span>
                      <span className="text-emerald-400 ml-2 font-semibold">
                        Rp {trip.harga_paket?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {trip.custom_form?.catatan && (
                    <div className="text-sm">
                      <span className="text-slate-400">Catatan:</span>
                      <p className="text-white mt-1">{trip.custom_form.catatan}</p>
                    </div>
                  )}

                  {trip.custom_form?.status === 'aktif' && trip.custom_form?.payment_status !== 'paid' && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <Link
                        href={`/payment/private-trip/${trip.id}`}
                        className="inline-block px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Bayar Sekarang
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
