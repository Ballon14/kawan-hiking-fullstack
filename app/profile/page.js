'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPut } from '@/lib/api-client';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    nomor_hp: '',
    alamat: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const data = await apiGet('/api/auth/profile');
      setProfile(data);
      setFormData({
        email: data.email || '',
        nomor_hp: data.nomor_hp || '',
        alamat: data.alamat || '',
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiPut('/api/auth/profile', formData);
      await fetchProfile();
      setEditing(false);
      alert('Profile berhasil diupdate!');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Gagal update profile');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Profile tidak ditemukan</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white font-bold">
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
          <span 
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              profile.role === 'admin' 
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/40' 
                : 'bg-blue-600/20 text-blue-400 border border-blue-600/40'
            }`}
          >
            {profile.role === 'admin' ? '👑 Admin' : '👤 User'}
          </span>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Informasi Profile</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      email: profile.email || '',
                      nomor_hp: profile.nomor_hp || '',
                      alamat: profile.alamat || '',
                    });
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
              <input
                type="text"
                value={profile.username}
                disabled
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white cursor-not-allowed opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-60 disabled:cursor-not-allowed focus:border-emerald-500 focus:outline-none"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Nomor HP</label>
              <input
                type="tel"
                value={formData.nomor_hp}
                onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-60 disabled:cursor-not-allowed focus:border-emerald-500 focus:outline-none"
                placeholder="08123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Alamat</label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                disabled={!editing}
                rows={3}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-60 disabled:cursor-not-allowed focus:border-emerald-500 focus:outline-none resize-none"
                placeholder="Alamat lengkap"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          <h3 className="text-xl font-bold text-white mb-4">Aksi</h3>
          <div className="space-y-3">
            {profile.role === 'admin' && (
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                👑 Admin Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
