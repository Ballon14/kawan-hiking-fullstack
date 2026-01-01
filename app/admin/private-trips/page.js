'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiPatch } from '@/lib/api-client';

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
      setTrips(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterTrips() {
    let filtered = trips;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.nama_kontak?.toLowerCase().includes(query) ||
        trip.email?.toLowerCase().includes(query) ||
        trip.id_destinasi?.toString().includes(query)
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
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30', label: 'Menunggu', icon: '⏳' },
    approved: { color: 'bg-green-600/20 text-green-400 border-green-600/30', label: 'Disetujui', icon: '✅' },
    rejected: { color: 'bg-red-600/20 text-red-400 border-red-600/30', label: 'Ditolak', icon: '❌' },
    completed: { color: 'bg-blue-600/20 text-blue-400 border-blue-600/30', label: 'Selesai', icon: '🎉' },
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
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Private Trip Requests</h1>
        <p className="text-sm sm:text-base text-slate-400">Manage custom trip requests dari users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700">
          <div className="text-2xl sm:text-3xl mb-2">📊</div>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs sm:text-sm text-slate-400">Total Requests</div>
        </div>
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-600/30">
          <div className="text-2xl sm:text-3xl mb-2">⏳</div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-xs sm:text-sm text-slate-400">Pending</div>
        </div>
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-600/30">
          <div className="text-2xl sm:text-3xl mb-2">✅</div>
          <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.approved}</div>
          <div className="text-xs sm:text-sm text-slate-400">Approved</div>
        </div>
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-600/30">
          <div className="text-2xl sm:text-3xl mb-2">❌</div>
          <div className="text-xl sm:text-2xl font-bold text-red-400">{stats.rejected}</div>
          <div className="text-xs sm:text-sm text-slate-400">Rejected</div>
        </div>
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-600/30">
          <div className="text-2xl sm:text-3xl mb-2">🎉</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.completed}</div>
          <div className="text-xs sm:text-sm text-slate-400">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="glass-card rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap hidden lg:table-cell">ID</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">Kontak</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap hidden md:table-cell">Tanggal</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap hidden sm:table-cell">Peserta</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap hidden xl:table-cell">Budget</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">Status</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTrips.map((trip) => {
                const config = statusConfig[trip.status] || statusConfig.pending;
                return (
                  <tr key={trip.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                      <span className="text-slate-400 font-mono text-xs sm:text-sm">#{trip.id}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="text-white font-medium text-sm sm:text-base">{trip.nama_kontak}</div>
                      <div className="text-xs sm:text-sm text-slate-400 truncate max-w-[150px] sm:max-w-none">{trip.email}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <div className="text-white text-xs sm:text-sm whitespace-nowrap">{formatDate(trip.tanggal_mulai)}</div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">s/d {formatDate(trip.tanggal_selesai)}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-white text-sm hidden sm:table-cell">
                      {trip.jumlah_peserta} orang
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-emerald-400 text-xs sm:text-sm hidden xl:table-cell">
                      {formatPrice(trip.budget)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${config.color}`}>
                        <span>{config.icon}</span>
                        <span className="hidden sm:inline">{config.label}</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <Link
                        href={`/admin/private-trips/view/${trip.id}`}
                        className="text-emerald-400 hover:text-emerald-300 font-medium text-xs sm:text-sm whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Lihat Detail →</span>
                        <span className="sm:hidden">Detail</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Tidak ada request ditemukan</h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all' ? 'Coba ubah filter atau search query' : 'Belum ada private trip request'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
