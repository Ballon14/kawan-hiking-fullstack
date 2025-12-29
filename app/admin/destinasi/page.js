'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api-client';

export default function ManageDestinasi() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  async function fetchDestinations() {
    try {
      const data = await apiGet('/api/destinations');
      setDestinations(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus destinasi ini?')) return;
    
    try {
      await apiDelete(`/api/destinations/${id}`);
      setDestinations(destinations.filter(d => d.id !== id));
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Kelola Destinasi</h1>
        <Link
          href="/admin/destinasi/tambah"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tambah Destinasi
        </Link>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Nama</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Lokasi</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Ketinggian</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Kesulitan</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {destinations.map((dest) => (
              <tr key={dest.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 text-white">{dest.nama_destinasi}</td>
                <td className="px-6 py-4 text-slate-400">{dest.lokasi || '-'}</td>
                <td className="px-6 py-4 text-slate-400">{dest.ketinggian ? `${dest.ketinggian} mdpl` : '-'}</td>
                <td className="px-6 py-4">
                  {dest.kesulitan && (
                    <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-xs">
                      {dest.kesulitan}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/destinasi/edit/${dest.id}`}
                    className="text-emerald-400 hover:text-emerald-300 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(dest.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {destinations.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Belum ada destinasi
          </div>
        )}
      </div>
    </div>
  );
}
