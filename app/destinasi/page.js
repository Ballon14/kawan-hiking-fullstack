'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import Link from 'next/link';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKesulitan, setFilterKesulitan] = useState('all');

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [searchQuery, filterKesulitan, destinations]);

  async function fetchDestinations() {
    try {
      const data = await apiGet('/api/destinations');
      setDestinations(data || []);
      setFilteredDestinations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterDestinations() {
    let filtered = destinations;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(dest =>
        dest.nama_destinasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.lokasi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Difficulty filter
    if (filterKesulitan !== 'all') {
      filtered = filtered.filter(dest => dest.kesulitan === filterKesulitan);
    }

    setFilteredDestinations(filtered);
  }

  function getDifficultyBadge(kesulitan) {
    const colors = {
      mudah: 'bg-green-600/20 text-green-400 border-green-600/40',
      sedang: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40',
      sulit: 'bg-red-600/20 text-red-400 border-red-600/40',
    };
    return colors[kesulitan] || colors.mudah;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🏔️ Destinasi Pendakian</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Jelajahi berbagai destinasi pendakian gunung terbaik di Indonesia
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari destinasi atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterKesulitan}
            onChange={(e) => setFilterKesulitan(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kesulitan</option>
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-slate-400">
          Menampilkan {filteredDestinations.length} dari {destinations.length} destinasi
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Tidak Ada Hasil</h3>
            <p className="text-slate-400">Coba ubah kata kunci atau filter pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinasi/${dest.id}`}
                className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/20 group"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-emerald-900 to-slate-900 overflow-hidden">
                  {dest.gambar ? (
                    <img
                      src={dest.gambar}
                      alt={dest.nama_destinasi}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🏔️
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {dest.nama_destinasi}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">📍 {dest.lokasi}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Ketinggian:</span>
                      <span className="text-white font-semibold">{dest.ketinggian} mdpl</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Durasi:</span>
                      <span className="text-white font-semibold">{dest.durasi}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyBadge(dest.kesulitan)}`}>
                      {dest.kesulitan?.charAt(0).toUpperCase() + dest.kesulitan?.slice(1)}
                    </span>
                    <span className="text-emerald-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Lihat Detail →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
