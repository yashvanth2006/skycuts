import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Film, Users, Clock, TrendingUp,
  Loader2, ChevronRight, Search, AlertCircle, Archive, RotateCcw, CheckSquare, Square, Trash2, DollarSign, Upload, FileText
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import ProjectCard from '../../components/ProjectCard.jsx';
import SkeletonCard from '../../components/SkeletonCard.jsx';
import Modal from '../../components/Modal.jsx';
import BulkClientUpload from '../../components/BulkClientUpload.jsx';
import api from '../../api/axiosInstance.js';

const StatCard = ({ icon: Icon, label, value, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.45 }}
    className="glass-card admin-stat-card"
    style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}
  >
    <div className="admin-stat-icon" style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{label}</p>
      <p className="admin-stat-value" style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkClientUploadOpen, setBulkClientUploadOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', clientId: '', price: '' });
  const [formError, setFormError] = useState('');

  const fetchAll = async () => {
    try {
      setError(null);
      const [projRes, clientRes] = await Promise.all([
        api.get(`/projects?includeArchived=${showArchived}`),
        api.get('/projects/clients'),
      ]);
      setProjects(projRes.data);
      setClients(clientRes.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [showArchived]);

  const handleArchive = async (projectId) => {
    setProjects(prev => prev.filter(p => p._id !== projectId));
  };

  const handleRestore = async (projectId) => {
    await fetchAll();
  };

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const selectAllProjects = () => {
    if (selectedProjects.size === filtered.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filtered.map(p => p._id)));
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedProjects.size === 0) return;
    
    setBulkUpdating(true);
    try {
      await api.patch('/projects/bulk/status', {
        projectIds: Array.from(selectedProjects),
        status,
      });
      setSelectedProjects(new Set());
      setBulkActionOpen(false);
      await fetchAll();
    } catch (err) {
      console.error('Bulk update failed:', err);
      setError('Failed to update projects');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedProjects.size === 0) return;
    
    setBulkUpdating(true);
    try {
      await api.patch('/projects/bulk/archive', {
        projectIds: Array.from(selectedProjects),
      });
      setSelectedProjects(new Set());
      setBulkActionOpen(false);
      await fetchAll();
    } catch (err) {
      console.error('Bulk archive failed:', err);
      setError('Failed to archive projects');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      setFormError('Project title is required.');
      return;
    }
    if (!form.clientId) {
      setFormError('Please select a client.');
      return;
    }
    if (form.price && isNaN(parseFloat(form.price))) {
      setFormError('Please enter a valid price.');
      return;
    }
    
    setCreating(true);
    setFormError('');
    try {
      await api.post('/projects', {
        title: form.title.trim(),
        description: form.description.trim(),
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
          className="admin-header"
          style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Editor Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage all your client projects from one place.</p>
          </div>
          <div className="admin-header-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              id="create-project-btn"
              onClick={() => setModalOpen(true)}
              className="btn-primary"
              style={{ flex: 1, minWidth: '140px' }}
            >
              <Plus size={18} /> New Project
            </button>
            <button
              onClick={() => setBulkClientUploadOpen(true)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flex: 1,
                minWidth: '140px',
              }}
            >
              <Upload size={16} /> Bulk Import Clients
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
          {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        {/* Search + Projects */}
        <div className="admin-search-bar" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="admin-search-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={selectAllProjects} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: selectedProjects.size > 0 ? 'var(--accent-blue)' : 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: selectedProjects.size > 0 ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
            {selectedProjects.size === filtered.length ? <CheckSquare size={14} /> : <Square size={14} />}
            {selectedProjects.size > 0 ? `${selectedProjects.size} selected` : 'Select All'}
          </button>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or clients…" className="input-field" style={{ paddingLeft: 40 }} />
          </div>
          <button onClick={() => setShowArchived(!showArchived)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: showArchived ? 'var(--accent-purple)' : 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: showArchived ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
            {showArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          {selectedProjects.size > 0 && <button onClick={() => setBulkActionOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'var(--accent-green)', border: '1px solid var(--accent-green)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>Bulk Actions</button>}
          <p style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Project Grid */}
        {error ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block', color: '#ef4444' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 16 }}>{error}</p>
            <button onClick={fetchAll} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} delay={i * 0.05} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Film size={40} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block', color: 'var(--accent-indigo)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 16 }}>
                {search ? 'No projects match your search.' : 'No projects yet. Create your first one!'}
              </p>
              {!search && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: 13 }}
                >
                  <Plus size={14} /> Create Project
                </button>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="grid-auto">
            {filtered.map((p, i) => (
              <ProjectCard 
                key={p._id} 
                project={p} 
                index={i} 
                basePath="/profile"
                onArchive={handleArchive}
                onRestore={handleRestore}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bulk Client Upload Modal */}
      <BulkClientUpload
        isOpen={bulkClientUploadOpen}
        onClose={() => setBulkClientUploadOpen(false)}
        onSuccess={fetchAll}
      />

      {/* Bulk Actions Modal */}
      <Modal isOpen={bulkActionOpen} onClose={() => setBulkActionOpen(false)} title={`Bulk Actions (${selectedProjects.size} projects)`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => handleBulkStatusUpdate('in_progress')}
            disabled={bulkUpdating}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              cursor: bulkUpdating ? 'not-allowed' : 'pointer',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Clock size={16} /> Mark as In Progress
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('in_review')}
            disabled={bulkUpdating}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              cursor: bulkUpdating ? 'not-allowed' : 'pointer',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckSquare size={16} /> Mark as In Review
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('paid')}
            disabled={bulkUpdating}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              cursor: bulkUpdating ? 'not-allowed' : 'pointer',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <DollarSign size={16} /> Mark as Paid
          </button>
          <hr className="divider" />
          <button
            onClick={handleBulkArchive}
            disabled={bulkUpdating}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              cursor: bulkUpdating ? 'not-allowed' : 'pointer',
              color: '#ef4444',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Archive size={16} /> Archive Selected
          </button>
        </div>
      </Modal>

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
