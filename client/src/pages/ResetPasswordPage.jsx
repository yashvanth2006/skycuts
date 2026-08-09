import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import AmbientBackground from '../components/three/AmbientBackground.jsx';
import api from '../api/axiosInstance.js';

const MotionDiv = motion.div;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({ password: '', confirmPassword: '' });

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      {/* 3D Background */}
      <AmbientBackground />

      {/* Static glow orbs */}
      <div className="glow-orb login-glow-left" style={{ width: 600, height: 600, background: 'var(--accent-blue)', top: -200, left: -200 }} />
      <div className="glow-orb login-glow-right" style={{ width: 400, height: 400, background: 'var(--accent-purple)', bottom: -150, right: -100 }} />

      {/* Login Card */}
      <MotionDiv
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, margin: '0 auto', padding: '0 20px' }}
      >
        <div className="glass-card login-card" style={{ padding: '32px 24px' }}>

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
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Set Your New Password</p>
          </MotionDiv>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <MotionDiv custom={1} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-field"
                  style={{ paddingRight: 48 }}
                  autoComplete="new-password"
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

            <MotionDiv custom={2} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input-field"
                autoComplete="new-password"
              />
            </MotionDiv>

            {/* Success */}
            {success && (
              <MotionDiv
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: 20, padding: '12px 16px',
                  background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                  borderRadius: 10, color: '#34d399', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <CheckCircle2 size={16} /> Password reset successful! Redirecting to login...
              </MotionDiv>
            )}

            {/* Error */}
            {!success && error && (
              <MotionDiv
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: 20, padding: '12px 16px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 10, color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <AlertCircle size={16} /> {error}
              </MotionDiv>
            )}

            <MotionDiv custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <button
                type="submit"
                disabled={loading || success}
                className="btn-primary"
                style={{ width: '100%', padding: '14px 0', fontSize: 15 }}
              >
                {loading ? (
                  <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing…</>
                ) : success ? (
                  'Password Reset'
                ) : (
                  'Reset Password'
                )}
              </button>
            </MotionDiv>
          </form>
        </div>
      </MotionDiv>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
