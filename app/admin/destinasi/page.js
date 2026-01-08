'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiGet, apiDelete } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function ManageDestinasi() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [searchQuery, destinations]);

  async function fetchDestinations() {
    try {
      const data = await apiGet('/api/destinations');
      setDestinations(data || []);
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  function filterDestinations() {
    if (!searchQuery) {
      setFilteredDestinations(destinations);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredDestinations(destinations.filter(d => 
      d.nama_destinasi?.toLowerCase().includes(query) ||
      d.lokasi?.toLowerCase().includes(query)
    ));
  }

  async function handleDelete(id, nama) {
    if (!confirm(`Hapus destinasi "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    try {
      await apiDelete(`/api/destinations/${id}`);
      setDestinations(destinations.filter(d => d.id !== id));
      showToast.success('Destinasi berhasil dihapus');
    } catch (error) {
      showToast.error('Gagal menghapus: ' + error.message);
    }
  }

  const getDifficultyColor = (level) => {
    const colors = {
      'mudah': 'bg-green-500/20 text-green-400 border-green-500/30',
      'sedang': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'sulit': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'sangat sulit': 'bg-red-500/20 text-red-400 border-red-500/30',
      'expert': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[level?.toLowerCase()] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 mt-4">Memuat data destinasi...</p>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-lg">🏔️</span>
            </div>
            Kelola Destinasi
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Manajemen destinasi hiking dan pendakian</p>
        </div>
        <Link
          href="/admin/destinasi/tambah"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all text-sm font-medium w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Destinasi
        </Link>
      </div>

      {/* Stats */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <span className="text-2xl">⛰️</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{destinations.length}</p>
            <p className="text-sm text-slate-400">Total Destinasi</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-green-400">
              {destinations.filter(d => d.kesulitan?.toLowerCase() === 'mudah').length}
            </p>
            <p className="text-xs text-slate-400">Mudah</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-400">
              {destinations.filter(d => d.kesulitan?.toLowerCase() === 'sedang').length}
            </p>
            <p className="text-xs text-slate-400">Sedang</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-400">
              {destinations.filter(d => d.kesulitan?.toLowerCase() === 'sulit' || d.kesulitan?.toLowerCase() === 'sangat sulit').length}
            </p>
            <p className="text-xs text-slate-400">Sulit</p>
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
            placeholder="Cari nama destinasi atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDestinations.map((dest) => (
            <div 
              key={dest.id} 
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all"
            >
              {/* Image */}
              <div className="relative h-44 bg-gradient-to-br from-slate-700 to-slate-800">
                {dest.gambar ? (
                  <Image
                    src={dest.gambar.startsWith('/') ? dest.gambar : `/uploads/destinations/${dest.gambar}`}
                    alt={dest.nama_destinasi}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-30">🏔️</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                
                {/* Difficulty Badge */}
                {dest.kesulitan && (
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(dest.kesulitan)}`}>
                      {dest.kesulitan}
                    </span>
                  </div>
                )}

                {/* Name & Location Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg line-clamp-1">{dest.nama_destinasi}</h3>
                  {dest.lokasi && (
                    <p className="text-slate-300 text-sm flex items-center gap-1 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {dest.lokasi}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  {dest.ketinggian && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-emerald-400">📍</span>
                      <span className="text-slate-300">{dest.ketinggian} mdpl</span>
                    </div>
                  )}
                  {dest.durasi && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-blue-400">⏱️</span>
                      <span className="text-slate-300">{dest.durasi}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/destinasi/edit/${dest.id}`}
                    className="flex-1 py-2 px-4 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-medium text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(dest.id, dest.nama_destinasi)}
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
          <div className="text-5xl mb-4 opacity-50">🏔️</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery ? 'Tidak ada destinasi ditemukan' : 'Belum ada destinasi'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan destinasi baru'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/destinasi/tambah"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Destinasi Pertama
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
