import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axiosInstance.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let sharedSocket = null;
let socketRefCount = 0;
let socketTimeout = null;

export default function ChatPanel({ projectId }) {
  const { user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unread, setUnread]   = useState(0);

  const socketRef  = useRef(null);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const openRef    = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // ── Init Socket.io ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sharedSocket) {
        const token = localStorage.getItem('skycuts_token');
        sharedSocket = io(SOCKET_URL, { 
            transports: ['websocket'],
            auth: { token }
        });
    }
    
    if (socketTimeout) {
        clearTimeout(socketTimeout);
        socketTimeout = null;
    }
    
    socketRefCount++;
    socketRef.current = sharedSocket;

    const handleConnect = () => {
      sharedSocket.emit('join_project', projectId);
    };

    const handleReceive = (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!openRef.current) setUnread(n => n + 1);
    };

    const handleError = (err) => {
      console.error('Socket error:', err.message);
    };

    sharedSocket.on('connect', handleConnect);
    sharedSocket.on('receive_message', handleReceive);
    sharedSocket.on('socket_error', handleError);

    if (sharedSocket.connected) {
      handleConnect();
    }

    return () => {
      sharedSocket.off('connect', handleConnect);
      sharedSocket.off('receive_message', handleReceive);
      sharedSocket.off('socket_error', handleError);
      
      socketRefCount--;
      if (socketRefCount === 0) {
        socketTimeout = setTimeout(() => {
          if (socketRefCount === 0 && sharedSocket) {
            sharedSocket.disconnect();
            sharedSocket = null;
          }
        }, 100);
      }
    };
  }, [projectId]);

  // ── Fetch history ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/messages/${projectId}`);
        setMessages(data);
      } catch {/* ignore */}
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [projectId]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // ── On open, clear unread ─────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);

    socketRef.current?.emit('send_message', {
      projectId,
      senderId:   user._id,
      senderName: user.name,
      senderRole: user.role,
      text: text.trim(),
    });
    setText('');
    setSending(false);
  }, [text, sending, projectId, user]);

  const formatTime = (iso) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <style>{`
        .chat-fab-btn {
          position: fixed; bottom: 24px; right: 24px; z-index: 150;
          width: 52px; height: 52px; border-radius: 50%; border: none;
          background: var(--accent-red);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(185,28,28,0.35);
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .chat-fab-btn:hover { background: var(--accent-red-bright); transform: scale(1.05); }
        @media(max-width: 768px) {
          .chat-fab-btn {
            bottom: 16px !important;
            right: 16px !important;
            width: 48px !important;
            height: 48px !important;
          }
        }
      `}</style>
      {/* FAB Trigger */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="chat-fab-btn"
        style={{ display: open ? 'none' : 'flex' }}
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
        {unread > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 20, height: 20, borderRadius: '50%',
            background: '#ef4444', fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-void)',
          }}>
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </motion.button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed', top: 64, right: 0, bottom: 0, zIndex: 150,
              width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'var(--accent-red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MessageCircle size={17} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Project Chat</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{messages.length} messages</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                  <Loader2 size={20} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}
              {!loading && messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                  <MessageCircle size={28} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                  No messages yet. Say hello!
                </div>
              )}
              {messages.map((msg, i) => {
                const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
                return (
                  <motion.div
                    key={msg._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex', gap: 8,
                      flexDirection: isOwn ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: isOwn ? 'var(--accent-red-dark)' : '#1A1A1A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                    }}>
                      {getInitials(msg.sender?.name || user.name)}
                    </div>
                    <div style={{ maxWidth: '72%' }}>
                      {!isOwn && (
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, paddingLeft: 2 }}>
                          {msg.sender?.name}
                        </p>
                      )}
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isOwn
                          ? 'var(--accent-red)'
                          : 'rgba(255,255,255,0.06)',
                        border: isOwn ? 'none' : '1px solid var(--border)',
                        fontSize: 13, color: '#fff', lineHeight: 1.45,
                      }}>
                        {msg.text}
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: isOwn ? 'right' : 'left', paddingLeft: isOwn ? 0 : 2, paddingRight: isOwn ? 2 : 0 }}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              style={{
                display: 'flex', gap: 10, padding: '14px 16px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <input
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message…"
                className="input-field"
                style={{ flex: 1, padding: '10px 14px', borderRadius: 24 }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                style={{
                  width: 42, height: 42, borderRadius: '50%', border: 'none',
                  background: 'var(--accent-red)',
                  color: '#fff', cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: !text.trim() ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                }}
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
