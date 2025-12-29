'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/api-client';

export default function EditOpenTrip() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama_trip: '',
    tanggal_berangkat: '',
    durasi: '',
    kuota: '',
    harga_per_orang: '',
    fasilitas: '',
    itinerary: '',
    dokumentasi: '',
    dilaksanakan: 0,
  });

  useEffect(() => {
    fetchTrip();
  }, []);

  async function fetchTrip() {
    try {
      const data = await apiGet(`/api/open-trips/${params.id}`);
      
      setFormData({
        nama_trip: data.nama_trip || '',
        tanggal_berangkat: data.tanggal_berangkat ? data.tanggal_berangkat.split('T')[0] : '',
        durasi: data.durasi || '',
        kuota: data.kuota || '',
        harga_per_orang: data.harga_per_orang || '',
        fasilitas: Array.isArray(data.fasilitas) 
          ? data.fasilitas.join(', ') 
          : (typeof data.fasilitas === 'string' ? JSON.parse(data.fasilitas || '[]').join(', ') : ''),
        itinerary: data.itinerary || '',
        dokumentasi: Array.isArray(data.dokumentasi) 
          ? data.dokumentasi.join(', ') 
          : (typeof data.dokumentasi === 'string' ? JSON.parse(data.dokumentasi || '[]').join(', ') : ''),
        dilaksanakan: data.dilaksanakan || 0,
      });
    } catch (err) {
      setError(err.message || 'Gagal memuat data trip');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        nama_trip: formData.nama_trip,
        tanggal_berangkat: formData.tanggal_berangkat,
        durasi: parseInt(formData.durasi),
        kuota: parseInt(formData.kuota),
        harga_per_orang: parseInt(formData.harga_per_orang),
        fasilitas: formData.fasilitas ? formData.fasilitas.split(',').map(s => s.trim()) : [],
        itinerary: formData.itinerary || null,
        dokumentasi: formData.dokumentasi ? formData.dokumentasi.split(',').map(s => s.trim()) : [],
        dilaksanakan: formData.dilaksanakan,
      };

      await apiPut(`/api/open-trips/${params.id}`, payload);
      router.push('/admin/open-trips');
    } catch (err) {
      setError(err.message || 'Gagal mengupdate trip');
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-3xl font-bold text-white">Edit Open Trip</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nama Trip *
              </label>
              <input
                type="text"
                name="nama_trip"
                value={formData.nama_trip}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Open Trip Gunung Bromo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tanggal Berangkat *
              </label>
              <input
                type="date"
                name="tanggal_berangkat"
                value={formData.tanggal_berangkat}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Durasi (hari) *
              </label>
              <input
                type="number"
                name="durasi"
                value={formData.durasi}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="2"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kuota *
              </label>
              <input
                type="number"
                name="kuota"
                value={formData.kuota}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="20"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Harga per Orang (Rp) *
              </label>
              <input
                type="number"
                name="harga_per_orang"
                value={formData.harga_per_orang}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="500000"
                min="0"
                required
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="dilaksanakan"
                  checked={formData.dilaksanakan === 1}
                  onChange={handleChange}
                  className="mr-2 w-5 h-5 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                />
                Sudah Dilaksanakan
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fasilitas (pisahkan dengan koma)
            </label>
            <input
              type="text"
              name="fasilitas"
              value={formData.fasilitas}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Transportasi, Tenda, Makan 3x, Guide"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Itinerary
            </label>
            <textarea
              name="itinerary"
              value={formData.itinerary}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Hari 1: ... &#10;Hari 2: ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dokumentasi Link (pisahkan dengan koma)
            </label>
            <input
              type="text"
              name="dokumentasi"
              value={formData.dokumentasi}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://photos.com/trip1, https://photos.com/trip2"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
