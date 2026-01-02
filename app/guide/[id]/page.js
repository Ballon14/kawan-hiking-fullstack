'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiGet } from '@/lib/api-client';

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchGuide();
    }
  }, [params.id]);

  async function fetchGuide() {
    try {
      const data = await apiGet(`/api/guides/${params.id}`);
      setGuide(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Memuat data guide...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Guide Tidak Ditemukan</h2>
          <p className="text-slate-400 mb-6">Guide yang Anda cari tidak tersedia</p>
          <button
            onClick={() => router.push('/guide')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
          >
            Kembali ke Daftar Guide
          </button>
        </div>
      </div>
    );
  }

  const sertifikasi = Array.isArray(guide.sertifikasi) 
    ? guide.sertifikasi 
    : (guide.sertifikasi ? [guide.sertifikasi] : []);
  
  const spesialisasi = Array.isArray(guide.spesialisasi)
    ? guide.spesialisasi
    : (guide.spesialisasi ? [guide.spesialisasi] : []);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/guide')}
          className="mb-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Kembali ke Daftar Guide
        </button>

        <div className="bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-700 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Guide Photo */}
            <div className="aspect-square md:aspect-auto bg-slate-700 relative">
              {guide.foto ? (
                <img
                  src={guide.foto}
                  alt={guide.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl">👨‍🏫</span>
                </div>
              )}
            </div>

            {/* Guide Info */}
            <div className="p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{guide.nama}</h1>
              
              {guide.pengalaman && (
                <p className="text-emerald-400 font-semibold mb-6">
                  📅 {guide.pengalaman}
                </p>
              )}

              {/* Bio */}
              {guide.bio && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-3">Tentang</h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {guide.bio}
                  </p>
                </div>
              )}

              {/* Spesialisasi */}
              {spesialisasi.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-3">Spesialisasi</h2>
                  <div className="flex flex-wrap gap-2">
                    {spesialisasi.map((s, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-600/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-600/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sertifikasi */}
              {sertifikasi.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-3">Sertifikasi</h2>
                  <ul className="space-y-2">
                    {sertifikasi.map((cert, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="text-emerald-400 mt-1">✓</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Button */}
              {guide.instagram && (
                <div className="mt-8 pt-6 border-t border-slate-700">
                  <a
                    href={guide.instagram.startsWith('http') ? guide.instagram : `https://www.instagram.com/${guide.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-center font-semibold rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-600/30"
                  >
                    📱 Hubungi via Instagram
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
