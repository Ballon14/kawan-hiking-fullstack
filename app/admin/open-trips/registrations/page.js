'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';

export default function OpenTripRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      const data = await apiGet('/api/open-trips/registrations');
      setRegistrations(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-600/20 text-yellow-400',
      confirmed: 'bg-green-600/20 text-green-400',
      cancelled: 'bg-red-600/20 text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-600/20 text-yellow-400',
      paid: 'bg-green-600/20 text-green-400',
      expired: 'bg-red-600/20 text-red-400',
    };
    return colors[status] || colors.pending;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pendaftar Open Trip</h1>
        <p className="text-slate-400 mt-2">Daftar semua pendaftar open trip</p>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Nama Trip</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Username</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Jumlah Peserta</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Total Harga</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Pembayaran</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 text-slate-400">#{reg.id}</td>
                  <td className="px-6 py-4 text-white">{reg.nama_trip}</td>
                  <td className="px-6 py-4 text-slate-400">{reg.username}</td>
                  <td className="px-6 py-4 text-slate-400">{reg.jumlah_peserta}</td>
                  <td className="px-6 py-4 text-emerald-400">Rp {formatPrice(reg.total_harga)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(reg.status)}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(reg.payment_status)}`}>
                      {reg.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {formatDate(reg.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {registrations.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Belum ada pendaftar
          </div>
        )}
      </div>

      {registrations.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">Total Pendaftar</div>
            <div className="text-3xl font-bold text-white">{registrations.length}</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">Sudah Bayar</div>
            <div className="text-3xl font-bold text-green-400">
              {registrations.filter(r => r.payment_status === 'paid').length}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">Menunggu Pembayaran</div>
            <div className="text-3xl font-bold text-yellow-400">
              {registrations.filter(r => r.payment_status === 'pending').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
