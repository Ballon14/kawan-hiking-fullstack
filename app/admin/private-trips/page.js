'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiPatch } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function ManagePrivateTrips() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, statusFilter, searchQuery]);

  async function fetchTrips() {
    try {
      const data = await apiGet('/api/private-trips');
      setTrips(data || []);
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  function filterTrips() {
    let filtered = trips;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.nama_kontak?.toLowerCase().includes(query) ||
        trip.email?.toLowerCase().includes(query)
      );
    }

    setFilteredTrips(filtered);
  }

  const getStatsCounts = () => {
    return {
      total: trips.length,
      pending: trips.filter(t => t.status === 'pending').length,
      approved: trips.filter(t => t.status === 'approved').length,
      rejected: trips.filter(t => t.status === 'rejected').length,
      completed: trips.filter(t => t.status === 'completed').length,
    };
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Menunggu', icon: '⏳' },
    approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Disetujui', icon: '✅' },
    rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Ditolak', icon: '❌' },
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
          <p className="text-slate-400 mt-4">Memuat data private trips...</p>
        </div>
      </div>
    );
  }

  const stats = getStatsCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-lg">🚶</span>
          </div>
          Request Private Trip
        </h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">Kelola permintaan trip privat dari pelanggan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              <p className="text-xs text-slate-400">Menunggu</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
              <p className="text-xs text-slate-400">Disetujui</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <span className="text-xl">❌</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              <p className="text-xs text-slate-400">Ditolak</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-xl">🎉</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
              <p className="text-xs text-slate-400">Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {status === 'all' ? 'Semua' : statusConfig[status]?.label || status}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          Menampilkan {filteredTrips.length} dari {trips.length} request
        </p>
      </div>

      {/* Trips List */}
      {filteredTrips.length > 0 ? (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const statusConf = statusConfig[trip.status] || statusConfig.pending;
            return (
              <div 
                key={trip.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 hover:border-slate-600/50 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Avatar & Contact */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20 flex-shrink-0">
                      {(trip.nama_kontak || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-lg">{trip.nama_kontak}</h3>
                      <p className="text-slate-400 text-sm truncate">{trip.email}</p>
                      {trip.no_telepon && (
                        <p className="text-slate-500 text-xs">{trip.no_telepon}</p>
                      )}
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="flex flex-wrap gap-4 lg:gap-8">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Tanggal</p>
                      <p className="text-white text-sm font-medium">
                        {formatDate(trip.tanggal_mulai)} - {formatDate(trip.tanggal_selesai)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Peserta</p>
                      <p className="text-white text-sm font-medium">{trip.jumlah_peserta} orang</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Budget</p>
                      <p className="text-emerald-400 text-sm font-semibold">
                        {trip.budget ? `Rp ${formatPrice(trip.budget)}` : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 lg:ml-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${statusConf.color}`}>
                      <span>{statusConf.icon}</span>
                      {statusConf.label}
                    </span>
                    <Link
                      href={`/admin/private-trips/view/${trip.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                    >
                      Detail
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
          <div className="text-5xl mb-4 opacity-50">🚶</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery || statusFilter !== 'all' ? 'Tidak ada request ditemukan' : 'Belum ada request private trip'}
          </h3>
          <p className="text-slate-400">
            {searchQuery || statusFilter !== 'all' ? 'Coba ubah filter pencarian' : 'Request dari pelanggan akan muncul di sini'}
          </p>
        </div>
      )}
    </div>
  );
}
