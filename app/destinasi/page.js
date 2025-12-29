'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';

export default function DestinasiPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  async function fetchDestinations() {
    try {
      const data = await apiGet('/api/destinations');
      setDestinations(data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDestinations = destinations.filter(dest =>
    dest.nama_destinasi?.toLowerCase().includes(search.toLowerCase()) ||
    dest.lokasi?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Destinasi Pendakian</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Jelajahi berbagai destinasi pendakian menarik di Indonesia
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari destinasi..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Destinations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinasi/${dest.id}`}
              className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-colors group"
            >
              <div className="aspect-video bg-slate-700 relative">
                {dest.gambar ? (
                  <img
                    src={dest.gambar}
                    alt={dest.nama_destinasi}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🏔️</div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {dest.nama_destinasi}
                </h3>
                {dest.lokasi && (
                  <p className="text-slate-400 text-sm mt-1">📍 {dest.lokasi}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {dest.ketinggian && (
                    <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                      {dest.ketinggian} mdpl
                    </span>
                  )}
                  {dest.kesulitan && (
                    <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs">
                      {dest.kesulitan}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Tidak ada destinasi ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
