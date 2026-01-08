'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPatch, apiDelete } from '@/lib/api-client';
import { showToast } from '@/lib/toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [registration, setRegistration] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null,
  });

  useEffect(() => {
    if (params?.id) {
      fetchRegistration();
    }
  }, [params?.id]);

  async function fetchRegistration() {
    setLoading(true);
    try {
      const data = await apiGet(`/api/open-trips/registrations/${params.id}`);
      setRegistration(data);
      setAdminNotes(data.admin_notes || '');
      
      if (data.trip_id) {
        try {
          const tripData = await apiGet(`/api/open-trips/${data.trip_id}`);
          setTrip(tripData);
        } catch (e) {
          console.warn('Could not fetch trip details');
        }
      }
    } catch (error) {
      showToast.error('Gagal memuat data pendaftaran');
    } finally {
      setLoading(false);
    }
  }

  const openConfirmModal = (config) => {
    setConfirmModal({ isOpen: true, ...config });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  async function handleStatusUpdate(newStatus) {
    const configs = {
      confirmed: { title: 'Konfirmasi Pendaftaran', message: 'Peserta akan terdaftar dan dapat mengikuti trip.', type: 'success', icon: '✅' },
      cancelled: { title: 'Batalkan Pendaftaran', message: 'Pastikan sudah menghubungi peserta terkait pembatalan.', type: 'danger', icon: '❌' },
      completed: { title: 'Tandai Selesai', message: 'Trip telah selesai dilaksanakan.', type: 'info', icon: '🎉' },
    };
    const config = configs[newStatus] || { title: 'Ubah Status', message: `Ubah status ke ${newStatus}?`, type: 'warning' };

    openConfirmModal({
      ...config,
      onConfirm: async () => {
        setUpdating(true);
        closeConfirmModal();
        try {
          await apiPatch(`/api/open-trips/registrations/${params.id}`, { status: newStatus });
          showToast.success('Status berhasil diupdate');
          await fetchRegistration();
        } catch (error) {
          showToast.error(error.message || 'Gagal update status');
        } finally {
          setUpdating(false);
        }
      },
    });
  }

  async function handlePaymentUpdate(newPaymentStatus) {
    const configs = {
      paid: { title: 'Konfirmasi Pembayaran', message: 'Pastikan pembayaran sudah diterima.', type: 'success', icon: '💰' },
      refunded: { title: 'Proses Refund', message: 'Pastikan dana sudah dikembalikan ke peserta.', type: 'warning', icon: '💸' },
      expired: { title: 'Tandai Kadaluarsa', message: 'Peserta perlu melakukan pembayaran ulang.', type: 'danger', icon: '⏰' },
    };
    const config = configs[newPaymentStatus] || { title: 'Ubah Pembayaran', message: `Ubah ke ${newPaymentStatus}?`, type: 'warning' };

    openConfirmModal({
      ...config,
      onConfirm: async () => {
        setUpdating(true);
        closeConfirmModal();
        try {
          await apiPatch(`/api/open-trips/registrations/${params.id}`, { payment_status: newPaymentStatus });
          showToast.success('Status pembayaran berhasil diupdate');
          await fetchRegistration();
        } catch (error) {
          showToast.error(error.message || 'Gagal update pembayaran');
        } finally {
          setUpdating(false);
        }
      },
    });
  }

  async function handleSaveNotes() {
    setUpdating(true);
    try {
      await apiPatch(`/api/open-trips/registrations/${params.id}`, { admin_notes: adminNotes });
      showToast.success('Catatan berhasil disimpan');
    } catch (error) {
      showToast.error('Gagal menyimpan catatan');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    openConfirmModal({
      title: 'Hapus Pendaftaran',
      message: 'Pendaftaran akan dihapus permanen. Tindakan ini tidak bisa dibatalkan!',
      type: 'danger',
      icon: '🗑️',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await apiDelete(`/api/open-trips/registrations/${params.id}`);
          showToast.success('Pendaftaran berhasil dihapus');
          router.push('/admin/open-trips/registrations');
        } catch (error) {
          showToast.error('Gagal menghapus pendaftaran');
        }
      },
    });
  }

  const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price || 0);
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const statusConfig = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Menunggu', icon: '⏳' },
    confirmed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Dikonfirmasi', icon: '✅' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Dibatalkan', icon: '❌' },
    completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Selesai', icon: '🎉' },
  };

  const paymentConfig = {
    pending: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Belum Bayar', icon: '💳' },
    paid: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Lunas', icon: '💰' },
    expired: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Kadaluarsa', icon: '⏰' },
    refunded: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Refund', icon: '💸' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 mt-4">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Pendaftaran Tidak Ditemukan</h2>
          <Link href="/admin/open-trips/registrations" className="text-emerald-400 hover:text-emerald-300">← Kembali</Link>
        </div>
      </div>
    );
  }

  const statusConf = statusConfig[registration.status] || statusConfig.pending;
  const paymentConf = paymentConfig[registration.payment_status] || paymentConfig.pending;

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        icon={confirmModal.icon}
        loading={updating}
      />

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <Link href="/admin/open-trips/registrations" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Detail Pendaftaran</h1>
                <p className="text-slate-400 text-sm">ID: #{registration.id?.slice(-8)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}>
                <span>{statusConf.icon}</span>{statusConf.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${paymentConf.bg} ${paymentConf.text} border ${paymentConf.border}`}>
                <span>{paymentConf.icon}</span>{paymentConf.label}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl p-5 border border-emerald-500/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{registration.jumlah_peserta || 1}</p>
              <p className="text-sm text-slate-400">Peserta</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">Rp {formatPrice(registration.total_harga)}</p>
              <p className="text-sm text-slate-400">Total Bayar</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{formatDate(registration.created_at)}</p>
              <p className="text-sm text-slate-400">Tanggal Daftar</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{registration.nama_trip || '-'}</p>
              <p className="text-sm text-slate-400">Nama Trip</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Info (3/5) */}
          <div className="lg:col-span-3 space-y-5">
            {/* Pendaftar Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/30">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <span>👤</span> Informasi Pendaftar
                </h2>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Nama</p>
                    <p className="text-white font-medium">{registration.nama || registration.username || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Username</p>
                    <p className="text-white">@{registration.username || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="text-white">{registration.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">No. Telepon</p>
                    <p className="text-white">{registration.phone || registration.no_telp || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Info */}
            {trip && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/30">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <span>🎒</span> Informasi Trip
                  </h2>
                </div>
                <div className="p-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Nama Trip</p>
                      <p className="text-white font-medium">{trip.nama_trip}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Tanggal</p>
                      <p className="text-white">{formatDate(trip.tanggal_berangkat)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Durasi</p>
                      <p className="text-white">{trip.durasi} hari</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Harga/Orang</p>
                      <p className="text-emerald-400 font-medium">Rp {formatPrice(trip.harga_per_orang)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Peserta List */}
            {registration.peserta && registration.peserta.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/30">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <span>👥</span> Daftar Peserta ({registration.peserta.length})
                  </h2>
                </div>
                <div className="p-5 space-y-2">
                  {registration.peserta.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{p.nama || p.name || `Peserta ${i + 1}`}</p>
                        {p.nik && <p className="text-xs text-slate-500">NIK: {p.nik}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catatan */}
            {registration.catatan && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/30">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <span>📝</span> Catatan Pendaftar
                  </h2>
                </div>
                <div className="p-5">
                  <p className="text-slate-300 text-sm">{registration.catatan}</p>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/30">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <span>📌</span> Catatan Admin
                </h2>
              </div>
              <div className="p-5">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Tambah catatan internal..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[80px] resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={updating}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Actions (2/5) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/30">
                <h2 className="font-semibold text-white text-sm">Status Booking</h2>
              </div>
              <div className="p-4 space-y-2">
                {registration.status !== 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={updating}
                    className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>✅</span> Konfirmasi
                  </button>
                )}
                {registration.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={updating}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>🎉</span> Tandai Selesai
                  </button>
                )}
                {registration.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    className="w-full py-2.5 bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>❌</span> Batalkan
                  </button>
                )}
              </div>
            </div>

            {/* Payment Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/30">
                <h2 className="font-semibold text-white text-sm">Status Pembayaran</h2>
              </div>
              <div className="p-4 space-y-2">
                {registration.payment_status !== 'paid' && (
                  <button
                    onClick={() => handlePaymentUpdate('paid')}
                    disabled={updating}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>💰</span> Tandai Lunas
                  </button>
                )}
                {registration.payment_status === 'paid' && (
                  <button
                    onClick={() => handlePaymentUpdate('refunded')}
                    disabled={updating}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>💸</span> Proses Refund
                  </button>
                )}
                {registration.payment_status === 'pending' && (
                  <button
                    onClick={() => handlePaymentUpdate('expired')}
                    disabled={updating}
                    className="w-full py-2.5 bg-slate-700 text-white text-sm font-medium rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>⏰</span> Kadaluarsa
                  </button>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-red-500/30 overflow-hidden">
              <div className="px-5 py-4 border-b border-red-500/30 bg-red-500/5">
                <h2 className="font-semibold text-red-400 text-sm flex items-center gap-2">
                  <span>⚠️</span> Zona Bahaya
                </h2>
              </div>
              <div className="p-4">
                <button
                  onClick={handleDelete}
                  className="w-full py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  <span>🗑️</span> Hapus Pendaftaran
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">Tidak bisa dibatalkan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
