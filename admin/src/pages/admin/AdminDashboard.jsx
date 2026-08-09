import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Film, Users, Clock, TrendingUp,
  Loader2, ChevronRight, Search
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import ProjectCard from '../../components/ProjectCard.jsx';
import Modal from '../../components/Modal.jsx';
import api from '../../api/axiosInstance.js';

const StatCard = ({ icon: Icon, label, value, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.45 }}
    className="glass-card"
    style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
  >
    <div style={{
      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [form, setForm] = useState({ title: '', description: '', clientId: '', price: '' });
  const [formError, setFormError] = useState('');

  const fetchAll = async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/clients'),
      ]);
      setProjects(projRes.data);
      setClients(clientRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.clientId) {
      setFormError('Title and client are required.');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      await api.post('/projects', {
        title: form.title,
        description: form.description,
        clientId: form.clientId,
        price: parseFloat(form.price) || 0,
      });
      setModalOpen(false);
      setForm({ title: '', description: '', clientId: '', price: '' });
      await fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { icon: Film,       label: 'Total Projects',  value: projects.length,  color: '#6366f1' },
    { icon: Users,      label: 'Active Clients',  value: clients.length,   color: '#22d3ee' },
    { icon: Clock,      label: 'In Review',        value: projects.filter(p => p.status === 'in_review').length,  color: '#c084fc' },
    { icon: TrendingUp, label: 'Paid',             value: projects.filter(p => p.status === 'paid').length,       color: '#34d399' },
  ];

  return (
    <div className="page-container">
      <Navbar />

      <main className="content-area" style={{ paddingTop: 32 }}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Studio Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage all your client projects from one place.</p>
          </div>
          <button
            id="create-project-btn"
            onClick={() => setModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={18} /> New Project
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 36 }}>
          {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        {/* Search + Projects */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects or clients…"
              className="input-field"
              style={{ paddingLeft: 40 }}
            />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={32} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Film size={40} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block', color: 'var(--accent-indigo)' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              {search ? 'No projects match your search.' : 'No projects yet. Create your first one!'}
            </p>
          </div>
        ) : (
          <div className="grid-auto">
            {filtered.map((p, i) => (
              <ProjectCard key={p._id} project={p} index={i} basePath="/admin" />
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setFormError(''); }} title="Create New Project">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Project Title *
            </label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Brand Campaign Edit"
              className="input-field"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief project description…"
              className="input-field"
              rows={3}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Assign Client *
            </label>
            <select
              value={form.clientId}
              onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
              className="input-field"
              required
              style={{ appearance: 'none', cursor: 'pointer' }}
            >
              <option value="">Select a client…</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Invoice Price (USD)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder="0.00"
              className="input-field"
              min="0"
              step="0.01"
            />
          </div>

          {formError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary" style={{ flex: 2 }}>
              {creating ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating…</> : <><Plus size={16} /> Create Project</>}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
