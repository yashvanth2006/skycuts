import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Loader2, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axiosInstance.js';

const formatTs = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function CommentSidebar({ projectId, currentTime, onSeek }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/comments/${projectId}`);
        setComments(data);
      } catch {/* ignore */}
      finally { setLoading(false); }
    };
    fetchComments();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/comments/${projectId}`, {
        timestamp: Math.floor(currentTime),
        text: text.trim(),
      });
      setComments(prev => [...prev, data].sort((a, b) => a.timestamp - b.timestamp));
      setText('');
    } catch {/* ignore */}
    finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch {/* ignore */}
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'rgba(8,8,16,0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--border-subtle)',
      borderRadius: '0 16px 16px 0',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(167,139,250,0.2))',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={16} color="var(--accent-indigo)" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Comments</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comments.length} note{comments.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Comment List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <Loader2 size={20} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
        {!loading && comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
            <MessageSquare size={24} style={{ margin: '0 auto 10px', opacity: 0.3, display: 'block' }} />
            No comments yet. Pause the video and add a note.
          </div>
        )}
        <AnimatePresence>
          {comments.map((c, i) => {
            const isOwn = c.author?._id === user._id;
            const canDelete = isOwn || user.role === 'admin';
            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                style={{
                  padding: '14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onClick={() => onSeek(c.timestamp)}
                whileHover={{ borderColor: 'var(--border-glow)' }}
              >
                {/* Timestamp pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 100,
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  marginBottom: 8,
                }}>
                  <Clock size={11} color="var(--accent-indigo)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-indigo)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatTs(c.timestamp)}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 8 }}>
                  {c.text}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: isOwn
                        ? 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))'
                        : 'linear-gradient(135deg,var(--accent-cyan),var(--accent-blue))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: '#fff',
                    }}>
                      {(c.author?.name || user.name)[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.author?.name || user.name}</span>
                  </div>
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                      aria-label="Delete comment"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Comment Form */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          padding: '8px 12px', borderRadius: 10,
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.15)',
          marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Clock size={12} color="var(--accent-indigo)" />
          <span style={{ fontSize: 12, color: 'var(--accent-indigo)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            At {formatTs(currentTime)}
          </span>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a note…"
            className="input-field"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 13 }}
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            style={{
              width: 40, height: 40, borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))',
              color: '#fff', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: !text.trim() ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
            aria-label="Post comment"
          >
            {submitting
              ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
              : <Plus size={18} />
            }
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
