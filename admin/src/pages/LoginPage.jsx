import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axiosInstance.js';

const MotionDiv = motion.div;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect already-authenticated admins away from the login page
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload  = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const { data } = await api.post(endpoint, payload);
      const { token, ...userData } = data;
      login(userData, token);
      
      // If client accidentally logs in here, send them to the client app.
      // Otherwise (for admins), the useEffect above will redirect to /dashboard
      // as soon as the AuthContext state has fully updated.
      if (userData.role === 'client') {
        window.location.href = 'http://localhost:5175/dashboard';
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      // Show specific server message if available, otherwise a safe generic message
      setError(msg || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      {/* Static glow orbs */}
      <div className="glow-orb" style={{ width: 600, height: 600, background: 'var(--accent-blue)', top: -200, left: -200 }} />
      <div className="glow-orb" style={{ width: 400, height: 400, background: 'var(--accent-purple)', bottom: -150, right: -100 }} />

      {/* Login Card */}
      <MotionDiv
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, margin: '0 auto', padding: '0 20px' }}
      >
        <div className="glass-card" style={{ padding: '48px 40px' }}>

          {/* Logo */}
          <MotionDiv custom={0} variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(99,102,241,0.5)'
              }}>
                <Zap size={22} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>
                Sky<span className="gradient-text">Cuts</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Elite Video Review Studio</p>
          </MotionDiv>

          {/* Mode Toggle */}
          <MotionDiv custom={1} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 32 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255,255,255,0.04)', borderRadius: 12,
              padding: 4, border: '1px solid var(--border-subtle)'
            }}>
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '10px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                    transition: 'all 0.2s ease',
                    background: mode === m ? 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))' : 'transparent',
                    color: mode === m ? '#fff' : 'var(--text-muted)',
                    boxShadow: mode === m ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          </MotionDiv>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <MotionDiv
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required={mode === 'register'}
                    className="input-field"
                    autoComplete="name"
                  />
                </MotionDiv>
              )}
            </AnimatePresence>

            <MotionDiv custom={2} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input-field"
                autoComplete="email"
              />
            </MotionDiv>

            <MotionDiv custom={3} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-field"
                  style={{ paddingRight: 48 }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', padding: 0
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </MotionDiv>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <MotionDiv
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    marginBottom: 20, padding: '12px 16px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 10, color: '#f87171', fontSize: 13
                  }}
                >
                  {error}
                </MotionDiv>
              )}
            </AnimatePresence>

            <MotionDiv custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px 0', fontSize: 15 }}
              >
                {loading ? (
                  <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing…</>
                ) : mode === 'login' ? (
                  <><LogIn size={18} /> Sign In to Studio</>
                ) : (
                  <><UserPlus size={18} /> Create Account</>
                )}
              </button>
            </MotionDiv>
          </form>

          {/* Footer note */}
          <MotionDiv custom={5} variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={switchMode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-indigo)', fontSize: 12, fontWeight: 600 }}>
                {mode === 'login' ? 'Register' : 'Sign in'}
              </button>
            </p>
          </MotionDiv>
        </div>
      </MotionDiv>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
