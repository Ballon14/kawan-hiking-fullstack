'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/api-client';

export default function EditDestinasi() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'destinations');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFormData(prev => ({ ...prev, gambar: data.url }));
      alert('Gambar berhasil diupload!');
    } catch (err) {
      alert(err.message || 'Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    fetchDestination();
  }, []);

  async function fetchDestination() {
    try {
      const data = await apiGet(`/api/destinations/${params.id}`);
      
      setFormData({
        nama_destinasi: data.nama_destinasi || '',
        lokasi: data.lokasi || '',
        ketinggian: data.ketinggian || '',
        kesulitan: data.kesulitan || 'mudah',
        durasi: data.durasi || '',
        deskripsi: data.deskripsi || '',
        gambar: data.gambar || '',
        jalur_pendakian: Array.isArray(data.jalur_pendakian) 
          ? data.jalur_pendakian.join(', ') 
          : (typeof data.jalur_pendakian === 'string' ? JSON.parse(data.jalur_pendakian || '[]').join(', ') : ''),
        fasilitas: Array.isArray(data.fasilitas) 
          ? data.fasilitas.join(', ') 
          : (typeof data.fasilitas === 'string' ? JSON.parse(data.fasilitas || '[]').join(', ') : ''),
        tips: Array.isArray(data.tips) 
          ? data.tips.join(', ') 
          : (typeof data.tips === 'string' ? JSON.parse(data.tips || '[]').join(', ') : ''),
      });
    } catch (err) {
      setError(err.message || 'Gagal memuat data destinasi');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

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

      await apiPut(`/api/destinations/${params.id}`, payload);
      router.push('/admin/destinasi');
    } catch (err) {
      setError(err.message || 'Gagal mengupdate destinasi');
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
        <h1 className="text-3xl font-bold text-white">Edit Destinasi</h1>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gambar Destinasi
              </label>
              <div className="space-y-3">
                {formData.gambar && (
                  <div className="relative w-full h-48 bg-slate-900 rounded-lg overflow-hidden">
                    <img 
                      src={formData.gambar} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex-1 px-4 py-3 bg-emerald-600 text-white text-center font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploading ? '⏳ Uploading...' : '📁 Upload Gambar'}
                  </label>
                </div>
                <p className="text-sm text-slate-400">Max 2MB. Format: JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>

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
