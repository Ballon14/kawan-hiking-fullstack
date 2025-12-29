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
      const tripData = await apiGet(`/api/private-trips/${params.id}`);
      console.log('Trip data:', tripData);
      
      // Parse custom_form if it's a string
      if (typeof tripData.custom_form === 'string') {
        try {
          tripData.custom_form = JSON.parse(tripData.custom_form);
        } catch (e) {
          console.warn('Failed to parse custom_form:', e);
        }
      }
      
      setTrip(tripData);

      // Fetch destination if id_destinasi exists
      if (tripData?.id_destinasi) {
        try {
          const destData = await apiGet(`/api/destinations/${tripData.id_destinasi}`);
          setDestination(destData);
        } catch (destError) {
          console.warn('Could not load destination:', destError);
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
      aktif: 'Approve request ini?',
      ditolak: 'Reject request ini?',
    };

    if (!confirm(confirmMessages[newStatus])) return;

    setUpdating(true);
    try {
      // Update custom_form with new status
      const updatedCustomForm = {
        ...(trip.custom_form || {}),
        status: newStatus
      };
      
      await apiPatch(`/api/private-trips/${params.id}`, { 
        custom_form: updatedCustomForm 
      });
      
      await fetchTripDetail();
      alert(`Request berhasil di-${newStatus}!`);
    } catch (error) {
      alert('Gagal update status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
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

  // Extract and format data from custom_form
  const getFormData = (key, defaultValue = '-') => {
    return trip?.custom_form?.[key] || trip?.[key] || defaultValue;
  };

  const getStatus = () => {
    return trip?.custom_form?.status || 'pending';
  };

  const getTripDate = () => {
    const dateStr = getFormData('tanggal_keberangkatan');
    if (dateStr && dateStr !== '-') {
      return formatDate(dateStr);
    }
    return '-';
  };

  const getParticipants = () => {
    return getFormData('jumlah_peserta', trip?.min_peserta || '-');
  };

  const getNotes = () => {
    return getFormData('catatan', '');
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30', label: 'Menunggu Persetujuan', icon: '⏳' },
    aktif: { color: 'bg-green-600/20 text-green-400 border-green-600/30', label: 'Disetujui', icon: '✅' },
    ditolak: { color: 'bg-red-600/20 text-red-400 border-red-600/30', label: 'Ditolak', icon: '❌' },
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

  const status = getStatus();
  const config = statusConfig[status] || statusConfig.pending;
  const tripDate = getTripDate();
  const participants = getParticipants();
  const notes = getNotes();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">Request #{trip.id}</h1>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${config.color} w-fit`}>
          <span>{config.icon}</span>
          {config.label}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Trip Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Information */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">🏔️</span>
              Detail Perjalanan
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Destinasi</label>
                <div className="text-white font-semibold text-lg">
                  {destination?.nama_destinasi || trip.destinasi || `ID: ${trip.id_destinasi}`}
                </div>
                {destination && (
                  <div className="text-sm text-slate-400 mt-1">
                    {destination.lokasi} • {destination.ketinggian} mdpl
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Tanggal Keberangkatan</label>
                <div className="text-white font-semibold text-lg">{tripDate}</div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Jumlah Peserta</label>
                <div className="text-white font-semibold text-lg">{participants} Orang</div>
                {trip.min_peserta && (
                  <div className="text-xs text-slate-400 mt-1">Min. {trip.min_peserta} orang</div>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Harga Paket</label>
                <div className="text-emerald-400 font-semibold text-lg">{formatPrice(trip.harga_paket)}</div>
              </div>

              {trip.estimasi_biaya && (
                <div className="sm:col-span-2">
                  <label className="text-sm text-slate-400 mb-1 block">Estimasi Total Biaya</label>
                  <div className="text-emerald-400 font-semibold text-xl">{formatPrice(trip.estimasi_biaya)}</div>
                  <div className="text-xs text-slate-400 mt-1">Untuk {participants} peserta</div>
                </div>
              )}
            </div>

            {notes && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <label className="text-sm text-slate-400 mb-2 block">📝 Catatan Khusus</label>
                <p className="text-white leading-relaxed whitespace-pre-line bg-slate-700/30 p-4 rounded-lg">{notes}</p>
              </div>
            )}

            {trip.paket_pilihan && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <label className="text-sm text-slate-400 mb-2 block">📦 Paket Pilihan</label>
                <div className="text-white">
                  {(() => {
                    try {
                      const paket = typeof trip.paket_pilihan === 'string' 
                        ? JSON.parse(trip.paket_pilihan) 
                        : trip.paket_pilihan;
                      
                      if (Array.isArray(paket) && paket.length === 0) {
                        return <span className="text-slate-500">Tidak ada paket dipilih</span>;
                      }
                      
                      return (
                        <pre className="text-sm bg-slate-700/50 p-4 rounded-lg overflow-auto">
                          {JSON.stringify(paket, null, 2)}
                        </pre>
                      );
                    } catch (e) {
                      return <span className="text-slate-500">-</span>;
                    }
                  })()}
                </div>
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

        {/* Right Column - Trip Info & Actions */}
        <div className="space-y-6">
          {/* Trip Information Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">�</span>
              Informasi Request
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Requested By</label>
                <div className="text-white font-semibold text-lg">{getFormData('username')}</div>
                {getFormData('online_id') !== '-' && (
                  <div className="text-xs text-slate-400 mt-1">User ID: {getFormData('online_id')}</div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-700">
                <label className="text-sm text-slate-400 mb-2 block">Status Request</label>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${config.color} w-full justify-center`}>
                  <span>{config.icon}</span>
                  {config.label}
                </span>
                {status === 'pending' && (
                  <p className="text-xs text-slate-400 mt-2 text-center">Menunggu approval dari admin</p>
                )}
                {status === 'aktif' && (
                  <p className="text-xs text-emerald-400 mt-2 text-center">Trip sudah disetujui ✓</p>
                )}
                {status === 'ditolak' && (
                  <p className="text-xs text-red-400 mt-2 text-center">Trip ditolak</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-700">
                <label className="text-sm text-slate-400 mb-1 block">Status Pelaksanaan</label>
                <div className="text-white">
                  {trip.dilaksanakan === 1 ? (
                    <span className="inline-flex items-center gap-1 text-green-400 bg-green-600/20 px-3 py-1 rounded-full text-sm">
                      ✓ Sudah Dilaksanakan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full text-sm">
                      Belum Dilaksanakan
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <label className="text-sm text-slate-400 mb-1 block">Tanggal Request</label>
                <div className="text-white text-sm">{formatDate(trip.created_at || new Date())}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Admin Actions</h2>
            
            <div className="space-y-3">
              {status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('aktif')}
                    disabled={updating}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all hover:shadow-lg hover:shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    {updating ? 'Memproses...' : 'Approve Request'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('ditolak')}
                    disabled={updating}
                    className="w-full py-3 bg-red-600/20 text-red-400 border border-red-600/30 font-semibold rounded-xl hover:bg-red-600/30 transition-all hover:shadow-lg hover:shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>❌</span>
                    Reject Request
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    💡 Approve untuk menyetujui trip ini, atau Reject jika tidak sesuai
                  </p>
                </>
              )}

              {(status === 'ditolak') && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">❌</div>
                  <p className="text-slate-400 text-sm">Request sudah ditolak</p>
                  <p className="text-xs text-slate-500 mt-1">Tidak ada aksi yang tersedia</p>
                </div>
              )}

              {(status === 'aktif') && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-400 text-sm font-semibold">Request sudah disetujui!</p>
                  <p className="text-xs text-slate-400 mt-1">Trip sedang dalam proses</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
