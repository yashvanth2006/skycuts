import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Loader2, Zap, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import ProjectCard from '../../components/ProjectCard.jsx';
import SkeletonCard from '../../components/SkeletonCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axiosInstance.js';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setError(null);
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (e) {
        console.error(e);
        setError('Failed to load projects. Please check your connection and try again.');
      }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="page-container">
      <Navbar />

      {/* Ambient glow orbs */}
      <div className="glow-orb" style={{ width: 500, height: 500, background: 'var(--accent-blue)', top: -200, right: -150 }} />
      <div className="glow-orb" style={{ width: 300, height: 300, background: 'var(--accent-purple)', bottom: 100, left: -100 }} />

      <main className="content-area" style={{ position: 'relative', zIndex: 1, paddingTop: 40 }}>
        {/* Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48, textAlign: 'center' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100, marginBottom: 20,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <Zap size={14} color="var(--accent-blue)" />
            <span style={{ fontSize: 13, color: 'var(--accent-indigo)', fontWeight: 500 }}>Your Studio Portal</span>
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.03em' }}>
            Welcome back,{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple), var(--accent-luma))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>
              {user?.name?.split(' ')[0]}
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Review your video deliverables, leave time-stamped feedback, and download your final files.
          </p>
        </motion.div>

        {/* Projects Section */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Your Projects</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {projects.length} active project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>

        {error ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block', color: '#ef4444' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 16 }}>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              Refresh Page
            </button>
          </div>
        ) : loading ? (
          <div className="grid-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} delay={i * 0.05} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{ textAlign: 'center', padding: '80px 20px' }}
          >
            <Film size={48} style={{ margin: '0 auto 20px', opacity: 0.15, display: 'block', color: 'var(--accent-indigo)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No projects yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 320, margin: '0 auto' }}>
              Your editor will create a project and invite you once work begins.
            </p>
          </motion.div>
        ) : (
          <div className="grid-auto">
            {projects.map((p, i) => (
              <ProjectCard key={p._id} project={p} index={i} basePath="/dashboard" />
            ))}
          </div>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
