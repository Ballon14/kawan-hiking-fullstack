'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiPatch, apiDelete } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('open-trips');
  const [openTripRegs, setOpenTripRegs] = useState([]);
  const [privateTrips, setPrivateTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  async function fetchAllOrders() {
    setLoading(true);
    try {
      const [openTripsData, privateTripsData] = await Promise.all([
        apiGet('/api/open-trips/registrations').catch(() => []),
        apiGet('/api/private-trips').catch(() => []),
      ]);
      setOpenTripRegs(openTripsData || []);
      setPrivateTrips(privateTripsData || []);
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  }

  const getOverallStats = () => {
    const openTripsPending = openTripRegs.filter(r => r.status === 'pending').length;
    const openTripsPaid = openTripRegs.filter(r => r.payment_status === 'paid').length;
    const privateTripsPending = privateTrips.filter(t => t.status === 'pending').length;
    const privateTripsTotalRevenue = openTripRegs
      .filter(r => r.payment_status === 'paid')
      .reduce((sum, r) => sum + (r.total_harga || 0), 0);

    return {
      totalOrders: openTripRegs.length + privateTrips.length,
      pendingOrders: openTripsPending + privateTripsPending,
      paidOrders: openTripsPaid,
      totalRevenue: privateTripsTotalRevenue,
    };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  async function handleOpenTripStatusUpdate(regId, newStatus) {
    if (!confirm(`Ubah status ke ${newStatus}?`)) return;
    setUpdating(true);
    try {
      await apiPatch(`/api/open-trips/registrations/${regId}`, { status: newStatus });
      showToast.success('Status berhasil diupdate');
      await fetchAllOrders();
    } catch (error) {
      showToast.error(error.message || 'Gagal update status');
    } finally {
      setUpdating(false);
    }
  }

  async function handleOpenTripDelete(regId) {
    if (!confirm('Hapus pendaftaran ini?')) return;
    try {
      await apiDelete(`/api/open-trips/registrations/${regId}`);
      showToast.success('Pendaftaran berhasil dihapus');
      await fetchAllOrders();
    } catch (error) {
      showToast.error(error.message || 'Gagal menghapus');
    }
  }

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 mt-4">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-lg">📦</span>
            </div>
            Manajemen Pesanan
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Kelola semua pesanan open trip dan private trip</p>
        </div>
      </div>

      {/* Stats Overview - Bento Grid Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 group hover:border-slate-600/50 transition-all">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-slate-600/10 rounded-full blur-2xl group-hover:bg-slate-600/20 transition-all"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
            <p className="text-sm text-slate-400 mt-1">Total Pesanan</p>
          </div>
        </div>

        {/* Pending */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 border border-yellow-500/20 group hover:border-yellow-500/40 transition-all">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.pendingOrders}</p>
            <p className="text-sm text-slate-400 mt-1">Menunggu</p>
          </div>
        </div>

        {/* Paid */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-green-900/30 to-green-950/30 border border-green-500/20 group hover:border-green-500/40 transition-all">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.paidOrders}</p>
            <p className="text-sm text-slate-400 mt-1">Sudah Bayar</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-500/20 group hover:border-emerald-500/40 transition-all">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">Rp {formatPrice(stats.totalRevenue)}</p>
            <p className="text-sm text-slate-400 mt-1">Total Pendapatan</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-700/50 inline-flex">
        <button
          onClick={() => setActiveTab('open-trips')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'open-trips'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🎒</span>
            Open Trip
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              activeTab === 'open-trips' ? 'bg-white/20' : 'bg-slate-700'
            }`}>
              {openTripRegs.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('private-trips')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'private-trips'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🚶</span>
            Private Trip
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              activeTab === 'private-trips' ? 'bg-white/20' : 'bg-slate-700'
            }`}>
              {privateTrips.length}
            </span>
          </span>
        </button>
      </div>

      {/* Open Trip Registrations Table */}
      {activeTab === 'open-trips' && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-xl">🎒</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Pendaftaran Open Trip</h3>
                <p className="text-xs text-slate-400">{openTripRegs.length} pendaftaran</p>
              </div>
            </div>
            <Link
              href="/admin/open-trips/registrations"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
            >
              Lihat Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/30">
                  <th className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Trip</th>
                  <th className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Pendaftar</th>
                  <th className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Total</th>
                  <th className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 md:px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {openTripRegs.slice(0, 10).map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="px-4 md:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🏔️</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate max-w-[150px]">{reg.nama_trip}</p>
                          <p className="text-xs text-slate-500">{reg.jumlah_peserta || 1} peserta</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-5 py-4 hidden md:table-cell">
                      <p className="text-white text-sm">{reg.username || '-'}</p>
                      <p className="text-xs text-slate-500">{formatDate(reg.created_at)}</p>
                    </td>
                    <td className="px-4 md:px-5 py-4 hidden sm:table-cell">
                      <p className="text-emerald-400 font-semibold text-sm">Rp {formatPrice(reg.total_harga || 0)}</p>
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium w-fit ${
                          reg.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          reg.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          reg.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {reg.status === 'confirmed' ? '✓' : reg.status === 'cancelled' ? '✕' : reg.status === 'completed' ? '★' : '○'}
                          <span className="hidden sm:inline">{
                            reg.status === 'confirmed' ? 'Dikonfirmasi' : 
                            reg.status === 'cancelled' ? 'Dibatalkan' : 
                            reg.status === 'completed' ? 'Selesai' : 'Menunggu'
                          }</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium w-fit ${
                          reg.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {reg.payment_status === 'paid' ? '💰' : '💳'}
                          <span className="ml-1 hidden sm:inline">{reg.payment_status === 'paid' ? 'Lunas' : 'Pending'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {reg.status === 'pending' && (
                          <button
                            onClick={() => handleOpenTripStatusUpdate(reg.id, 'confirmed')}
                            disabled={updating}
                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                            title="Konfirmasi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <Link
                          href={`/admin/open-trips/registrations/${reg.id}`}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="Detail"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleOpenTripDelete(reg.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {openTripRegs.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3 opacity-50">📋</div>
              <p className="text-slate-400">Belum ada pendaftaran open trip</p>
            </div>
          )}
        </div>
      )}

      {/* Private Trips Table */}
      {activeTab === 'private-trips' && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-xl">🚶</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Request Private Trip</h3>
                <p className="text-xs text-slate-400">{privateTrips.length} request</p>
              </div>
            </div>
            <Link
              href="/admin/private-trips"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
            >
              Lihat Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/30">
                  <th className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Kontak</th>
                  <th className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Tanggal</th>
                  <th className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Budget</th>
                  <th className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 md:px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {privateTrips.slice(0, 10).map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 md:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
                          {(trip.nama_kontak || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{trip.nama_kontak}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[150px]">{trip.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-5 py-4 hidden md:table-cell">
                      <p className="text-white text-sm">{formatDate(trip.tanggal_mulai)}</p>
                      <p className="text-xs text-slate-500">s/d {formatDate(trip.tanggal_selesai)}</p>
                    </td>
                    <td className="px-4 md:px-5 py-4 hidden sm:table-cell">
                      <p className="text-emerald-400 font-semibold text-sm">
                        {trip.budget ? `Rp ${formatPrice(trip.budget)}` : '-'}
                      </p>
                      <p className="text-xs text-slate-500">{trip.jumlah_peserta} peserta</p>
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                        trip.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        trip.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        trip.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {trip.status === 'approved' ? '✅' : 
                         trip.status === 'rejected' ? '❌' :
                         trip.status === 'completed' ? '🎉' : '⏳'}
                        <span className="hidden sm:inline ml-1">
                          {trip.status === 'approved' ? 'Disetujui' : 
                           trip.status === 'rejected' ? 'Ditolak' :
                           trip.status === 'completed' ? 'Selesai' : 'Menunggu'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 md:px-5 py-4 text-right">
                      <Link
                        href={`/admin/private-trips/view/${trip.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                      >
                        Detail
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {privateTrips.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3 opacity-50">📋</div>
              <p className="text-slate-400">Belum ada request private trip</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
