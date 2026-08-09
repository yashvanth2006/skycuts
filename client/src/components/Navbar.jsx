import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LogOut, ChevronLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import NotificationCenter from './NotificationCenter.jsx';

export default function Navbar({ showBack = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setMobileMenuOpen(false);
  };

  const handleBack = () => navigate(-1);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 56,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 0.35s ease, border-color 0.35s ease',
      }}
    >
      {/* Left — Logo or Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <button onClick={handleBack} className="btn-ghost" style={{ padding: '6px 10px', gap: 6 }}>
            <ChevronLeft size={16} /> <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>Back</span>
          </button>
        )}
        <button
          onClick={() => {
            navigate(user?.role === 'admin' ? '/profile' : '/dashboard');
            setMobileMenuOpen(false);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)'
            }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Zap size={15} color="#fff" />
          </motion.div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Sky<span style={{ background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Cuts</span>
          </span>
        </button>
      </div>

      {/* Desktop Right — Theme Toggle + Notifications + User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme Toggle — always visible */}
        <ThemeToggle />

        {user && (
          <>
            {/* Notifications — Desktop */}
            <div style={{ display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
              <NotificationCenter />
            </div>

            {/* Separator — Desktop */}
            <div style={{ width: 1, height: 28, background: 'var(--border-subtle)', display: 'none', '@media (min-width: 768px)': { display: 'block' } }} />

            {/* User Info — Desktop */}
            <div style={{
              display: 'none', '@media (min-width: 768px)': { display: 'flex' },
              alignItems: 'center', gap: 10,
              padding: '6px 14px 6px 8px',
              background: 'var(--bg-glass)', borderRadius: 100,
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-luma))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff'
              }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role === 'admin' ? 'editor' : user.role}</p>
              </div>
              <span className={`badge badge-${user.role}`} style={{ marginLeft: 4 }}>
                {user.role === 'admin' ? 'editor' : user.role}
              </span>
            </div>

            {/* Logout — Desktop */}
            <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 12px', gap: 6, display: 'none', '@media (min-width: 768px)': { display: 'flex' } }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LogOut size={15} /> Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'flex', '@media (min-width: 768px)': { display: 'none' },
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', padding: 8
              }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.5)' }}
            />
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{
                position: 'fixed', top: 56, right: 0, bottom: 0, left: 0, zIndex: 999,
                background: 'var(--bg-card)', backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)', padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-luma))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role === 'admin' ? 'editor' : user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 8 }}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Notifications */}
              <div style={{ marginBottom: 20 }}>
                <NotificationCenter />
              </div>

              {/* Navigation Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  onClick={() => {
                    navigate(user?.role === 'admin' ? '/profile' : '/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 12,
                    background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)', fontSize: 15, fontWeight: 500,
                    cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <Zap size={18} color="var(--accent-blue)" />
                  {user?.role === 'admin' ? 'Editor Profile' : 'Dashboard'}
                </button>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                <button
                  onClick={handleLogout}
                  className="btn-danger"
                  style={{ width: '100%', padding: '14px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
