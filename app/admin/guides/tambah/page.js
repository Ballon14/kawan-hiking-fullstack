'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function TambahGuide() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    pengalaman: '',
    url_foto: '',
    bio: '',
    sertifikasi: '',
    spesialisasi: '',
    instagram: '',
  });

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

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({ ...prev, url_foto: data.url }));
        setImagePreview(data.url);
        showToast.success('Foto berhasil diupload!');
      } else {
        showToast.error(data.error || 'Gagal upload foto');
      }
    } catch (err) {
      showToast.error(err.message || 'Gagal upload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nama: formData.nama,
        pengalaman: parseInt(formData.pengalaman),
        url_foto: formData.url_foto || null,
        bio: formData.bio || null,
        sertifikasi: formData.sertifikasi || null,
        spesialisasi: formData.spesialisasi || null,
        instagram: formData.instagram || null,
      };

      await apiPost('/api/guides', payload);
      showToast.success('Guide berhasil ditambahkan!');
      router.push('/admin/guides');
    } catch (error) {
      showToast.error(error.message || 'Gagal menambahkan guide');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tambah Guide</h1>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Foto Guide
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
                  className="w-32 h-32 object-cover rounded-full border-2 border-slate-700"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nama *
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Budi Santoso"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Pengalaman (tahun) *
              </label>
              <input
                type="number"
                name="pengalaman"
                value={formData.pengalaman}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="10"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Bio singkat guide..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sertifikasi (pisahkan dengan koma)
            </label>
            <input
              type="text"
              name="sertifikasi"
              value={formData.sertifikasi}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Sertifikat Gunung Indonesia, First Aid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Spesialisasi (pisahkan dengan koma)
            </label>
            <input
              type="text"
              name="spesialisasi"
              value={formData.spesialisasi}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Gunung Tinggi, Tracking, Rock Climbing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Instagram
            </label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="@username atau https://instagram.com/username"
            />
            <p className="text-xs text-slate-400 mt-1">Username Instagram guide untuk kontak</p>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Simpan
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
