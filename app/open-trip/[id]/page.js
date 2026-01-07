'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api-client';
import { getImagePath } from '@/lib/image-utils';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import ReviewSection from '@/components/ReviewSection';

export default function OpenTripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTripDetail();
    }
  }, [params.id]);

  async function fetchTripDetail() {
    try {
      const tripData = await apiGet(`/api/open-trips/${params.id}`);
      setTrip(tripData);
      
      if (tripData.id_destinasi) {
        const destData = await apiGet(`/api/destinations/${tripData.id_destinasi}`);
        setDestination(destData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleRegister = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setRegistering(true);
    try {
      await apiPost(`/api/open-trips/${trip.id}/register`, {
        jumlah_peserta: 1 // Default 1 participant, can be customized later
      });
      showToast.success('Berhasil mendaftar! Silakan lanjutkan ke pembayaran.');
      router.push(`/payment/open-trip/${trip.id}`); // Redirect to payment
    } catch (error) {
      console.error('Error:', error);
      showToast.error(error.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setRegistering(false);
    }
  };

  const getTripStatus = () => {
    if (!trip) return null;
    
    const today = new Date();
    const tripDate = new Date(trip.tanggal_berangkat);
    
    if (trip.dilaksanakan === 1) {
      return { status: 'completed', label: 'Trip Selesai', color: 'bg-slate-600/20 text-slate-400', canRegister: false };
    } else if (tripDate < today) {
      return { status: 'past', label: 'Trip Lewat', color: 'bg-slate-600/20 text-slate-400', canRegister: false };
    } else if (trip.pendaftar >= trip.kuota) {
      return { status: 'full', label: 'Kuota Penuh', color: 'bg-red-600/20 text-red-400', canRegister: false };
    } else {
      return { status: 'available', label: 'Tersedia', color: 'bg-green-600/20 text-green-400', canRegister: true };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Memuat detail trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Trip Tidak Ditemukan</h2>
          <p className="text-slate-400 mb-6">Trip yang Anda cari tidak tersedia</p>
          <Link href="/open-trip" className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold">
            Kembali ke Open Trip
          </Link>
        </div>
      </div>
    );
  }

  const status = getTripStatus();

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          {(trip.gambar || destination?.gambar) ? (
            <img
              src={trip.gambar ? getImagePath(trip.gambar, 'trips') : getImagePath(destination.gambar, 'destinations')}
              alt={trip.nama_trip}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div 
            className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800"
            style={{ display: (trip.gambar || destination?.gambar) ? 'none' : 'block' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        </div>

        {/* Breadcrumb & Status */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 lg:p-8 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/open-trip" className="flex items-center text-white hover:text-emerald-400 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Open Trip
            </Link>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Trip Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 z-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {trip.nama_trip}
            </h1>
            {destination && (
              <p className="text-xl text-emerald-300 font-semibold flex items-center">
                <span className="mr-2">📍</span>
                {destination.nama_destinasi}
                {destination.ketinggian && ` - ${destination.ketinggian} MDPL`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Trip Info Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-sm text-slate-400 mb-1">Tanggal</div>
                  <div className="text-white font-semibold">{formatDate(trip.tanggal_berangkat)}</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-sm text-slate-400 mb-1">Durasi</div>
                  <div className="text-white font-semibold">{trip.durasi} Hari</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-sm text-slate-400 mb-1">Peserta</div>
                  <div className="text-white font-semibold">{trip.pendaftar || 0}/{trip.kuota}</div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${((trip.pendaftar || 0) / trip.kuota) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {trip.deskripsi && (
                <div className="glass-card rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Deskripsi Trip</h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{trip.deskripsi}</p>
                </div>
              )}

              {/* Destination Info */}
              {destination && (
                <div className="glass-card rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Tentang Destinasi</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🏔️</span>
                      <div>
                        <div className="text-white font-semibold">Nama</div>
                        <div className="text-slate-300">{destination.nama_destinasi}</div>
                      </div>
                    </div>
                    {destination.lokasi && (
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">📍</span>
                        <div>
                          <div className="text-white font-semibold">Lokasi</div>
                          <div className="text-slate-300">{destination.lokasi}</div>
                        </div>
                      </div>
                    )}
                    {destination.ketinggian && (
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">📏</span>
                        <div>
                          <div className="text-white font-semibold">Ketinggian</div>
                          <div className="text-slate-300">{destination.ketinggian} MDPL</div>
                        </div>
                      </div>
                    )}
                    {destination.kesulitan && (
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">⚡</span>
                        <div>
                          <div className="text-white font-semibold">Tingkat Kesulitan</div>
                          <div className="text-slate-300 capitalize">{destination.kesulitan}</div>
                        </div>
                      </div>
                    )}
                    {destination.deskripsi && (
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <p className="text-slate-300 leading-relaxed">{destination.deskripsi}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-3xl p-8 sticky top-24">
                <div className="mb-6">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {formatPrice(trip.harga_per_orang)}
                  </div>
                  <div className="text-slate-400">per orang</div>
                </div>

                <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-semibold ${status.canRegister ? 'text-green-400' : 'text-slate-400'}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Slot Tersedia</span>
                    <span className="text-white font-semibold">
                      {trip.kuota - (trip.pendaftar || 0)} / {trip.kuota}
                    </span>
                  </div>
                </div>

                {status.canRegister ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg rounded-2xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-2xl shadow-emerald-600/30 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Mendaftar...
                      </span>
                    ) : (
                      '🎒 Daftar Sekarang'
                    )}
                  </button>
                ) : (
                  <div className="w-full py-4 bg-slate-700 text-slate-400 font-bold text-lg rounded-2xl text-center cursor-not-allowed">
                    Tidak Dapat Mendaftar
                  </div>
                )}

                {!user && status.canRegister && (
                  <p className="text-center text-slate-400 text-sm mt-4">
                    Anda akan diarahkan ke halaman login
                  </p>
                )}

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-white font-bold mb-3">Yang Termasuk:</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start">
                      <span className="mr-2">✅</span>
                      <span>Guide berpengalaman</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✅</span>
                      <span>Izin pendakian</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✅</span>
                      <span>Asuransi perjalanan</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✅</span>
                      <span>Dokumentasi</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <ReviewSection tripId={trip.id} tripType="open_trip" />
        </div>
      </section>
    </div>
  );
}
