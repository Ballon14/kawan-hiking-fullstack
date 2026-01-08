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
    users: 0,
    registrations: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [destinations, openTrips, privateTrips, guides, users, registrations] = await Promise.all([
        apiGet('/api/destinations').catch(() => []),
        apiGet('/api/open-trips').catch(() => []),
        apiGet('/api/private-trips').catch(() => []),
        apiGet('/api/guides').catch(() => []),
        apiGet('/api/admin/users').catch(() => []),
        apiGet('/api/open-trips/registrations').catch(() => []),
      ]);
      
      setStats({
        destinations: destinations?.length || 0,
        openTrips: openTrips?.length || 0,
        privateTrips: privateTrips?.length || 0,
        guides: guides?.length || 0,
        users: users?.length || 0,
        registrations: registrations?.length || 0,
      });
      
      // Get recent registrations
      if (registrations && registrations.length > 0) {
        setRecentRegistrations(registrations.slice(0, 5));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 mt-6 animate-pulse">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Destinasi', 
      value: stats.destinations, 
      icon: '🏔️', 
      gradient: 'from-emerald-500 via-emerald-600 to-teal-700',
      shadowColor: 'shadow-emerald-500/25',
      href: '/admin/destinasi',
      description: 'Total destinasi hiking'
    },
    { 
      label: 'Open Trips', 
      value: stats.openTrips, 
      icon: '🎒', 
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      shadowColor: 'shadow-blue-500/25',
      href: '/admin/open-trips',
      description: 'Trip yang tersedia'
    },
    { 
      label: 'Private Trips', 
      value: stats.privateTrips, 
      icon: '🚶', 
      gradient: 'from-purple-500 via-purple-600 to-violet-700',
      shadowColor: 'shadow-purple-500/25',
      href: '/admin/private-trips',
      description: 'Request private trip'
    },
    { 
      label: 'Guides', 
      value: stats.guides, 
      icon: '👨‍🏫', 
      gradient: 'from-amber-500 via-orange-500 to-orange-600',
      shadowColor: 'shadow-amber-500/25',
      href: '/admin/guides',
      description: 'Pemandu pendakian'
    },
    { 
      label: 'Users', 
      value: stats.users, 
      icon: '👥', 
      gradient: 'from-pink-500 via-rose-500 to-red-600',
      shadowColor: 'shadow-pink-500/25',
      href: '/admin/users',
      description: 'Pengguna terdaftar'
    },
    { 
      label: 'Pendaftar', 
      value: stats.registrations, 
      icon: '📋', 
      gradient: 'from-cyan-500 via-teal-500 to-emerald-600',
      shadowColor: 'shadow-cyan-500/25',
      href: '/admin/orders',
      description: 'Total pendaftaran trip'
    },
  ];

  const quickActions = [
    { label: 'Tambah Destinasi', icon: '🏔️', subIcon: '+', href: '/admin/destinasi/tambah', color: 'emerald', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', hoverBg: 'hover:bg-emerald-500/20' },
    { label: 'Tambah Open Trip', icon: '🎒', subIcon: '+', href: '/admin/open-trips/tambah', color: 'blue', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', hoverBg: 'hover:bg-blue-500/20' },
    { label: 'Kelola Pesanan', icon: '📦', href: '/admin/orders', color: 'purple', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', hoverBg: 'hover:bg-purple-500/20' },
    { label: 'Tambah Guide', icon: '👨‍🏫', subIcon: '+', href: '/admin/guides/tambah', color: 'amber', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', hoverBg: 'hover:bg-amber-500/20' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 p-6 md:p-8 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <span className="text-2xl">⛰️</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard Admin</h1>
              <p className="text-slate-400 text-sm md:text-base">Kelola Kawan Hiking dengan mudah</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards - Premium Design */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`relative overflow-hidden rounded-2xl p-4 md:p-5 bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadowColor} transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl`}>
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-3xl md:text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {card.value}
                </div>
                <h3 className="text-white/90 font-medium text-xs md:text-sm">{card.label}</h3>
              </div>
              
              {/* Hover Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions - Left Side */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <h2 className="text-lg font-bold text-white">Quick Actions</h2>
            </div>
            
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex items-center gap-4 p-4 rounded-xl ${action.bgColor} border ${action.borderColor} ${action.hoverBg} transition-all duration-200 group`}
                >
                  <div className="relative">
                    <span className="text-2xl">{action.icon}</span>
                    {action.subIcon && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {action.subIcon}
                      </span>
                    )}
                  </div>
                  <span className={`text-${action.color}-400 font-medium text-sm group-hover:translate-x-1 transition-transform`}>
                    {action.label}
                  </span>
                  <svg className={`w-4 h-4 text-${action.color}-400/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Registrations - Right Side */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-slate-700/50 h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <h2 className="text-lg font-bold text-white">Pendaftaran Terbaru</h2>
              </div>
              <Link href="/admin/orders" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                Lihat Semua →
              </Link>
            </div>
            
            {recentRegistrations.length > 0 ? (
              <div className="space-y-3">
                {recentRegistrations.map((reg, idx) => (
                  <div 
                    key={reg.id} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-700/50 hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                      {(reg.username || reg.nama || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm truncate">{reg.nama_trip}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          reg.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {reg.payment_status === 'paid' ? 'Lunas' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs truncate">@{reg.username || 'user'} • {formatDate(reg.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold text-sm">Rp {formatPrice(reg.total_harga)}</p>
                      <p className="text-slate-500 text-xs">{reg.jumlah_peserta || 1} peserta</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3 opacity-50">📋</div>
                <p className="text-slate-400 text-sm">Belum ada pendaftaran</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 border border-emerald-500/20 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-2xl">💡</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Tips Admin</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Gunakan menu di sidebar untuk navigasi cepat. Pastikan untuk selalu mengkonfirmasi pendaftaran dan update status pembayaran secara berkala untuk pengalaman pengguna yang lebih baik.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-xs font-medium">Sistem Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
