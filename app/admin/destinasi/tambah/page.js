'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api-client';
import ImageUpload from '@/components/ImageUpload';

export default function TambahDestinasi() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama_destinasi: '',
    lokasi: '',
    ketinggian: '',
    kesulitan: 'mudah',
    durasi: '',
    deskripsi: '',
    gambar: '',
    jalur_pendakian: '',
    fasilitas: '',
    tips: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        nama_destinasi: formData.nama_destinasi,
        lokasi: formData.lokasi || null,
        ketinggian: formData.ketinggian ? parseInt(formData.ketinggian) : null,
        kesulitan: formData.kesulitan || null,
        durasi: formData.durasi || null,
        deskripsi: formData.deskripsi || null,
        gambar: formData.gambar || null,
        jalur_pendakian: formData.jalur_pendakian ? formData.jalur_pendakian.split(',').map(s => s.trim()) : [],
        fasilitas: formData.fasilitas ? formData.fasilitas.split(',').map(s => s.trim()) : [],
        tips: formData.tips ? formData.tips.split(',').map(s => s.trim()) : [],
      };

      await apiPost('/api/destinations', payload);
      router.push('/admin/destinasi');
    } catch (err) {
      setError(err.message || 'Gagal menambahkan destinasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tambah Destinasi</h1>
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
                Nama Destinasi *
              </label>
              <input
                type="text"
                name="nama_destinasi"
                value={formData.nama_destinasi}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Gunung Bromo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lokasi
              </label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Jawa Timur"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ketinggian (mdpl)
              </label>
              <input
                type="number"
                name="ketinggian"
                value={formData.ketinggian}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="2329"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kesulitan
              </label>
              <select
                name="kesulitan"
                value={formData.kesulitan}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Durasi
              </label>
              <input
                type="text"
                name="durasi"
                value={formData.durasi}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="2 hari 1 malam"
              />
            </div>
          </div>

          <ImageUpload
            value={formData.gambar}
            onChange={(url) => setFormData(prev => ({ ...prev, gambar: url }))}
            label="Gambar Destinasi"
            type="destinations"
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Deskripsi destinasi..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Jalur Pendakian (pisahkan dengan koma)
            </label>
            <input
              type="text"
              name="jalur_pendakian"
              value={formData.jalur_pendakian}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Cemoro Lawang, Cemoro Sari"
            />
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
              placeholder="Toilet, Warung, Mushola"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tips (pisahkan dengan koma)
            </label>
            <input
              type="text"
              name="tips"
              value={formData.tips}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Bawa jaket tebal, Persiapkan kondisi fisik"
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
