'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function TambahOpenTrip() {
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    id_destinasi: '',
    nama_trip: '',
    tanggal_berangkat: '',
    durasi: '',
    kuota: '',
    harga_per_orang: '',
    fasilitas: '',
    itinerary: '',
    gambar: '',
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  async function fetchDestinations() {
    try {
      const data = await apiGet('/api/destinations');
      setDestinations(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'trips'); // Specify folder

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({ ...prev, gambar: data.url }));
        setImagePreview(data.url);
        showToast.success('Gambar berhasil diupload!');
      } else {
        showToast.error(data.error || 'Gagal upload gambar');
      }
    } catch (err) {
      showToast.error(err.message || 'Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        id_destinasi: formData.id_destinasi,
        nama_trip: formData.nama_trip,
        tanggal_berangkat: formData.tanggal_berangkat,
        durasi: parseInt(formData.durasi),
        kuota: parseInt(formData.kuota),
        harga_per_orang: parseInt(formData.harga_per_orang),
        fasilitas: formData.fasilitas ? formData.fasilitas.split(',').map(s => s.trim()) : [],
        itinerary: formData.itinerary || null,
        gambar: formData.gambar || null,
        pendaftar: 0,
        dilaksanakan: 0,
      };

      await apiPost('/api/open-trips', payload);
      showToast.success('Open Trip berhasil ditambahkan!');
      router.push('/admin/open-trips');
    } catch (error) {
      showToast.error(error.message || 'Gagal menambahkan open trip');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tambah Open Trip</h1>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gambar Trip
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">Max 5MB. Format: JPG, PNG, WEBP</p>
            
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-700"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Destinasi *
              </label>
              <select
                name="id_destinasi"
                value={formData.id_destinasi}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Pilih Destinasi</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.id}>
                    {dest.nama_destinasi}
                  </option>
                ))}
              </select>
            </div>

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
                placeholder="Bromo Sunrise Tour"
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
                placeholder="1500000"
                min="0"
                required
              />
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
              placeholder="Jeep 4x4, Guide, Hotel 1 malam, Makan 2x, Dokumentasi"
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
              placeholder="Hari 1: Surabaya - Bromo (malam)&#10;Hari 2: Sunrise hunting - Kawah - Pulang"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Tambah Open Trip
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
