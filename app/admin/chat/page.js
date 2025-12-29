'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
    
    // Poll for new messages every 3 seconds
    intervalRef.current = setInterval(() => {
      fetchMessages();
      fetchUnreadCount();
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function fetchMessages() {
    try {
      const data = await apiGet('/api/chat');
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      const data = await apiGet('/api/chat/mark-read');
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }

  async function markAsRead() {
    try {
      await apiPost('/api/chat/mark-read', {});
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await apiPost('/api/chat', { message: newMessage });
      setMessages([...messages, message]);
      setNewMessage('');
      await markAsRead(); // Mark user messages as read when admin sends
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gagal mengirim pesan: ' + error.message);
    } finally {
      setSending(false);
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID');
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const dateKey = new Date(msg.created_at).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Chat Support</h1>
          <p className="text-slate-400 mt-2">Kelola percakapan dengan pengguna</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
              {unreadCount} pesan baru
            </span>
            <button
              onClick={markAsRead}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Tandai Sudah Dibaca
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {Object.keys(messageGroups).length === 0 && (
            <div className="text-center py-12 text-slate-400">
              Belum ada pesan
            </div>
          )}
          
          {Object.keys(messageGroups).map((dateKey) => (
            <div key={dateKey}>
              {/* Date separator */}
              <div className="flex items-center justify-center mb-4">
                <div className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-400">
                  {formatDate(messageGroups[dateKey][0].created_at)}
                </div>
              </div>

              {/* Messages for this date */}
              {messageGroups[dateKey].map((msg) => {
                const isAdmin = msg.role === 'admin';
                const isCurrentUser = msg.username === user?.username;

                return (
                  <div
                    key={msg.id}
                    className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isCurrentUser && (
                        <div className="text-xs text-slate-400 mb-1 px-1">
                          {msg.username} {isAdmin && '(Admin)'}
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isCurrentUser
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {formatTime(msg.created_at)}
                          {!msg.is_read && !isAdmin && (
                            <span className="ml-2 text-yellow-400">●</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-700 p-4 bg-slate-900">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Kirim...' : 'Kirim'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="text-slate-400 text-sm mb-2">Total Pesan</div>
          <div className="text-3xl font-bold text-white">{messages.length}</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="text-slate-400 text-sm mb-2">Pesan Belum Dibaca</div>
          <div className="text-3xl font-bold text-yellow-400">{unreadCount}</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="text-slate-400 text-sm mb-2">Pesan dari User</div>
          <div className="text-3xl font-bold text-blue-400">
            {messages.filter(m => m.role === 'user').length}
          </div>
        </div>
      </div>
    </div>
  );
}
