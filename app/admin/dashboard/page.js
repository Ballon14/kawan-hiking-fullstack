'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    destinations: 0,
    openTrips: 0,
    privateTrips: 0,
    guides: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [destinations, openTrips, privateTrips, guides] = await Promise.all([
        apiGet('/api/destinations'),
        apiGet('/api/open-trips'),
        apiGet('/api/private-trips'),
        apiGet('/api/guides'),
      ]);
      
      setStats({
        destinations: destinations.length,
        openTrips: openTrips.length,
        privateTrips: privateTrips.length,
        guides: guides.length,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Destinasi', value: stats.destinations, icon: '🏔️', gradient: 'from-emerald-600 to-emerald-700', href: '/admin/destinasi' },
    { label: 'Open Trips', value: stats.openTrips, icon: '🎒', gradient: 'from-blue-600 to-blue-700', href: '/admin/open-trips' },
    { label: 'Private Trips', value: stats.privateTrips, icon: '🚶', gradient: 'from-purple-600 to-purple-700', href: '/admin/private-trips' },
    { label: 'Guides', value: stats.guides, icon: '👨‍🏫', gradient: 'from-amber-600 to-amber-700', href: '/admin/guides' },
  ];

  const quickActions = [
    { label: 'Tambah Destinasi', icon: '➕🏔️', href: '/admin/destinasi/tambah', color: 'emerald' },
    { label: 'Tambah Open Trip', icon: '➕🎒', href: '/admin/open-trips/tambah', color: 'blue' },
    { label: 'Lihat Pendaftar', icon: '📋', href: '/admin/open-trips/registrations', color: 'purple' },
    { label: 'Tambah Guide', icon: '➕👨‍🏫', href: '/admin/guides/tambah', color: 'amber' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview dan statistik Kawan Hiking</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link
            key={card.label}
            href={card.href}
            className="group animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${card.gradient} hover-lift transition-all cursor-pointer`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl">{card.icon}</span>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white">
                      {card.value}
                    </div>
                  </div>
                </div>
                <h3 className="text-white/90 font-semibold text-lg">{card.label}</h3>
              </div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center p-6 rounded-2xl bg-${action.color}-600/10 border border-${action.color}-600/30 hover:bg-${action.color}-600/20 transition-all hover-lift`}
            >
              <span className="text-4xl mb-3">{action.icon}</span>
              <span className={`text-${action.color}-400 font-semibold text-center`}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Welcome Card */}
      <div className="glass-card rounded-3xl p-8 border border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="text-5xl">👋</div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Selamat Datang di Admin Panel</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Kelola semua aspek Kawan Hiking dari sini. Gunakan menu di sebelah kiri untuk navigasi,
              atau gunakan quick actions di atas untuk akses cepat ke fitur yang sering digunakan.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Responsive Design</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Easy Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
