'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';

export default function GuidePage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  async function fetchGuides() {
    try {
      const data = await apiGet('/api/guides');
      setGuides(data);
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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Guide Kami</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Guide profesional dan berpengalaman yang akan memandu petualangan Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => {
            const spesialisasi = guide.spesialisasi ? JSON.parse(guide.spesialisasi) : [];
            
            return (
              <Link
                key={guide.id}
                href={`/guide/${guide.id}`}
                className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-colors group"
              >
                <div className="aspect-square bg-slate-700 relative">
                  {guide.foto ? (
                    <img
                      src={guide.foto}
                      alt={guide.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">👨‍🏫</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {guide.nama}
                  </h3>
                  {guide.pengalaman && (
                    <p className="text-slate-400 text-sm mt-1">📅 {guide.pengalaman}</p>
                  )}
                  {spesialisasi.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {spesialisasi.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {guides.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Belum ada guide tersedia
          </div>
        )}
      </div>
    </div>
  );
}
