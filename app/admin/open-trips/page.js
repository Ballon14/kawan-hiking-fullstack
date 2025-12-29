'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api-client';

export default function ManageOpenTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      const data = await apiGet('/api/open-trips');
      setTrips(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus trip ini?')) return;
    
    try {
      await apiDelete(`/api/open-trips/${id}`);
      setTrips(trips.filter(t => t.id !== id));
    } catch (error) {
      alert('Gagal menghapus: ' + error.message);
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID');
  };

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
        <h1 className="text-3xl font-bold text-white">Kelola Open Trips</h1>
        <div className="space-x-4">
          <Link
            href="/admin/open-trips/registrations"
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            Lihat Pendaftar
          </Link>
          <Link
            href="/admin/open-trips/tambah"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            + Tambah Trip
          </Link>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Nama Trip</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Tanggal</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Durasi</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Kuota</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Harga</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {trips.map((trip) => (
              <tr key={trip.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 text-white">{trip.nama_trip}</td>
                <td className="px-6 py-4 text-slate-400">{formatDate(trip.tanggal_berangkat)}</td>
                <td className="px-6 py-4 text-slate-400">{trip.durasi} hari</td>
                <td className="px-6 py-4 text-slate-400">{trip.kuota}</td>
                <td className="px-6 py-4 text-emerald-400">Rp {formatPrice(trip.harga_per_orang)}</td>
                <td className="px-6 py-4">
                  {trip.dilaksanakan === 1 ? (
                    <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">Selesai</span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">Aktif</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/open-trips/edit/${trip.id}`} className="text-emerald-400 hover:text-emerald-300 mr-4">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(trip.id)} className="text-red-400 hover:text-red-300">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {trips.length === 0 && (
          <div className="text-center py-12 text-slate-400">Belum ada open trip</div>
        )}
      </div>
    </div>
  );
}
