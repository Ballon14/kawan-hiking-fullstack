'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

export default function KomunitasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    fetchMessages();
    // Auto refresh every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchMessages() {
    try {
      const data = await apiGet('/api/community/messages');
      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await apiPost('/api/community/messages', { content: newMessage });
      setNewMessage('');
      await fetchMessages();
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
    if (diffMins < 60) return `${diffMins} menit lalu`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    
    return msgDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col bg-slate-900"
      style={{ top: '64px' }}
    >
      {/* Header - Fixed */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                🏔️ Komunitas Pendaki
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {messages.length} pesan • {user ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-slate-400">Live Chat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-slate-900 px-4 sm:px-6 py-4"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#334155 #0f172a'
        }}
      >
        <div className="max-w-5xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Pesan</h3>
              <p className="text-slate-400">Mulai percakapan dengan komunitas!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = user && message.user_id === user.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      isOwnMessage 
                        ? 'bg-gradient-to-br from-emerald-600 to-emerald-800'
                        : 'bg-gradient-to-br from-blue-600 to-blue-800'
                    }`}>
                      {message.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-2xl ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      {isOwnMessage ? (
                        <>
                          <span className="text-xs text-slate-500">{formatTime(message.createdAt)}</span>
                          <span className="font-semibold text-emerald-400 text-sm">{message.username}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-blue-400 text-sm">{message.username}</span>
                          <span className="text-xs text-slate-500">{formatTime(message.createdAt)}</span>
                        </>
                      )}
                    </div>
                    <div className={`inline-block px-4 py-3 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-white rounded-tl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          {user ? (
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={sending}
                autoFocus
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Kirim</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <p className="text-blue-300 mb-3">Login untuk bergabung dengan percakapan komunitas</p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login Sekarang
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* Custom scrollbar for chat area */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
