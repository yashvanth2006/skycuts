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

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background 0.35s ease, border-color 0.35s ease',
        }}
      >
        <div className="navbar-container">
          {/* Left — Logo or Back */}
          <div className="navbar-brand">
            {showBack && (
              <button onClick={handleBack} className="btn-ghost" style={{ padding: '6px 10px', gap: 4, marginRight: 8 }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={() => {
                if (user) {
                  if (user.role === 'admin') {
                    window.location.href = 'http://localhost:5174/';
                  } else {
                    navigate('/dashboard');
                  }
                } else {
                  navigate('/profile');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99,102,241,0.4)'
              }}>
                <Zap size={15} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                Sky<span style={{ background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Cuts</span>
              </span>
            </button>
          </div>

          {/* Center — Nav Links (Desktop) */}
          <div className="navbar-nav desktop-only">
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => navigate('/profile')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 500,
                    background: location.pathname === '/profile' ? 'var(--bg-glass)' : 'none',
                    color: location.pathname === '/profile' ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: location.pathname === '/profile' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <User size={14} /> Editor Profile
                </button>
                {(showDashboard || user) && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 500,
                      background: location.pathname.startsWith('/dashboard') ? 'var(--bg-glass)' : 'none',
                      color: location.pathname.startsWith('/dashboard') ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderBottom: location.pathname.startsWith('/dashboard') ? '2px solid var(--accent-blue)' : '2px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Right — Theme Toggle + User + Logout (Desktop) */}
          <div className="navbar-actions desktop-only">
            <ThemeToggle />

            {user ? (
              <>
                <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', flexShrink: 0 }} />
                
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 12px 5px 6px',
                  background: 'var(--bg-glass)', borderRadius: 100,
                  border: '1px solid var(--border-subtle)',
                  minWidth: 0, overflow: 'hidden',
                }}>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name || 'User avatar'}
                      style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-luma))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff'
                    }}>
                      {initials}
                    </div>
                  )}

                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <p
                      className="nav-user-name"
                      style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                        lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        maxWidth: '18ch',
                      }}
                    >
                      {displayName}
                    </p>
                    <p className="nav-user-role" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
                  </div>

                  <span className={`badge badge-${user.role} nav-badge-hidden`} style={{ marginLeft: 2, whiteSpace: 'nowrap', padding: '2px 8px', fontSize: 10 }}>
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 4, padding: '7px 10px',
                    background: 'transparent', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                    cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0, fontSize: 13,
                    fontWeight: 500, whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <LogOut size={14} />
                  <span className="nav-logout-label">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
                style={{ padding: '8px 14px', gap: 8 }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              style={{
                position: 'fixed', top: 60, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', zIndex: 99,
              }}
            />
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed', top: 60, left: 0, right: 0,
                background: 'var(--nav-bg)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '16px',
                zIndex: 100,
                boxSizing: 'border-box',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user ? (
                  <>
                    <button
                      onClick={() => { navigate('/profile'); closeMenu(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 15, fontWeight: 500,
                        background: location.pathname === '/profile' ? 'var(--bg-glass)' : 'none',
                        color: location.pathname === '/profile' ? 'var(--text-primary)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                        minHeight: 44,
                      }}
                    >
                      <User size={18} /> Editor Profile
                    </button>
                    {(showDashboard || user) && (
                      <button
                        onClick={() => { navigate('/dashboard'); closeMenu(); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          fontSize: 15, fontWeight: 500,
                          background: location.pathname.startsWith('/dashboard') ? 'var(--bg-glass)' : 'none',
                          color: location.pathname.startsWith('/dashboard') ? 'var(--text-primary)' : 'var(--text-muted)',
                          transition: 'all 0.15s ease',
                          minHeight: 44,
                        }}
                      >
                        <LayoutDashboard size={18} /> Dashboard
                      </button>
                    )}
                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', minHeight: 44 }}>
                      <ThemeToggle />
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Theme</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', minHeight: 44 }}>
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name || 'User avatar'}
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-luma))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {initials}
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { handleLogout(); closeMenu(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 15, fontWeight: 500, color: '#ef4444',
                        background: 'none',
                        transition: 'all 0.15s ease',
                        minHeight: 44,
                      }}
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/profile'); closeMenu(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 15, fontWeight: 500,
                        background: location.pathname === '/profile' ? 'var(--bg-glass)' : 'none',
                        color: location.pathname === '/profile' ? 'var(--text-primary)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                        minHeight: 44,
                      }}
                    >
                      <User size={18} /> Editor Profile
                    </button>
                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', minHeight: 44 }}>
                      <ThemeToggle />
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Theme</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <button
                      onClick={() => { navigate('/login'); closeMenu(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 15, fontWeight: 500, color: 'var(--accent-blue)',
                        background: 'none',
                        transition: 'all 0.15s ease',
                        minHeight: 44,
                      }}
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        /* Global Navbar Alignment & Structural Responsive CSS */
        .navbar-container {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .mobile-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-primary);
          padding: 10px;
          min-width: 44px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
        }

        /* Responsive Breakpoints */
        @media (max-width: 767px) {
          .navbar-container {
            height: 60px;
            padding: 0 16px;
          }
          .desktop-only {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
