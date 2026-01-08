'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiPatch, apiDelete } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function OpenTripRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [searchQuery, statusFilter, paymentFilter, registrations]);

  async function fetchRegistrations() {
    try {
      const data = await apiGet('/api/open-trips/registrations');
      setRegistrations(data);
    } catch (error) {
      showToast.error('Gagal memuat data pendaftaran');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterRegistrations() {
    let filtered = registrations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reg =>
        reg.username?.toLowerCase().includes(query) ||
        reg.nama_trip?.toLowerCase().includes(query) ||
        reg.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(reg => reg.payment_status === paymentFilter);
    }

    setFilteredRegistrations(filtered);
  }

  const getStatsCounts = () => {
    return {
      total: registrations.length,
      pending: registrations.filter(r => r.status === 'pending').length,
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      cancelled: registrations.filter(r => r.status === 'cancelled').length,
      paid: registrations.filter(r => r.payment_status === 'paid').length,
      unpaid: registrations.filter(r => r.payment_status === 'pending').length,
    };
  };

  async function handleStatusUpdate(regId, newStatus) {
    const confirmMessages = {
      confirmed: 'Konfirmasi pendaftaran ini?',
      cancelled: 'Batalkan pendaftaran ini?',
      completed: 'Tandai sebagai selesai?',
    };

    if (!confirm(confirmMessages[newStatus] || `Ubah status ke ${newStatus}?`)) return;

    setUpdating(true);
    try {
      await apiPatch(`/api/open-trips/registrations/${regId}`, { status: newStatus });
      showToast.success('Status berhasil diupdate');
      await fetchRegistrations();
    } catch (error) {
      showToast.error(error.message || 'Gagal update status');
    } finally {
      setUpdating(false);
    }
  }

  async function handlePaymentUpdate(regId, newPaymentStatus) {
    if (!confirm(`Ubah status pembayaran ke ${newPaymentStatus}?`)) return;

    setUpdating(true);
    try {
      await apiPatch(`/api/open-trips/registrations/${regId}`, { payment_status: newPaymentStatus });
      showToast.success('Status pembayaran berhasil diupdate');
      await fetchRegistrations();
    } catch (error) {
      showToast.error(error.message || 'Gagal update status pembayaran');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete(regId) {
    if (!confirm('Hapus pendaftaran ini? Tindakan ini tidak bisa dibatalkan.')) return;

    try {
      await apiDelete(`/api/open-trips/registrations/${regId}`);
      showToast.success('Pendaftaran berhasil dihapus');
      await fetchRegistrations();
    } catch (error) {
      showToast.error(error.message || 'Gagal menghapus pendaftaran');
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30', label: 'Menunggu', icon: '⏳' },
    confirmed: { color: 'bg-green-600/20 text-green-400 border-green-600/30', label: 'Dikonfirmasi', icon: '✅' },
    cancelled: { color: 'bg-red-600/20 text-red-400 border-red-600/30', label: 'Dibatalkan', icon: '❌' },
    completed: { color: 'bg-blue-600/20 text-blue-400 border-blue-600/30', label: 'Selesai', icon: '🎉' },
  };

  const paymentConfig = {
    pending: { color: 'bg-yellow-600/20 text-yellow-400', label: 'Belum Bayar' },
    paid: { color: 'bg-green-600/20 text-green-400', label: 'Sudah Bayar' },
    expired: { color: 'bg-red-600/20 text-red-400', label: 'Kadaluarsa' },
    refunded: { color: 'bg-purple-600/20 text-purple-400', label: 'Refunded' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  const stats = getStatsCounts();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Pendaftar Open Trip</h1>
          <p className="text-slate-400 mt-1">Kelola semua pendaftaran open trip</p>
        </div>
        <Link
          href="/admin/open-trips"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors w-fit"
        >
          <span>🎒</span>
          Kelola Open Trips
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-700">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-yellow-600/30">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-xs text-slate-400">Menunggu</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-green-600/30">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-xl font-bold text-green-400">{stats.confirmed}</div>
          <div className="text-xs text-slate-400">Dikonfirmasi</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-red-600/30">
          <div className="text-2xl mb-1">❌</div>
          <div className="text-xl font-bold text-red-400">{stats.cancelled}</div>
          <div className="text-xs text-slate-400">Dibatalkan</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-emerald-600/30">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xl font-bold text-emerald-400">{stats.paid}</div>
          <div className="text-xs text-slate-400">Sudah Bayar</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-orange-600/30">
          <div className="text-2xl mb-1">💳</div>
          <div className="text-xl font-bold text-orange-400">{stats.unpaid}</div>
          <div className="text-xs text-slate-400">Belum Bayar</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari username, nama trip, email..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="completed">Selesai</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Pembayaran</option>
            <option value="pending">Belum Bayar</option>
            <option value="paid">Sudah Bayar</option>
            <option value="expired">Kadaluarsa</option>
          </select>
        </div>
        <p className="text-sm text-slate-400 mt-3">
          Menampilkan {filteredRegistrations.length} dari {registrations.length} pendaftaran
        </p>
      </div>

      {/* Registrations Table */}
      <div className="glass-card rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap">Nama Trip</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap hidden md:table-cell">Pendaftar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap hidden lg:table-cell">Peserta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap hidden sm:table-cell">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap hidden md:table-cell">Pembayaran</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 whitespace-nowrap hidden lg:table-cell">Tanggal</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredRegistrations.map((reg) => {
                const statusConf = statusConfig[reg.status] || statusConfig.pending;
                const paymentConf = paymentConfig[reg.payment_status] || paymentConfig.pending;
                
                return (
                  <tr key={reg.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-slate-400 font-mono text-xs">#{reg.id?.slice(-6)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium text-sm truncate max-w-[150px]">{reg.nama_trip}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-white text-sm">{reg.username || reg.nama || '-'}</div>
                      <div className="text-xs text-slate-400">{reg.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm hidden lg:table-cell">
                      {reg.jumlah_peserta || 1} orang
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-medium text-sm hidden sm:table-cell">
                      Rp {formatPrice(reg.total_harga || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConf.color}`}>
                        <span>{statusConf.icon}</span>
                        <span className="hidden sm:inline">{statusConf.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${paymentConf.color}`}>
                        {paymentConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                      {formatDate(reg.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Status Actions Dropdown */}
                        <div className="relative group">
                          <button 
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            title="Ubah Status"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                          </button>
                          <div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="p-2 space-y-1">
                              <p className="text-xs text-slate-400 px-2 py-1">Status Booking</p>
                              {reg.status !== 'confirmed' && (
                                <button
                                  onClick={() => handleStatusUpdate(reg.id, 'confirmed')}
                                  disabled={updating}
                                  className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-green-600/20 rounded transition-colors"
                                >
                                  ✅ Konfirmasi
                                </button>
                              )}
                              {reg.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleStatusUpdate(reg.id, 'cancelled')}
                                  disabled={updating}
                                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 rounded transition-colors"
                                >
                                  ❌ Batalkan
                                </button>
                              )}
                              {reg.status === 'confirmed' && (
                                <button
                                  onClick={() => handleStatusUpdate(reg.id, 'completed')}
                                  disabled={updating}
                                  className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-blue-600/20 rounded transition-colors"
                                >
                                  🎉 Selesai
                                </button>
                              )}
                              <div className="border-t border-slate-700 my-1"></div>
                              <p className="text-xs text-slate-400 px-2 py-1">Pembayaran</p>
                              {reg.payment_status !== 'paid' && (
                                <button
                                  onClick={() => handlePaymentUpdate(reg.id, 'paid')}
                                  disabled={updating}
                                  className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-600/20 rounded transition-colors"
                                >
                                  💰 Sudah Bayar
                                </button>
                              )}
                              {reg.payment_status === 'paid' && (
                                <button
                                  onClick={() => handlePaymentUpdate(reg.id, 'refunded')}
                                  disabled={updating}
                                  className="w-full text-left px-3 py-2 text-sm text-purple-400 hover:bg-purple-600/20 rounded transition-colors"
                                >
                                  💸 Refund
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* View Detail Link */}
                        <Link
                          href={`/admin/open-trips/registrations/${reg.id}`}
                          className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/20 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">Tidak ada pendaftaran</h3>
            <p className="text-slate-400">
              {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' 
                ? 'Coba ubah filter pencarian' 
                : 'Belum ada pendaftaran open trip'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
