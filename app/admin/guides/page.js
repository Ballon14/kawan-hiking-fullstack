'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiGet, apiDelete } from '@/lib/api-client';
import { getImagePath } from '@/lib/image-utils';
import { showToast } from '@/lib/toast';

export default function ManageGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGuides, setFilteredGuides] = useState([]);

  useEffect(() => {
    fetchGuides();
  }, []);

  useEffect(() => {
    filterGuides();
  }, [searchQuery, guides]);

  async function fetchGuides() {
    try {
      const data = await apiGet('/api/guides');
      setGuides(data || []);
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  function filterGuides() {
    if (!searchQuery) {
      setFilteredGuides(guides);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredGuides(guides.filter(g => 
      g.nama?.toLowerCase().includes(query) ||
      g.pengalaman?.toLowerCase().includes(query)
    ));
  }

  async function handleDelete(id, nama) {
    if (!confirm(`Hapus guide "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    try {
      await apiDelete(`/api/guides/${id}`);
      setGuides(guides.filter(g => g.id !== id));
      showToast.success('Guide berhasil dihapus');
    } catch (error) {
      showToast.error('Gagal menghapus: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 mt-4">Memuat data guides...</p>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-lg">👨‍🏫</span>
            </div>
            Kelola Guides
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Manajemen pemandu pendakian</p>
        </div>
        <Link
          href="/admin/guides/tambah"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all text-sm font-medium w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Guide
        </Link>
      </div>

      {/* Stats */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <span className="text-3xl">👨‍🏫</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{guides.length}</p>
          <p className="text-sm text-slate-400">Total Pemandu Aktif</p>
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
            placeholder="Cari nama guide atau pengalaman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Guides Grid */}
      {filteredGuides.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGuides.map((guide) => (
            <div 
              key={guide.id} 
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all"
            >
              {/* Photo Section */}
              <div className="relative h-48 bg-gradient-to-br from-amber-900/30 to-orange-900/30">
                {guide.foto ? (
                  <Image
                    src={getImagePath(guide.foto, 'general')}
                    alt={guide.nama}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-amber-500/30">
                      {guide.nama?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
                
                {/* Name Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg">{guide.nama}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Experience */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Pengalaman</p>
                  <p className="text-slate-300 text-sm line-clamp-2">
                    {guide.pengalaman || 'Belum ada informasi pengalaman'}
                  </p>
                </div>

                {/* Contact Info if available */}
                {guide.no_telepon && (
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {guide.no_telepon}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/guides/edit/${guide.id}`}
                    className="flex-1 py-2 px-4 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors text-sm font-medium text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(guide.id, guide.nama)}
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
          <div className="text-5xl mb-4 opacity-50">👨‍🏫</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery ? 'Tidak ada guide ditemukan' : 'Belum ada guide'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan guide baru'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/guides/tambah"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Guide Pertama
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
