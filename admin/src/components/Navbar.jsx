import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LogOut, ChevronLeft, Film, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Navbar({ showBack = false }) {
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

  return (
    <>
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
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
          <button onClick={handleBack} className="btn-ghost" style={{ padding: '6px 12px', gap: 6 }}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <button
          onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.4)'
          }}>
            <Zap size={17} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Sky<span style={{ background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Cuts</span>
          </span>
        </button>
      </div>

      {/* Center — Nav Links (Desktop) */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {[
            { path: '/dashboard', icon: <LayoutDashboard size={14} />, label: 'Dashboard' },
            { path: '/portfolio', icon: <Film size={14} />, label: 'Portfolio' },
          ].map(({ path, icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                background: location.pathname === path ? 'var(--bg-glass)' : 'none',
                color: location.pathname === path ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: location.pathname === path ? '2px solid var(--accent-blue)' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Hamburger Button */}
      {user && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-hamburger"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Right — Theme Toggle + User + Logout (Desktop) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
        {/* Theme Toggle — always visible */}
        <ThemeToggle />

        {user && (
          <>
            {/* Separator */}
            <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
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
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
              </div>
              <span className={`badge badge-${user.role}`} style={{ marginLeft: 4 }}>
                {user.role}
              </span>
            </div>

            <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 12px', gap: 6 }}>
              <LogOut size={15} /> Logout
            </button>
          </>
        )}
      </div>
    </motion.nav>

    {/* Mobile Menu Dropdown */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 99,
            }}
          />
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0,
              background: 'var(--nav-bg)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '16px 20px',
              zIndex: 100,
            }}
          >
            {user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 15, fontWeight: 500,
                    background: location.pathname === '/dashboard' ? 'var(--bg-glass)' : 'none',
                    color: location.pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LayoutDashboard size={18} /> Dashboard
                </button>
                <button
                  onClick={() => { navigate('/portfolio'); setMobileMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 15, fontWeight: 500,
                    background: location.pathname === '/portfolio' ? 'var(--bg-glass)' : 'none',
                    color: location.pathname === '/portfolio' ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Film size={18} /> Portfolio
                </button>
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <ThemeToggle />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Theme</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-luma))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 15, fontWeight: 500, color: '#ef4444',
                    background: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <style>{`
      @media (max-width: 768px) {
        .desktop-nav { display: none !important; }
        .mobile-hamburger { display: flex !important; }
      }
    `}</style>
  </>
  );
}
