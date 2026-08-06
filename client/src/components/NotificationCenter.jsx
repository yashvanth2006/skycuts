import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axiosInstance.js';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project_status':
        return '📊';
      case 'new_deliverable':
        return '🎬';
      case 'new_comment':
        return '💬';
      case 'payment_received':
        return '💳';
      case 'project_accepted':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'project_status':
        return '#6366f1';
      case 'new_deliverable':
        return '#c084fc';
      case 'new_comment':
        return '#f59e0b';
      case 'payment_received':
        return '#34d399';
      case 'project_accepted':
        return '#22c55e';
      default:
        return '#818cf8';
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 8,
          color: 'var(--text-secondary)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'var(--accent-purple)',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-void)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 998,
                onClick: () => setIsOpen(false),
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 380,
                maxHeight: 500,
                background: 'var(--bg-card)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                zIndex: 999,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--accent-blue)',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 12px', color: 'var(--accent-blue)' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.2, color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif, i) => (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { if (!notif.read) handleMarkAsRead(notif._id); }}
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        background: notif.read ? 'transparent' : 'rgba(99,102,241,0.05)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                      onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(99,102,241,0.05)'}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${getTypeColor(notif.type)}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          flexShrink: 0,
                        }}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: 'var(--accent-purple)',
                                flexShrink: 0,
                              }} />
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.4 }}>
                            {notif.message}
                          </p>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.7 }}>
                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {notif.link && (
                          <a
                            href={notif.link}
                            onClick={e => e.stopPropagation()}
                            style={{
                              padding: 6,
                              borderRadius: 6,
                              background: 'var(--bg-glass)',
                              color: 'var(--accent-blue)',
                              border: '1px solid var(--border-subtle)',
                              textDecoration: 'none',
                              flexShrink: 0,
                            }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
