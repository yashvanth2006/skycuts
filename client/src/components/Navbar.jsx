import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LogOut, ChevronLeft, LayoutDashboard, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Navbar({ showBack = false, showDashboard = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleBack = () => navigate(-1);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const displayName = user?.name?.split(' ')[0] ?? '';

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 60,
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
            <button onClick={handleBack} className="btn-ghost" style={{ padding: '6px 12px', minHeight: 36, gap: 6 }}>
              <ChevronLeft size={16} /> <span className="hide-on-mobile">Back</span>
            </button>
          )}
          <button
            onClick={() => {
              if (user) {
                if (user.role === 'admin') window.location.href = 'http://localhost:5174/';
                else navigate('/dashboard');
              } else {
                navigate('/profile');
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)'
            }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Sky<span style={{ background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Cuts</span>
            </span>
          </button>
        </div>

        {/* Desktop Right */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {showDashboard && user && (
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-ghost"
              style={{ minHeight: 36, padding: '6px 12px', fontSize: 13 }}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
          )}

          <ThemeToggle />

          {user ? (
            <>
              <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '4px 12px 4px 6px',
                background: 'var(--bg-glass)', borderRadius: 100,
                border: '1px solid var(--border-subtle)'
              }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-luma))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff'
                  }}>
                    {initials}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{displayName}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 10px', minHeight: 36, fontSize: 13 }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '8px 16px', minHeight: 36 }}>
              Login
            </button>
          )}
        </div>

        {/* Mobile Right */}
        <div className="mobile-nav" style={{ display: 'none', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44,
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed', top: 60, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', zIndex: 99,
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed', top: 60, left: 0, right: 0,
                background: 'var(--nav-bg)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '20px', zIndex: 100,
                backdropFilter: 'blur(20px)',
              }}
            >
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-luma))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: '#fff'
                      }}>
                        {initials}
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
                    </div>
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }} />
                  {showDashboard && (
                    <button
                      onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                      className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', fontSize: 15 }}
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="btn-danger" style={{ justifyContent: 'flex-start', width: '100%', fontSize: 15, background: 'transparent' }}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="btn-primary" style={{ width: '100%' }}
                >
                  Login
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
