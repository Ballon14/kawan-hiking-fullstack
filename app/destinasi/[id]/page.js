'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';

export default function DetailDestinasiPage({ params }) {
  const { id } = use(params);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestination();
  }, [id]);

  async function fetchDestination() {
    try {
      const data = await apiGet(`/api/destinations/${id}`);
      setDestination(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl text-white mb-4">Destinasi tidak ditemukan</h1>
        <Link href="/destinasi" className="text-emerald-400 hover:underline">
          Kembali ke daftar destinasi
        </Link>
      </div>
    );
  }

  const fasilitas = destination.fasilitas ? JSON.parse(destination.fasilitas) : [];
  const tips = destination.tips ? JSON.parse(destination.tips) : [];
  const jalur = destination.jalur_pendakian ? JSON.parse(destination.jalur_pendakian) : [];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/destinasi" className="text-emerald-400 hover:underline mb-6 inline-block">
          ← Kembali
        </Link>

        {/* Header */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="aspect-video bg-slate-700 relative">
            {destination.gambar ? (
              <img
                src={destination.gambar}
                alt={destination.nama_destinasi}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🏔️</div>
            )}
          </div>
          
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">{destination.nama_destinasi}</h1>
            {destination.lokasi && (
              <p className="text-slate-400 mb-4">📍 {destination.lokasi}</p>
            )}
            
            <div className="flex flex-wrap gap-3 mb-6">
              {destination.ketinggian && (
                <span className="px-4 py-2 bg-slate-700 rounded-lg text-sm text-slate-300">
                  ⛰️ {destination.ketinggian} mdpl
                </span>
              )}
              {destination.kesulitan && (
                <span className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm">
                  📊 {destination.kesulitan}
                </span>
              )}
              {destination.durasi && (
                <span className="px-4 py-2 bg-slate-700 rounded-lg text-sm text-slate-300">
                  ⏱️ {destination.durasi}
                </span>
              )}
            </div>

            {destination.deskripsi && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-3">Deskripsi</h2>
                <p className="text-slate-300 leading-relaxed">{destination.deskripsi}</p>
              </div>
            )}

            {fasilitas.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-3">Fasilitas</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {fasilitas.map((f, i) => (
                    <li key={i} className="text-slate-300 flex items-center">
                      <span className="text-emerald-400 mr-2">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tips.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-3">Tips Pendakian</h2>
                <ul className="space-y-2">
                  {tips.map((t, i) => (
                    <li key={i} className="text-slate-300 flex items-start">
                      <span className="text-amber-400 mr-2">💡</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
