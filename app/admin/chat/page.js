'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function AdminChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
      const interval = setInterval(() => fetchMessages(selectedUser.user_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      await apiPost(`/api/admin-chat/conversations/${selectedUser.user_id}`, {
        content: newMessage,
      });
      setNewMessage('');
      await fetchMessages(selectedUser.user_id);
      await fetchConversations();
    } catch (error) {
      showToast.error(error.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">💬 Chat dengan User</h1>
        <p className="text-slate-400 mt-2">Kelola percakapan dengan pengguna</p>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="font-semibold text-white">Percakapan ({conversations.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">Belum ada percakapan</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => setSelectedUser(conv)}
                  className={`w-full px-6 py-4 border-b border-slate-700 hover:bg-slate-700 transition-colors text-left ${
                    selectedUser?.user_id === conv.user_id ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold">
                        {conv.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{conv.username}</div>
                        <div className="text-xs text-slate-400">{formatTime(conv.last_message_time)}</div>
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 truncate">
                    {conv.is_last_from_admin ? '✓ ' : ''}{conv.last_message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-2 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedUser.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedUser.username}</div>
                  <div className="text-xs text-slate-400">User Chat</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_admin_message ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      message.is_admin_message 
                        ? 'bg-emerald-600' 
                        : 'bg-slate-800'
                    } rounded-2xl px-4 py-3 ${
                      message.is_admin_message ? 'rounded-tr-none' : 'rounded-tl-none'
                    }`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-xs font-semibold ${
                          message.is_admin_message ? 'text-emerald-200' : 'text-blue-400'
                        }`}>
                          {message.is_admin_message ? 'Admin' : selectedUser.username}
                        </span>
                      </div>
                      <p className="text-white text-sm whitespace-pre-wrap">{message.content}</p>
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
              <div className="px-6 py-4 border-t border-slate-700">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik balasan..."
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={sending}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Mengirim...' : 'Kirim'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p>Pilih percakapan untuk mulai chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
