import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Navbar({ showBack = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleBack = () => navigate(-1);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Check if user is the master editor (Yashvanth)
  const isMasterEditor = user?.role === 'admin' && user?.email === 'yashvanth@skycuts.io';

  return (
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
          onClick={() => navigate(user?.role === 'admin' ? '/editor' : '/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)'
            }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Zap size={17} color="#fff" />
          </motion.div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Sky<span style={{ background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Cuts</span>
          </span>
        </button>
      </div>

      {/* Right — Theme Toggle + User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme Toggle — always visible */}
        <ThemeToggle />

        {/* Editor Dashboard Button — only for master editor */}
        {isMasterEditor && location.pathname !== '/editor' && location.pathname !== '/editor/project/' && (
          <>
            <button
              onClick={() => navigate('/editor')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #F5A623, #FFB74D)',
                color: '#111',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(245,166,35,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(245,166,35,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,166,35,0.3)';
              }}
            >
              Editor Dashboard
            </button>
            <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />
          </>
        )}

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
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role === 'admin' ? 'editor' : user.role}</p>
              </div>
              <span className={`badge badge-${user.role}`} style={{ marginLeft: 4 }}>
                {user.role === 'admin' ? 'editor' : user.role}
              </span>
            </div>

            <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 12px', gap: 6 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LogOut size={15} /> Logout
            </button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
