'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function AdminChatPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'community'
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [communityMessages, setCommunityMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('danger'); // 'danger' or 'warning'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    } else {
      fetchCommunityMessages();
      const interval = setInterval(fetchCommunityMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedUser && activeTab === 'users') {
      fetchMessages(selectedUser.user_id);
      const interval = setInterval(() => fetchMessages(selectedUser.user_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, communityMessages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchConversations() {
    try {
      const data = await apiGet('/api/admin-chat/conversations');
      setConversations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(userId) {
    try {
      const data = await apiGet(`/api/admin-chat/conversations/${userId}`);
      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function fetchCommunityMessages() {
    try {
      const data = await apiGet('/api/community-chat');
      setCommunityMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      if (activeTab === 'users' && selectedUser) {
        await apiPost(`/api/admin-chat/conversations/${selectedUser.user_id}`, {
          content: newMessage,
        });
        setNewMessage('');
        await fetchMessages(selectedUser.user_id);
        await fetchConversations();
      } else if (activeTab === 'community') {
        await apiPost('/api/community-chat', {
          content: newMessage,
        });
        setNewMessage('');
        await fetchCommunityMessages();
      }
    } catch (error) {
      showToast.error(error.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedMessages.length === 0) {
      showToast.error('Pilih pesan yang ingin dihapus');
      return;
    }

    setConfirmTitle('Hapus Pesan Terpilih');
    setConfirmMessage(`Anda akan menghapus ${selectedMessages.length} pesan yang dipilih. Tindakan ini tidak dapat dibatalkan.`);
    setConfirmType('warning');
    setConfirmAction(() => async () => {
      try {
        await apiPost('/api/community-chat/bulk-delete', {
          messageIds: selectedMessages,
        });
        showToast.success(`${selectedMessages.length} pesan berhasil dihapus`);
        setSelectedMessages([]);
        setBulkMode(false);
        await fetchCommunityMessages();
      } catch (error) {
        showToast.error(error.message || 'Gagal menghapus pesan');
      }
    });
    setShowConfirmModal(true);
  }

  async function handleDeleteAll() {
    if (communityMessages.length === 0) {
      showToast.error('Tidak ada pesan untuk dihapus');
      return;
    }

    setConfirmTitle('⚠️ Hapus Semua Pesan');
    setConfirmMessage(`Anda akan menghapus SEMUA ${communityMessages.length} pesan di chat komunitas.\n\nTindakan ini TIDAK DAPAT DIBATALKAN!\n\nSemua riwayat chat akan hilang permanen.`);
    setConfirmType('danger');
    setConfirmAction(() => async () => {
      try {
        await apiPost('/api/community-chat/delete-all');
        showToast.success('Semua pesan berhasil dihapus');
        setSelectedMessages([]);
        setBulkMode(false);
        await fetchCommunityMessages();
      } catch (error) {
        showToast.error(error.message || 'Gagal menghapus semua pesan');
      }
    });
    setShowConfirmModal(true);
  }

  function toggleMessageSelection(messageId) {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  }

  function formatTime(date) {
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    return msgDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl animate-scale-in">
            {/* Header */}
            <div className={`px-6 py-4 border-b border-slate-700 ${
              confirmType === 'danger' ? 'bg-red-600/10' : 'bg-yellow-600/10'
            }`}>
              <h3 className={`text-lg sm:text-xl font-bold ${
                confirmType === 'danger' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {confirmTitle}
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                confirmType === 'danger' ? 'bg-red-600/20' : 'bg-yellow-600/20'
              }`}>
                <span className="text-4xl">
                  {confirmType === 'danger' ? '🗑️' : '⚠️'}
                </span>
              </div>
              <p className="text-slate-300 text-center whitespace-pre-line leading-relaxed">
                {confirmMessage}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700 flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  if (confirmAction) {
                    await confirmAction();
                  }
                  setConfirmAction(null);
                }}
                className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl transition-colors ${
                  confirmType === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {confirmType === 'danger' ? 'Ya, Hapus' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">💬 Chat Management</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">Kelola percakapan dengan pengguna dan komunitas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b border-slate-700">
        <button
          onClick={() => {
            setActiveTab('users');
            setSelectedMessages([]);
            setBulkMode(false);
          }}
          className={`px-4 sm:px-6 py-3 font-semibold transition-colors ${
            activeTab === 'users'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Chat dengan User</span>
          <span className="sm:hidden">Users</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('community');
            setSelectedUser(null);
          }}
          className={`px-4 sm:px-6 py-3 font-semibold transition-colors ${
            activeTab === 'community'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Chat Komunitas</span>
          <span className="sm:hidden">Komunitas</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-300px)] sm:h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
              <h2 className="font-semibold text-white text-sm sm:text-base">Percakapan ({conversations.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-3xl sm:text-4xl mb-2">💬</div>
                  <p className="text-xs sm:text-sm">Belum ada percakapan</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.user_id}
                    onClick={() => setSelectedUser(conv)}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 hover:bg-slate-700 transition-colors text-left ${
                      selectedUser?.user_id === conv.user_id ? 'bg-slate-700' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {conv.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm sm:text-base">{conv.username}</div>
                          <div className="text-xs text-slate-400">{formatTime(conv.last_message_time)}</div>
                        </div>
                      </div>
                      {conv.unread_count > 0 && (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {conv.unread_count}
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 truncate">
                      {conv.is_last_from_admin ? '✓ ' : ''}{conv.last_message}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {selectedUser.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm sm:text-base">{selectedUser.username}</div>
                    <div className="text-xs text-slate-400">User Chat</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-slate-900">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_admin_message ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[70%] ${
                        message.is_admin_message 
                          ? 'bg-emerald-600' 
                          : 'bg-slate-800'
                      } rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                        message.is_admin_message ? 'rounded-tr-none' : 'rounded-tl-none'
                      }`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className={`text-xs font-semibold ${
                            message.is_admin_message ? 'text-emerald-200' : 'text-blue-400'
                          }`}>
                            {message.is_admin_message ? 'Admin' : selectedUser.username}
                          </span>
                        </div>
                        <p className="text-white text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={`text-xs mt-1 ${
                          message.is_admin_message ? 'text-emerald-200' : 'text-slate-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-700">
                  <form onSubmit={handleSend} className="flex gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik balasan..."
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={sending}
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {sending ? 'Mengirim...' : 'Kirim'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl mb-4">💬</div>
                  <p className="text-sm sm:text-base">Pilih percakapan untuk mulai chat</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 flex flex-col h-[calc(100vh-300px)] sm:h-[calc(100vh-250px)]">
          {/* Community Chat Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white text-sm sm:text-base">Chat Komunitas</h2>
              <p className="text-xs text-slate-400">Bergabung dengan percakapan komunitas</p>
            </div>
            <div className="flex gap-2">
              {bulkMode && (
                <>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedMessages.length === 0}
                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium"
                  >
                    Hapus ({selectedMessages.length})
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="px-3 sm:px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-xs sm:text-sm font-medium border border-red-500"
                  >
                    🗑️ Hapus Semua
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setBulkMode(!bulkMode);
                  setSelectedMessages([]);
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                  bulkMode
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {bulkMode ? 'Batal' : 'Bulk Delete'}
              </button>
            </div>
          </div>

          {/* Community Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-slate-900">
            {communityMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 sm:gap-3 ${bulkMode ? 'cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg' : ''}`}
                onClick={() => bulkMode && toggleMessageSelection(message.id)}
              >
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(message.id)}
                    onChange={() => toggleMessageSelection(message.id)}
                    className="mt-1 w-4 h-4"
                  />
                )}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {message.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs sm:text-sm font-semibold text-purple-400">
                      {message.username}
                      {message.is_admin && <span className="ml-1 text-emerald-400">(Admin)</span>}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-white text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Community Input */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-700">
            <form onSubmit={handleSend} className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Kirim pesan ke komunitas..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {sending ? 'Mengirim...' : 'Kirim'}
              </button>
            </form>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
