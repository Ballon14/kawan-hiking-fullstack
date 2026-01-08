'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPatch } from '@/lib/api-client';
import { showToast } from '@/lib/toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function PrivateTripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
      
      if (typeof tripData.custom_form === 'string') {
        try {
          tripData.custom_form = JSON.parse(tripData.custom_form);
        } catch (e) {
          console.warn('Failed to parse custom_form:', e);
        }
      }
      
      setTrip(tripData);

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

  const handleApprove = async () => {
    setUpdating(true);
    try {
      const updatedCustomForm = {
        ...(trip.custom_form || {}),
        status: 'aktif',
        approved_at: new Date().toISOString(),
      };
      
      await apiPatch(`/api/private-trips/${params.id}`, { 
        status: 'approved',
        custom_form: updatedCustomForm 
      });
      
      showToast.success('Request berhasil disetujui! 🎉');
      setShowApproveModal(false);
      await fetchTripDetail();
    } catch (error) {
      showToast.error('Gagal menyetujui request: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    setUpdating(true);
    try {
      const updatedCustomForm = {
        ...(trip.custom_form || {}),
        status: 'ditolak',
        rejected_at: new Date().toISOString(),
        reject_reason: rejectReason || 'Tidak ada alasan yang diberikan',
      };
      
      await apiPatch(`/api/private-trips/${params.id}`, { 
        status: 'rejected',
        custom_form: updatedCustomForm 
      });
      
      showToast.success('Request telah ditolak');
      setShowRejectModal(false);
      setShowReasonModal(false);
      setRejectReason('');
      await fetchTripDetail();
    } catch (error) {
      showToast.error('Gagal menolak request: ' + error.message);
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

  const getFormData = (key, defaultValue = '-') => {
    return trip?.custom_form?.[key] || trip?.[key] || defaultValue;
  };

  const getStatus = () => {
    return trip?.status || trip?.custom_form?.status || 'pending';
  };

  const getRejectReason = () => {
    return trip?.custom_form?.reject_reason || '';
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
    pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Menunggu Persetujuan', icon: '⏳' },
    approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Disetujui', icon: '✅' },
    aktif: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Disetujui', icon: '✅' },
    rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Ditolak', icon: '❌' },
    ditolak: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Ditolak', icon: '❌' },
    completed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Selesai', icon: '🎉' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 mt-4">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
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
  const rejectionReason = getRejectReason();

  return (
    <>
      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Setujui Request Trip"
        message={`Anda akan menyetujui request private trip dari "${getFormData('nama_kontak')}".\n\nPelanggan akan diberitahu bahwa trip mereka telah disetujui.`}
        confirmText="Ya, Setujui"
        type="success"
        icon="✅"
        loading={updating}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={() => {
          setShowRejectModal(false);
          setShowReasonModal(true);
        }}
        title="Tolak Request Trip"
        message={`Anda akan menolak request private trip dari "${getFormData('nama_kontak')}".\n\nApakah Anda ingin memberikan alasan penolakan?`}
        confirmText="Lanjutkan"
        type="danger"
        icon="❌"
      />

      {/* Reject Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowReasonModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div 
            className="relative bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-700 bg-red-500/10 rounded-t-2xl">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <span>❌</span>
                Alasan Penolakan
              </h3>
            </div>
            <div className="p-6">
              <p className="text-slate-300 text-sm mb-4">
                Berikan alasan mengapa request ini ditolak (opsional):
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Destinasi tidak tersedia, Jadwal penuh, Jumlah peserta tidak memenuhi minimum..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[120px] resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <span>❌</span>
                      Tolak Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link 
              href="/admin/private-trips"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke List
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-lg">🚶</span>
              </div>
              Detail Request #{trip.id?.slice(-6)}
            </h1>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${config.color}`}>
            <span>{config.icon}</span>
            {config.label}
          </span>
        </div>

        {/* Rejection Alert */}
        {(status === 'rejected' || status === 'ditolak') && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400 mb-1">Request Ditolak</h3>
                {rejectionReason ? (
                  <>
                    <p className="text-sm text-slate-400 mb-2">Alasan penolakan:</p>
                    <p className="text-white bg-slate-800/50 rounded-lg p-3 text-sm">{rejectionReason}</p>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">Tidak ada alasan yang diberikan</p>
                )}
                {trip?.custom_form?.rejected_at && (
                  <p className="text-xs text-slate-500 mt-2">
                    Ditolak pada: {formatDate(trip.custom_form.rejected_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Informasi Kontak
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Nama Lengkap</label>
                  <div className="text-white font-semibold">{getFormData('nama_kontak')}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email</label>
                  <div className="text-white">{getFormData('email')}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">No. Telepon</label>
                  <div className="text-white">{getFormData('nomor_hp')}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Username</label>
                  <div className="text-white">@{getFormData('username')}</div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🏔️</span>
                Detail Perjalanan
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Destinasi</label>
                  <div className="text-white font-semibold">{destination?.nama_destinasi || getFormData('destinasi')}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Tanggal Keberangkatan</label>
                  <div className="text-white">{tripDate}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Jumlah Peserta</label>
                  <div className="text-emerald-400 font-semibold text-lg">{participants} orang</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Budget</label>
                  <div className="text-emerald-400 font-semibold">{formatPrice(getFormData('budget'))}</div>
                </div>
              </div>
              {notes && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <label className="text-sm text-slate-400 mb-2 block">Catatan/Permintaan Khusus</label>
                  <div className="text-white bg-slate-900/50 rounded-xl p-4 text-sm">{notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-bold text-white mb-4">Status Request</h2>
              <div className={`text-center p-4 rounded-xl ${config.color.replace('text-', 'bg-').replace('400', '500/10')}`}>
                <div className="text-4xl mb-2">{config.icon}</div>
                <div className={`font-semibold ${config.color.split(' ')[1]}`}>{config.label}</div>
              </div>
              <div className="mt-4 text-sm text-slate-400">
                <div className="flex justify-between py-2 border-b border-slate-700/50">
                  <span>Tanggal Request</span>
                  <span className="text-white">{formatDate(trip.created_at)}</span>
                </div>
                {trip?.custom_form?.approved_at && (
                  <div className="flex justify-between py-2 border-b border-slate-700/50">
                    <span>Disetujui</span>
                    <span className="text-green-400">{formatDate(trip.custom_form.approved_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-bold text-white mb-4">Aksi Admin</h2>
              
              {status === 'pending' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    Setujui Request
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/30 font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>❌</span>
                    Tolak Request
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    Approve untuk menyetujui, atau Tolak jika tidak sesuai
                  </p>
                </div>
              )}

              {(status === 'approved' || status === 'aktif') && (
                <div className="text-center py-4">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-green-400 font-semibold">Request Sudah Disetujui</p>
                  <p className="text-xs text-slate-400 mt-1">Trip sedang dalam proses persiapan</p>
                </div>
              )}

              {(status === 'rejected' || status === 'ditolak') && (
                <div className="text-center py-4">
                  <div className="text-5xl mb-3">❌</div>
                  <p className="text-red-400 font-semibold">Request Ditolak</p>
                  <p className="text-xs text-slate-400 mt-1">Tidak ada aksi yang tersedia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
