import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Film, Users, Clock, TrendingUp, Send,
  Loader2, Search, CheckCircle, XCircle, FolderOpen,
  AlertTriangle,
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import ProjectCard from '../../components/ProjectCard.jsx';
import Modal from '../../components/Modal.jsx';
import api from '../../api/axiosInstance.js';

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.45 }}
    className="glass-card"
    style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
  >
    <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  </motion.div>
);

// ── Request status badge ───────────────────────────────────────────────────────
const REQ_STATUS = {
  pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  label: 'Pending'  },
  accepted: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   label: 'Accepted' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   label: 'Rejected' },
};

function ReqBadge({ status }) {
  const s = REQ_STATUS[status] || REQ_STATUS.pending;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>{s.label}</span>
  );
}

// ── Request row ───────────────────────────────────────────────────────────────
function RequestRow({ req, onAccept, onReject, processing }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: '16px 20px' }}
    >
      <div className="request-row-content" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        {/* Info */}
        <div className="request-info" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{req.title}</p>
            <ReqBadge status={req.status} />
          </div>
          <p className="request-client-info" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{req.client?.name}</strong>
            {' '}·{' '}{req.client?.email}
            {req.client?.mobileNumber && <>{' · '}{req.client.mobileNumber}</>}
          </p>
          <p style={{ fontSize: 12, color: 'var(--accent-blue)' }}>{req.type}</p>
          {req.description && (
            <p className="request-description" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 420 }}>
              {req.description}
            </p>
          )}
          {req.deadline && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Deadline: {new Date(req.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="request-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span className="request-date" style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>
            {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>

          {req.status === 'pending' && (
            <div className="request-buttons" style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onAccept(req._id)}
                disabled={processing === req._id}
                className="btn-accept"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                  fontSize: 13, fontWeight: 600,
                  opacity: processing === req._id ? 0.6 : 1,
                  minHeight: 44,
                }}
              >
                <CheckCircle size={14} />
                {processing === req._id ? '…' : 'Accept'}
              </button>
              <button
                onClick={() => onReject(req._id)}
                disabled={processing === req._id}
                className="btn-reject"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)',
                  cursor: 'pointer', background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                  fontSize: 13, fontWeight: 600,
                  opacity: processing === req._id ? 0.6 : 1,
                  minHeight: 44,
                }}
              >
                <XCircle size={14} />
                {processing === req._id ? '…' : 'Reject'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [form, setForm] = useState({ title: '', description: '', clientId: '', price: '' });
  const [formError, setFormError] = useState('');
  const [processing, setProcessing] = useState(null); // request id being accepted/rejected
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchAll = useCallback(async () => {
    try {
      const [projRes, clientRes, reqRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/clients'),
        api.get('/project-requests'),
      ]);
      setProjects(projRes.data);
      setClients(clientRes.data);
      setRequests(reqRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.clientId) { setFormError('Title and client are required.'); return; }
    setCreating(true); setFormError('');
    try {
      await api.post('/projects', {
        title: form.title, description: form.description,
        clientId: form.clientId, price: parseFloat(form.price) || 0,
      });
      setModalOpen(false);
      setForm({ title: '', description: '', clientId: '', price: '' });
      await fetchAll();
      showToast('Project created successfully');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project.');
    } finally { setCreating(false); }
  };

  const handleAccept = async (id) => {
    setProcessing(id);
    try {
      await api.patch(`/project-requests/${id}/accept`);
      await fetchAll();
      showToast('Request accepted — project workspace created');
      setActiveTab('projects');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept request');
    } finally { setProcessing(null); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this project request? This cannot be undone.')) return;
    setProcessing(id);
    try {
      await api.patch(`/project-requests/${id}/reject`);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'rejected' } : r));
      showToast('Request rejected');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject request');
    } finally { setProcessing(null); }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const stats = [
    { icon: Film,       label: 'Total Projects',    value: projects.length,  color: '#6366f1' },
    { icon: Users,      label: 'Active Clients',    value: clients.length,   color: '#22d3ee' },
    { icon: Send,       label: 'Pending Requests',  value: pendingRequests.length, color: '#f59e0b' },
    { icon: TrendingUp, label: 'Paid',              value: projects.filter(p => p.status === 'paid').length, color: '#34d399' },
  ];

  return (
    <div className="page-container">
      <Navbar />

      <main className="content-area" style={{ paddingTop: 32 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 className="dashboard-title" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Studio Dashboard</h1>
            <p className="dashboard-subtitle" style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage projects and incoming client requests.</p>
          </div>
          <button id="create-project-btn" onClick={() => setModalOpen(true)} className="btn-primary" style={{ flexShrink: 0, minHeight: 44 }}>
            <Plus size={18} /> New Project
          </button>
        </motion.div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 36 }}>
          {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        {/* Tabs */}
        <div className="tabs-container" style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24, paddingBottom: 0, overflowX: 'auto' }}>
          {[
            { id: 'projects', label: 'Projects',          icon: FolderOpen, count: null },
            { id: 'requests', label: 'Project Requests',  icon: Send, count: pendingRequests.length, badge: pendingRequests.length > 0 },
          ].map(({ id, label, icon: Icon, count, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="tab-button"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', border: 'none', background: 'none',
                fontSize: 14, fontWeight: activeTab === id ? 600 : 500,
                color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                marginBottom: -1, cursor: 'pointer', transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} /> {label}
              {badge && (
                <span style={{ padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: '#f59e0b', color: '#111', marginLeft: 2 }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Projects tab ── */}
        {activeTab === 'projects' && (
          <>
            <div className="search-container" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div className="search-wrapper" style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 400 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or clients…" className="input-field" style={{ paddingLeft: 40, width: '100%' }} />
              </div>
              <p className="search-count" style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Loader2 size={32} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Film size={40} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block', color: 'var(--accent-indigo)' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                  {search ? 'No projects match your search.' : 'No projects yet. Accept a request or create one manually.'}
                </p>
              </div>
            ) : (
              <div className="grid-auto">
                {filtered.map((p, i) => (
                  <ProjectCard key={p._id} project={p} index={i} basePath="" />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Requests tab ── */}
        {activeTab === 'requests' && (
          loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <Loader2 size={32} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : requests.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Send size={40} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block', color: 'var(--accent-indigo)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No project requests yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingRequests.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <AlertTriangle size={15} color="#f59e0b" />
                  <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>{pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''} awaiting review</span>
                </div>
              )}
              {requests.map(req => (
                <RequestRow key={req._id} req={req} onAccept={handleAccept} onReject={handleReject} processing={processing} />
              ))}
            </div>
          )
        )}
      </main>

      {/* Create Project Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setFormError(''); }} title="Create New Project">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { label: 'Project Title *', key: 'title', type: 'text', placeholder: 'e.g. Brand Campaign Edit' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="input-field" required={key === 'title'} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief project description…" className="input-field" rows={3} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assign Client *</label>
            <select value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} className="input-field" required style={{ appearance: 'none', cursor: 'pointer' }}>
              <option value="">Select a client…</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invoice Price (USD)</label>
            <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" className="input-field" min="0" step="0.01" />
          </div>
          {formError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>{formError}</div>
          )}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary" style={{ flex: 2 }}>
              {creating ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating…</> : <><Plus size={16} /> Create Project</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
          padding: '12px 18px', background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: 14, fontWeight: 500,
          maxWidth: 'calc(100% - 48px)',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .dashboard-title {
            font-size: 24px;
          }
          .dashboard-subtitle {
            font-size: 13px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .tab-button {
            padding: 10px 14px;
            font-size: 13px;
          }
          .search-wrapper {
            max-width: 100%;
          }
          .request-row-content {
            flex-direction: column;
            gap: 12px;
          }
          .request-info {
            min-width: 100%;
          }
          .request-client-info {
            flex-wrap: wrap;
          }
          .request-description {
            max-width: 100%;
            white-space: normal;
          }
          .request-actions {
            width: 100%;
            justify-content: space-between;
            align-items: center;
          }
          .request-buttons {
            width: 100%;
            justify-content: space-between;
          }
          .btn-accept,
          .btn-reject {
            flex: 1;
            justify-content: center;
          }
          .request-date {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-title {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}
