'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiGet } from '@/lib/api-client';
import ImageUpload from '@/components/ImageUpload';

export default function TambahOpenTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    nama_trip: '',
    tanggal_berangkat: '',
    durasi: '',
    kuota: '',
    harga_per_orang: '',
    gambar: '',
    fasilitas: '',
    itinerary: '',
    dokumentasi: '',
    dilaksanakan: 0,
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  async function fetchDestinations() {
    try {
      const data = await apiGet('/api/destinations');
      setDestinations(data);
    } catch (err) {
      console.error('Failed to load destinations:', err);
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
    setLoading(true);

    try {
      const payload = {
        nama_trip: formData.nama_trip,
        tanggal_berangkat: formData.tanggal_berangkat,
        durasi: parseInt(formData.durasi),
        kuota: parseInt(formData.kuota),
        harga_per_orang: parseInt(formData.harga_per_orang),
        gambar: formData.gambar || null,
        fasilitas: formData.fasilitas ? formData.fasilitas.split(',').map(s => s.trim()) : [],
        itinerary: formData.itinerary || null,
        dokumentasi: formData.dokumentasi ? formData.dokumentasi.split(',').map(s => s.trim()) : [],
        dilaksanakan: formData.dilaksanakan,
      };

      await apiPost('/api/open-trips', payload);
      router.push('/admin/open-trips');
    } catch (err) {
      setError(err.message || 'Gagal menambahkan open trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tambah Open Trip</h1>
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

          <ImageUpload
            value={formData.gambar}
            onChange={(url) => setFormData(prev => ({ ...prev, gambar: url }))}
            label="Gambar Trip"
            type="trips"
          />

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
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
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
