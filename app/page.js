'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiGet } from '@/lib/api-client';
import { getImagePath } from '@/lib/image-utils';

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  async function fetchDestinations() {
    try {
      const data = await apiGet('/api/destinations');
      // Get first 2 destinations for homepage
      setDestinations(data.slice(0, 2));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-mountain.png"
            alt="Mountain Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-900/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white drop-shadow-lg">Jelajahi Keindahan</span>
              <br />
              <span className="gradient-text drop-shadow-lg">Alam Indonesia</span>
            </h1>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto drop-shadow-md">
              Temukan pengalaman pendakian terbaik bersama guide berpengalaman. 
              Open Trip & Private Trip untuk semua level pendaki.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-300">
            <Link
              href="/open-trip"
              className="group px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg rounded-2xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-2xl shadow-emerald-600/30 hover-lift hover-glow"
            >
              <span className="flex items-center justify-center gap-2">
                🏔️ Lihat Open Trip
              </span>
            </Link>
            <Link
              href="/private-trip"
              className="px-10 py-5 glass-card text-white font-bold text-lg rounded-2xl hover-lift border-2 border-slate-600 hover:border-emerald-500"
            >
              <span className="flex items-center justify-center gap-2">
                ⛰️ Request Private Trip
              </span>
            </Link>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float z-10">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Destinasi </span>
              <span className="gradient-text">Populer</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Jelajahi keindahan gunung-gunung terbaik Indonesia bersama kami
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {destinations.map((dest) => (
                <div key={dest.id} className="group image-overlay rounded-3xl overflow-hidden card-shine hover-lift animate-scale-in">
                  <div className="relative h-96">
                    {dest.gambar ? (
                      <Image
                        src={getImagePath(dest.gambar, 'destinations')}
                        alt={dest.nama_destinasi}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-8xl">
                        🏔️
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                      <h3 className="text-3xl font-bold text-white mb-2">{dest.nama_destinasi}</h3>
                      <p className="text-emerald-300 font-semibold mb-3">
                        {dest.lokasi} {dest.ketinggian && `- ${dest.ketinggian.toLocaleString()} MDPL`}
                      </p>
                      <p className="text-slate-200 mb-4 line-clamp-2">{dest.deskripsi}</p>
                      <Link 
                        href={`/destinasi/${dest.id}`}
                        className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
                      >
                        Lihat Detail →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/destinasi"
              className="inline-block px-8 py-4 glass-card text-white font-semibold rounded-xl hover-lift border border-emerald-500"
            >
              Lihat Semua Destinasi +
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 animate-fade-in-up">
            <span className="text-white">Kenapa Memilih </span>
            <span className="gradient-text">Kawan Hiking?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-3xl p-8 hover-lift text-center">
              <div className="text-6xl mb-4">🏔️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Guide Berpengalaman</h3>
              <p className="text-slate-300">
                Tim guide profesional dengan pengalaman bertahun-tahun di berbagai gunung Indonesia
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 hover-lift text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-4">Keamanan Terjamin</h3>
              <p className="text-slate-300">
                Dilengkapi asuransi perjalanan dan prosedur keselamatan yang ketat untuk kenyamanan Anda
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 hover-lift text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-white mb-4">Harga Terjangkau</h3>
              <p className="text-slate-300">
                Paket open trip dan private trip dengan harga kompetitif dan fasilitas lengkap
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-800 to-emerald-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Siap Memulai Petualangan?
          </h2>
          <p className="text-xl text-emerald-100 mb-10">
            Daftar sekarang dan rasakan pengalaman pendakian yang tak terlupakan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/open-trip"
              className="px-10 py-5 bg-white text-emerald-900 font-bold text-lg rounded-2xl hover:bg-slate-100 transition-all shadow-2xl hover-lift"
            >
              Lihat Open Trip
            </Link>
            <Link
              href="/private-trip"
              className="px-10 py-5 border-2 border-white text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all hover-lift"
            >
              Request Private Trip
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
