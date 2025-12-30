'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api-client';

export default function AdminChatBubble() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchMessages() {
    try {
      const data = await apiGet('/api/admin-chat/messages');
      setMessages(data || []);
      
      // Reset unread when open
      if (isOpen) {
        setUnreadCount(0);
      } else {
        const unread = data.filter(m => !m.is_read && m.is_admin_message).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await apiPost('/api/admin-chat/messages', { content: newMessage });
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      alert(error.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (!user) return null;

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-600/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {unreadCount}
              </div>
            )}
          </>
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold">
                A
              </div>
              <div>
                <div className="font-semibold text-white">Admin Support</div>
                <div className="text-xs text-emerald-100 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <div className="text-4xl mb-2">👋</div>
                <p className="text-sm">Mulai percakapan dengan admin</p>
              </div>
            ) : (
              messages.map((message) => {
                const isAdmin = message.is_admin_message;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] ${isAdmin ? 'bg-slate-800' : 'bg-emerald-600'} rounded-2xl px-4 py-2 ${isAdmin ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                      <p className="text-white text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`text-xs mt-1 ${isAdmin ? 'text-slate-500' : 'text-emerald-200'}`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-800 border-t border-slate-700 flex-shrink-0">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {sending ? '...' : '📤'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
