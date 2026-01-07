'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiGet } from '@/lib/api-client';
import { getImagePath } from '@/lib/image-utils';

export default function OpenTripPage() {
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, price, name
  
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [tripsData, destinationsData] = await Promise.all([
        apiGet('/api/open-trips'),
        apiGet('/api/destinations')
      ]);
      setTrips(tripsData);
      setDestinations(destinationsData);
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
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTripStatus = (trip) => {
    const today = new Date();
    const tripDate = new Date(trip.tanggal_berangkat);
    
    if (trip.dilaksanakan === 1) {
      return { status: 'completed', label: 'Selesai', color: 'bg-slate-600/20 text-slate-400' };
    } else if (tripDate < today) {
      return { status: 'past', label: 'Lewat', color: 'bg-slate-600/20 text-slate-400' };
    } else if (trip.pendaftar >= trip.kuota) {
      return { status: 'full', label: 'Penuh', color: 'bg-red-600/20 text-red-400' };
    } else {
      return { status: 'available', label: 'Tersedia', color: 'bg-green-600/20 text-green-400' };
    }
  };

  // Filter and sort trips
  const filteredAndSortedTrips = trips
    .filter(trip => {
      const matchesSearch = trip.nama_trip?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDestination = !selectedDestination || String(trip.id_destinasi) === String(selectedDestination);
      const matchesMinPrice = !minPrice || trip.harga_per_orang >= parseInt(minPrice);
      const matchesMaxPrice = !maxPrice || trip.harga_per_orang <= parseInt(maxPrice);
      
      return matchesSearch && matchesDestination && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.harga_per_orang - b.harga_per_orang;
        case 'name':
          return a.nama_trip.localeCompare(b.nama_trip);
        case 'date':
        default:
          return new Date(a.tanggal_berangkat) - new Date(b.tanggal_berangkat);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Memuat open trip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hiking-trail-hero.png"
            alt="Hiking Trail"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-emerald-900/80 to-slate-900/90"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center z-10 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white drop-shadow-lg">Open Trip</span>
            <br />
            <span className="gradient-text drop-shadow-lg">Petualangan Bersama</span>
          </h1>
          <p className="text-xl text-slate-200 mb-8 max-w-3xl mx-auto drop-shadow-md">
            Bergabung dengan pendaki lainnya dan nikmati pengalaman mendaki yang tak terlupakan dengan harga terjangkau
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Cari trip..."
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />

            {/* Destination Filter */}
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="">📍 Semua Destinasi</option>
              {destinations.map(dest => (
                <option key={dest.id} value={dest.id}>{dest.nama_destinasi}</option>
              ))}
            </select>

            {/* Min Price */}
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="💰 Harga Min"
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />

            {/* Max Price */}
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="💰 Harga Max"
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="date">📅 Terdekat</option>
              <option value="price">💵 Termurah</option>
              <option value="name">🔤 Nama A-Z</option>
            </select>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || selectedDestination || minPrice || maxPrice) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-slate-400">Filter aktif:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded-full text-sm">
                  "{searchQuery}"
                </span>
              )}
              {selectedDestination && (
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded-full text-sm">
                  {destinations.find(d => d.id === parseInt(selectedDestination))?.nama_destinasi}
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded-full text-sm">
                  {minPrice && maxPrice ? `Rp ${parseInt(minPrice).toLocaleString()} - Rp ${parseInt(maxPrice).toLocaleString()}` :
                   minPrice ? `≥ Rp ${parseInt(minPrice).toLocaleString()}` :
                   `≤ Rp ${parseInt(maxPrice).toLocaleString()}`}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDestination('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-sm hover:bg-red-600/30 transition-colors"
              >
                ✕ Reset
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <p className="text-slate-400">
              Menampilkan <span className="text-emerald-400 font-semibold">{filteredAndSortedTrips.length}</span> trip
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSortedTrips.map((trip, index) => {
              const tripStatus = getTripStatus(trip);
              const destination = destinations.find(d => d.id === trip.id_destinasi);
              
              return (
                <div
                  key={trip.id}
                  className="glass-card rounded-3xl overflow-hidden card-shine hover-lift animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Trip Image */}
                  <div className="relative h-48 image-overlay">
                    {trip.gambar ? (
                      <Image
                        src={getImagePath(trip.gambar, 'trips')}
                        alt={trip.nama_trip}
                        fill
                        className="object-cover"
                      />
                    ) : destination?.gambar ? (
                      <Image
                        src={getImagePath(destination.gambar, 'destinations')}
                        alt={trip.nama_trip}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                        <span className="text-6xl">🏔️</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${tripStatus.color}`}>
                        {tripStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {trip.nama_trip}
                    </h3>
                    
                    {destination && (
                      <p className="text-emerald-400 text-sm mb-4 font-semibold">
                        📍 {destination.nama_destinasi}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center text-slate-300">
                        <span className="w-6">📅</span>
                        <span>{formatDate(trip.tanggal_berangkat)}</span>
                      </div>
                      <div className="flex items-center text-slate-300">
                        <span className="w-6">⏱️</span>
                        <span>{trip.durasi} hari</span>
                      </div>
                      <div className="flex items-center text-slate-300">
                        <span className="w-6">👥</span>
                        <span>{trip.pendaftar || 0}/{trip.kuota} peserta</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {tripStatus.status === 'available' && (
                      <div className="mb-4">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${((trip.pendaftar || 0) / trip.kuota) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-3xl font-bold gradient-text">
                        {formatPrice(trip.harga_per_orang)}
                      </div>
                      <div className="text-sm text-slate-400">per orang</div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/open-trip/${trip.id}`}
                      className={`block w-full py-3 text-center rounded-xl font-semibold transition-all ${
                        tripStatus.status === 'available'
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-700 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {tripStatus.status === 'available' ? '🎒 Lihat Detail & Daftar' : 'Lihat Detail'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredAndSortedTrips.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">Tidak ada trip ditemukan</h3>
              <p className="text-slate-400 mb-6">Coba ubah filter pencarian Anda</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDestination('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
