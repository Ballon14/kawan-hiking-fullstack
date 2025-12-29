'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPatch } from '@/lib/api-client';

export default function PrivateTripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params?.id) {
      fetchTripDetail();
    }
  }, [params?.id]);

  async function fetchTripDetail() {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching trip ID:', params.id);
      
      // Fetch trip data
      const tripData = await apiGet(`/api/private-trips/${params.id}`);
      console.log('Trip data:', tripData);
      setTrip(tripData);

      // Fetch destination if id_destinasi exists
      if (tripData?.id_destinasi) {
        try {
          const destData = await apiGet(`/api/destinations/${tripData.id_destinasi}`);
          console.log('Destination data:', destData);
          setDestination(destData);
        } catch (destError) {
          console.warn('Could not load destination:', destError);
          // Don't fail on destination error
        }
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    const confirmMessages = {
      approved: 'Approve request ini?',
      rejected: 'Reject request ini?',
      completed: 'Mark sebagai completed?'
    };

    if (!confirm(confirmMessages[newStatus])) return;

    setUpdating(true);
    try {
      await apiPatch(`/api/private-trips/${params.id}`, { status: newStatus });
      
      // Refresh data
      await fetchTripDetail();
      alert(`Request berhasil di-${newStatus}!`);
    } catch (error) {
      alert('Gagal update status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Tidak disebutkan';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDuration = () => {
    if (!trip) return 0;
    const start = new Date(trip.tanggal_mulai);
    const end = new Date(trip.tanggal_selesai);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30', label: 'Menunggu Persetujuan', icon: '⏳' },
    approved: { color: 'bg-green-600/20 text-green-400 border-green-600/30', label: 'Disetujui', icon: '✅' },
    rejected: { color: 'bg-red-600/20 text-red-400 border-red-600/30', label: 'Ditolak', icon: '❌' },
    completed: { color: 'bg-blue-600/20 text-blue-400 border-blue-600/30', label: 'Selesai', icon: '🎉' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {error || 'Request Tidak Ditemukan'}
          </h2>
          <p className="text-slate-400 mb-4">Trip ID: {params?.id}</p>
          <Link href="/admin/private-trips" className="text-emerald-400 hover:text-emerald-300">
            ← Kembali ke List
          </Link>
        </div>
      </div>
    );
  }

  const config = statusConfig[trip.status] || statusConfig.pending;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/admin/private-trips"
            className="text-slate-400 hover:text-white mb-2 inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke List
          </Link>
          <h1 className="text-4xl font-bold text-white mt-2">Request #{trip.id}</h1>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${config.color}`}>
          <span>{config.icon}</span>
          {config.label}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Trip Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Information */}
          <div className="glass-card rounded-3xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">🏔️</span>
              Detail Perjalanan
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Destinasi</label>
                <div className="text-white font-semibold text-lg">
                  {destination?.nama_destinasi || `ID: ${trip.id_destinasi}`}
                </div>
                {destination && (
                  <div className="text-sm text-slate-400 mt-1">
                    {destination.lokasi} • {destination.ketinggian} mdpl
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Durasi</label>
                <div className="text-white font-semibold text-lg">{getDuration()} Hari / {getDuration() - 1} Malam</div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Tanggal Mulai</label>
                <div className="text-white font-semibold">{formatDate(trip.tanggal_mulai)}</div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Tanggal Selesai</label>
                <div className="text-white font-semibold">{formatDate(trip.tanggal_selesai)}</div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Jumlah Peserta</label>
                <div className="text-white font-semibold text-lg">{trip.jumlah_peserta} Orang</div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Budget (per orang)</label>
                <div className="text-emerald-400 font-semibold text-lg">{formatPrice(trip.budget)}</div>
              </div>
            </div>

            {trip.catatan && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <label className="text-sm text-slate-400 mb-2 block">Catatan Khusus</label>
                <p className="text-white leading-relaxed whitespace-pre-line">{trip.catatan}</p>
              </div>
            )}
          </div>

          {/* Destination Info (if exists) */}
          {destination && (
            <div className="glass-card rounded-3xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Tentang Destinasi</h2>
              <div className="space-y-4">
                {destination.deskripsi && (
                  <p className="text-slate-300 leading-relaxed">{destination.deskripsi}</p>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {destination.kesulitan && (
                    <div>
                      <span className="text-slate-400 text-sm">Kesulitan:</span>
                      <div className="text-white font-semibold capitalize">{destination.kesulitan}</div>
                    </div>
                  )}
                  {destination.durasi && (
                    <div>
                      <span className="text-slate-400 text-sm">Durasi Normal:</span>
                      <div className="text-white font-semibold">{destination.durasi}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Contact & Actions */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="glass-card rounded-3xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">👤</span>
              Informasi Kontak
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nama Lengkap</label>
                <div className="text-white font-semibold">{trip.nama_kontak}</div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">WhatsApp</label>
                <a 
                  href={`https://wa.me/${trip.nomor_hp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 font-semibold flex items-center gap-2"
                >
                  {trip.nomor_hp}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email</label>
                <a 
                  href={`mailto:${trip.email}`}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  {trip.email}
                </a>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <label className="text-sm text-slate-400 mb-1 block">Tanggal Request</label>
                <div className="text-white text-sm">{formatDate(trip.created_at || new Date())}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-card rounded-3xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Admin Actions</h2>
            
            <div className="space-y-3">
              {trip.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={updating}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    {updating ? 'Memproses...' : 'Approve Request'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={updating}
                    className="w-full py-3 bg-red-600/20 text-red-400 border border-red-600/30 font-semibold rounded-xl hover:bg-red-600/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>❌</span>
                    Reject Request
                  </button>
                </>
              )}

              {trip.status === 'approved' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updating}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>🎉</span>
                  {updating ? 'Memproses...' : 'Mark as Completed'}
                </button>
              )}

              {(trip.status === 'rejected' || trip.status === 'completed') && (
                <div className="text-center text-slate-400 text-sm py-4">
                  No actions available for {trip.status} requests
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
