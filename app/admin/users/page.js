'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);

  async function fetchUsers() {
    try {
      const data = await apiGet('/api/admin/users');
      setUsers(data || []);
      
      // Calculate stats
      const total = data.length;
      const admins = data.filter(u => u.role === 'admin').length;
      const regularUsers = data.filter(u => u.role === 'user').length;
      setStats({ total, admins, users: regularUsers });
    } catch (error) {
      showToast.error('Gagal memuat data users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterUsers() {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nama?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }

  async function handleDelete(userId, username) {
    if (!confirm(`Hapus user "${username}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      showToast.success('User berhasil dihapus');
      await fetchUsers();
    } catch (error) {
      showToast.error(error.message || 'Gagal menghapus user');
    }
  }

  function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function getRoleBadge(role) {
    if (role === 'admin') {
      return 'bg-purple-600/20 text-purple-400 border-purple-600/40';
    }
    return 'bg-blue-600/20 text-blue-400 border-blue-600/40';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Manajemen User</h1>
        <p className="text-sm sm:text-base text-slate-400">Kelola semua user yang terdaftar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Total Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="text-3xl sm:text-4xl">👥</div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Admin</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-400 mt-1">{stats.admins}</p>
            </div>
            <div className="text-3xl sm:text-4xl">👑</div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Regular Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-400 mt-1">{stats.users}</p>
            </div>
            <div className="text-3xl sm:text-4xl">👤</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari username, email, atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <p className="text-sm text-slate-400 mt-3">
          Menampilkan {filteredUsers.length} dari {users.length} users
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">User</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap hidden md:table-cell">Email</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">Role</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap hidden lg:table-cell">Terdaftar</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="text-4xl sm:text-5xl mb-2">👤</div>
                    <p className="text-sm sm:text-base">Tidak ada user ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm sm:text-base truncate">{user.nama || user.username}</p>
                          <p className="text-xs sm:text-sm text-slate-400 truncate">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-300 text-sm hidden md:table-cell">{user.email}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getRoleBadge(user.role)}`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-400 text-xs sm:text-sm hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/edit/${user.id}`}
                          className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
