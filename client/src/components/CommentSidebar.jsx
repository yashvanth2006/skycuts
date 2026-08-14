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
      minHeight: 0,
      width: '100%',
      background: 'var(--bg-card)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(167,139,250,0.18))',
          border: '1px solid rgba(99,102,241,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={13} color="var(--accent-indigo)" />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600 }}>Comments</p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{comments.length} note{comments.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Comment List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
            <Loader2 size={18} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
        {!loading && comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
            <MessageSquare size={20} style={{ margin: '0 auto 8px', opacity: 0.3, display: 'block' }} />
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.03, duration: 0.22 }}
              style={{
                padding: '10px 11px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onClick={() => onSeek(c.timestamp)}
              whileHover={{ borderColor: 'var(--border-glow)' }}
            >
              {/* Timestamp pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 100,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
                marginBottom: 6,
              }}>
                <Clock size={10} color="var(--accent-indigo)" />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-indigo)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTs(c.timestamp)}
                </span>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 6 }}>
                {c.text}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: isOwn
                      ? 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))'
                      : 'linear-gradient(135deg,var(--accent-cyan),var(--accent-blue))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 700, color: '#fff',
                  }}>
                    {(c.author?.name || user.name)[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.author?.name || user.name}</span>
                </div>
                {canDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                    aria-label="Delete comment"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Comment Form */}
      <div style={{ padding: '11px 12px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          padding: '6px 10px', borderRadius: 8,
          background: 'rgba(99,102,241,0.07)',
          border: '1px solid rgba(99,102,241,0.12)',
          marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Clock size={10} color="var(--accent-indigo)" />
          <span style={{ fontSize: 11, color: 'var(--accent-indigo)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            At {formatTs(currentTime)}
          </span>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a note…"
            className="input-field"
            style={{ flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 8, fontSize: 13 }}
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            style={{
              width: 44, height: 44, borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))',
              color: '#fff', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: !text.trim() ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
            aria-label="Post comment"
          >
            {submitting
              ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
              : <Plus size={16} />
            }
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
