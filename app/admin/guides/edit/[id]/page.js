'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function EditGuide() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    bio: '',
    pengalaman: '',
    sertifikasi: '',
    foto: '',
    spesialisasi: '',
    instagram: '',
  });

  useEffect(() => {
    fetchGuide();
  }, []);

  async function fetchGuide() {
    try {
      const data = await apiGet(`/api/guides/${params.id}`);
      
      setFormData({
        nama: data.nama || '',
        bio: data.bio || '',
        pengalaman: data.pengalaman || '',
        sertifikasi: Array.isArray(data.sertifikasi) 
          ? data.sertifikasi.join(', ') 
          : (typeof data.sertifikasi === 'string' ? JSON.parse(data.sertifikasi || '[]').join(', ') : ''),
        foto: data.foto || '',
        spesialisasi: Array.isArray(data.spesialisasi) 
          ? data.spesialisasi.join(', ') 
          : (typeof data.spesialisasi === 'string' ? JSON.parse(data.spesialisasi || '[]').join(', ') : ''),
        instagram: data.instagram || '',
      });

      if (data.foto) {
        setImagePreview(data.foto);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data guide');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'guides');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: uploadFormData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({ ...prev, foto: data.url }));
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
    setError('');
    setSaving(true);

    try {
      const payload = {
        nama: formData.nama,
        bio: formData.bio?.trim() || null,
        pengalaman: formData.pengalaman || null,
        sertifikasi: formData.sertifikasi 
          ? formData.sertifikasi.split(',').map(s => s.trim()).filter(s => s) 
          : [],
        foto: formData.foto || null,
        spesialisasi: formData.spesialisasi 
          ? formData.spesialisasi.split(',').map(s => s.trim()).filter(s => s) 
          : [],
        instagram: formData.instagram?.trim() || null,
      };

      await apiPut(`/api/guides/${params.id}`, payload);
      showToast.success('Guide berhasil diupdate!');
      router.push('/admin/guides');
    } catch (err) {
      setError(err.message || 'Gagal mengupdate guide');
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
        <h1 className="text-3xl font-bold text-white">Edit Guide</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Foto Guide
            </label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 disabled:opacity-50"
                />
                <p className="text-xs text-slate-400 mt-1">Max 5MB. Format: JPG, PNG, WEBP</p>
              </div>
              {uploading && (
                <div className="text-emerald-400 text-sm">Uploading...</div>
              )}
            </div>
            
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
                Pengalaman (tahun)
              </label>
              <input
                type="number"
                name="pengalaman"
                value={formData.pengalaman}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="10"
                min="0"
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
