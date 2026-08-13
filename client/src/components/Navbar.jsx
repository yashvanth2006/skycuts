import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, LogOut, ChevronLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Navbar({ showBack = false, showDashboard = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleBack = () => navigate(-1);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Truncate name to first word only on small screens (handled via CSS max-width + overflow)
  const displayName = user?.name?.split(' ')[0] ?? '';

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
        gap: 8,
        minWidth: 0,
      }}
    >
      {/* Left — Logo or Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {showBack && (
          <button onClick={handleBack} className="btn-ghost" style={{ padding: '6px 10px', gap: 4 }}>
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

      {/* Right — Theme Toggle + User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 0 }}>
        <ThemeToggle />

        {user ? (
          <>
            <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', flexShrink: 0 }} />

            {/* Client Dashboard button — only when showDashboard prop is set */}
            {showDashboard && (
              <button
                onClick={() => navigate('/dashboard')}
                title="Client Dashboard"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px',
                  background: 'var(--bg-glass)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
                  fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                <LayoutDashboard size={14} />
                <span className="nav-dashboard-label">Client Dashboard</span>
              </button>
            )}

            {/* User pill — shows avatar + first name on mobile, full name on desktop */}
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

              {/* Name + role — hidden on very small screens via inline responsive trick */}
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                  lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: '18ch',
                }}>
                  {displayName}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
              </div>

              <span className={`badge badge-${user.role}`} style={{ marginLeft: 2, whiteSpace: 'nowrap', padding: '2px 8px', fontSize: 10 }}>
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

      {/* Hide logout text label on very small screens */}
      <style>{`
        @media (max-width: 380px) {
          .nav-logout-label { display: none; }
        }
        @media (max-width: 480px) {
          .nav-dashboard-label { display: none; }
        }
      `}</style>
    </motion.nav>
  );
}
