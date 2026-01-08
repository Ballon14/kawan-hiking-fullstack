'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊', description: 'Overview & Statistik' },
    { href: '/admin/destinasi', label: 'Destinasi', icon: '🏔️', description: 'Kelola destinasi' },
    { href: '/admin/open-trips', label: 'Open Trips', icon: '🎒', description: 'Trip reguler' },
    { href: '/admin/private-trips', label: 'Private Trips', icon: '🚶', description: 'Request private' },
    { href: '/admin/orders', label: 'Pesanan', icon: '📦', description: 'Manajemen pesanan' },
    { href: '/admin/guides', label: 'Guides', icon: '👨‍🏫', description: 'Pemandu hiking' },
    { href: '/admin/users', label: 'Users', icon: '👥', description: 'Manajemen user' },
    { href: '/admin/chat', label: 'Chat', icon: '💬', description: 'Pesan & support' },
  ];

  const isActive = (href) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/80 z-50 overflow-hidden transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-5 border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                  <span className="text-xl">⛰️</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Kawan Hiking</h2>
                  <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Admin Panel</p>
                </div>
              </Link>
              <button
                onClick={onClose}
                className="lg:hidden w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-3 mb-3">Menu Utama</p>
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    active
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                  )}
                  
                  <span className={`text-xl transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm block">{item.label}</span>
                    <span className={`text-[10px] block truncate ${active ? 'text-white/70' : 'text-slate-500'}`}>
                      {item.description}
                    </span>
                  </div>
                  
                  {/* Hover Arrow */}
                  {!active && (
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-slate-800/50">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-medium text-sm">Kembali ke Website</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Get current page title
  const getPageTitle = () => {
    const titles = {
      '/admin/dashboard': 'Dashboard',
      '/admin/destinasi': 'Destinasi',
      '/admin/open-trips': 'Open Trips',
      '/admin/private-trips': 'Private Trips',
      '/admin/orders': 'Pesanan',
      '/admin/guides': 'Guides',
      '/admin/users': 'Users',
      '/admin/chat': 'Chat',
    };
    for (const [path, title] of Object.entries(titles)) {
      if (pathname.startsWith(path)) return title;
    }
    return 'Admin';
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-500">Admin</span>
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white font-medium">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-white">{user?.nama || 'Admin'}</p>
                <p className="text-xs text-slate-400">{user?.role || 'Administrator'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                {(user?.nama || 'A').charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
              aria-label="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-slate-950">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content with left margin for fixed sidebar */}
        <div className="lg:ml-72 flex flex-col min-h-screen">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
