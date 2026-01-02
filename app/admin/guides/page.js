'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api-client';
import { getImagePath } from '@/lib/image-utils';

export default function ManageGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  async function fetchGuides() {
    try {
      const data = await apiGet('/api/guides');
      setGuides(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus guide ini?')) return;
    
    try {
      await apiDelete(`/api/guides/${id}`);
      setGuides(guides.filter(g => g.id !== id));
    } catch (error) {
      alert('Gagal menghapus: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Kelola Guides</h1>
        <Link
          href="/admin/guides/tambah"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-center transition-colors"
        >
          + Tambah Guide
        </Link>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">Nama</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap hidden md:table-cell">Pengalaman</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {guides.map((guide) => (
                <tr key={guide.id} className="hover:bg-slate-700/50">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        {guide.foto ? (
                          <img src={getImagePath(guide.foto, 'general')} alt={guide.nama} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg sm:text-xl">👨‍🏫</span>
                        )}
                      </div>
                      <span className="text-white text-sm sm:text-base">{guide.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-400 text-sm hidden md:table-cell">{guide.pengalaman || '-'}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-4">
                      <Link href={`/admin/guides/edit/${guide.id}`} className="text-emerald-400 hover:text-emerald-300 text-sm whitespace-nowrap">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(guide.id)} className="text-red-400 hover:text-red-300 text-sm whitespace-nowrap">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {guides.length === 0 && (
          <div className="text-center py-12 text-slate-400">Belum ada guide</div>
        )}
      </div>
    </div>
  );
}
