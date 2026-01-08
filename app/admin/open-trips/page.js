'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiGet, apiDelete } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function ManageOpenTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTrips, setFilteredTrips] = useState([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [searchQuery, trips]);

  async function fetchTrips() {
    try {
      const data = await apiGet('/api/open-trips');
      setTrips(data || []);
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  function filterTrips() {
    if (!searchQuery) {
      setFilteredTrips(trips);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredTrips(trips.filter(t => 
      t.nama_trip?.toLowerCase().includes(query) ||
      t.lokasi?.toLowerCase().includes(query)
    ));
  }

  async function handleDelete(id, nama) {
    if (!confirm(`Hapus trip "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    try {
      await apiDelete(`/api/open-trips/${id}`);
      setTrips(trips.filter(t => t.id !== id));
      showToast.success('Trip berhasil dihapus');
    } catch (error) {
      showToast.error('Gagal menghapus: ' + error.message);
    }
  }

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

  const getStats = () => {
    const active = trips.filter(t => t.dilaksanakan !== 1).length;
    const completed = trips.filter(t => t.dilaksanakan === 1).length;
    return { total: trips.length, active, completed };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 mt-4">Memuat data trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-lg">🎒</span>
            </div>
            Kelola Open Trips
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Manajemen trip reguler terbuka untuk umum</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/admin/open-trips/registrations"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white border border-slate-700 transition-all text-sm font-medium"
          >
            <span>📋</span>
            Pendaftar
          </Link>
          <Link
            href="/admin/open-trips/tambah"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Trip
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total Trip</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
              <p className="text-xs text-slate-400">Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
              <p className="text-xs text-slate-400">Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama trip atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          Menampilkan {filteredTrips.length} dari {trips.length} trip
        </p>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTrips.map((trip) => (
            <div 
              key={trip.id} 
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all"
            >
              {/* Image */}
              <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-800">
                {trip.gambar ? (
                  <Image
                    src={trip.gambar.startsWith('/') ? trip.gambar : `/uploads/trips/${trip.gambar}`}
                    alt={trip.nama_trip}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-50">
                    🏔️
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {trip.dilaksanakan === 1 ? (
                    <span className="px-2.5 py-1 bg-green-500/90 text-white rounded-lg text-xs font-medium backdrop-blur-sm">
                      ✓ Selesai
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-blue-500/90 text-white rounded-lg text-xs font-medium backdrop-blur-sm">
                      ● Aktif
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs text-slate-300 mb-0.5">Mulai dari</p>
                  <p className="text-lg font-bold text-white">Rp {formatPrice(trip.harga_per_orang)}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">{trip.nama_trip}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(trip.tanggal_berangkat)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {trip.durasi} hari • Kuota {trip.kuota} orang
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/open-trips/edit/${trip.id}`}
                    className="flex-1 py-2 px-4 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(trip.id, trip.nama_trip)}
                    className="py-2 px-4 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
          <div className="text-5xl mb-4 opacity-50">🎒</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery ? 'Tidak ada trip ditemukan' : 'Belum ada open trip'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan trip baru'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/open-trips/tambah"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Trip Pertama
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
