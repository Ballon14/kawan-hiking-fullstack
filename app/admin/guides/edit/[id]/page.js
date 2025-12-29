'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/api-client';

export default function EditGuide() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama: '',
    bio: '',
    pengalaman: '',
    sertifikasi: '',
    foto: '',
    spesialisasi: '',
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
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        nama: formData.nama,
        bio: formData.bio || null,
        pengalaman: formData.pengalaman || null,
        sertifikasi: formData.sertifikasi ? formData.sertifikasi.split(',').map(s => s.trim()) : [],
        foto: formData.foto || null,
        spesialisasi: formData.spesialisasi ? formData.spesialisasi.split(',').map(s => s.trim()) : [],
      };

      await apiPut(`/api/guides/${params.id}`, payload);
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
                Pengalaman
              </label>
              <input
                type="text"
                name="pengalaman"
                value={formData.pengalaman}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="10 tahun"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL Foto
              </label>
              <input
                type="text"
                name="foto"
                value={formData.foto}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://example.com/photo.jpg"
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
