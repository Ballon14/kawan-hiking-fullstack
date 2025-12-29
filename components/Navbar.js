'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/destinasi', label: 'Destinasi' },
    { href: '/open-trip', label: 'Open Trip' },
    { href: '/private-trip', label: 'Private Trip' },
    { href: '/guide', label: 'Guide' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <nav className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏔️</span>
            <span className="font-bold text-xl text-emerald-400">Kawan Hiking</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <span className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span>{user.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/my-trip"
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Trip Saya
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-emerald-400 hover:bg-slate-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-slate-700" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive(link.href)
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-slate-700" />
            {user ? (
              <>
                <Link href="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                  Profil Saya
                </Link>
                <Link href="/my-trip" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                  Trip Saya
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-emerald-400 hover:bg-slate-700">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                  Masuk
                </Link>
                <Link href="/register" className="block px-4 py-2 text-sm text-emerald-400 hover:bg-slate-700">
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
