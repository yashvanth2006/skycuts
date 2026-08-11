import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, Loader2, Send,
    FolderOpen, User, Mail, Phone, Calendar, ChevronRight,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axiosInstance.js';

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending:  { icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  label: 'Pending Review' },
    accepted: { icon: CheckCircle,  color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   label: 'Accepted' },
    rejected: { icon: XCircle,      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   label: 'Rejected' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
        }}>
            <Icon size={11} /> {cfg.label}
        </span>
    );
}

// ── Request card ──────────────────────────────────────────────────────────────
function RequestCard({ req, index, onAccept, onReject }) {
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState(null);

    const handleAction = async (actionType) => {
        try {
            setLoading(true);
            setAction(actionType);
            if (actionType === 'accept') {
                await onAccept(req._id);
            } else {
                await onReject(req._id);
            }
        } catch (err) {
            console.error('Action failed:', err);
        } finally {
            setLoading(false);
            setAction(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card"
            style={{ padding: '20px 24px' }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.title}
                        </h3>
                        <StatusBadge status={req.status} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--accent-indigo)', fontWeight: 500, marginBottom: 8 }}>
                        {req.type}
                    </p>
                    {req.description && (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                            {req.description}
                        </p>
                    )}
                    {req.client && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <User size={12} /> {req.client.name}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Mail size={12} /> {req.client.email}
                            </span>
                            {req.client.mobileNumber && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Phone size={12} /> {req.client.mobileNumber}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button
                                onClick={() => handleAction('accept')}
                                disabled={loading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 6,
                                    background: 'var(--accent-green)', color: '#fff',
                                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: 13, fontWeight: 600,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading && action === 'accept' ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={14} />}
                                Accept
                            </button>
                            <button
                                onClick={() => handleAction('reject')}
                                disabled={loading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 6,
                                    background: 'var(--bg-glass)', color: 'var(--text-muted)',
                                    border: '1px solid var(--border-subtle)', cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: 13, fontWeight: 500,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading && action === 'reject' ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <XCircle size={14} />}
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {req.requirements && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 6, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Requirements: </span>
                    {req.requirements}
                </div>
            )}
            {req.deadline && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    Deadline: {new Date(req.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            )}
        </motion.div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests'); // requests | projects
    const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
    const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }

    useEffect(() => {
        fetchRequests();
        fetchProjects();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/project-requests');
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        }
    };

    const handleAccept = async (id) => {
        if (!window.confirm('Accept this project request?')) return;

        try {
            const res = await api.patch(`/project-requests/${id}/accept`);
            await fetchRequests();
            await fetchProjects();
            setMessage({ type: 'success', text: 'Project request accepted. Project created successfully.' });
            setTimeout(() => setMessage(null), 4000);
        } catch (err) {
            console.error('Failed to accept request:', err);
            const errorMsg = err.response?.data?.message || 'Failed to accept request';
            setMessage({ type: 'error', text: errorMsg });
            setTimeout(() => setMessage(null), 4000);
            throw err;
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this project request?')) return;

        try {
            await api.patch(`/project-requests/${id}/reject`);
            await fetchRequests();
            setMessage({ type: 'success', text: 'Project request rejected.' });
            setTimeout(() => setMessage(null), 4000);
        } catch (err) {
            console.error('Failed to reject request:', err);
            const errorMsg = err.response?.data?.message || 'Failed to reject request';
            setMessage({ type: 'error', text: errorMsg });
            setTimeout(() => setMessage(null), 4000);
            throw err;
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <div className="page-container">
            <Navbar />

            {/* Ambient glows */}
            <div className="glow-orb" style={{ width: 500, height: 500, background: 'var(--accent-blue)', top: -200, right: -150 }} />
            <div className="glow-orb" style={{ width: 300, height: 300, background: 'var(--accent-purple)', bottom: 100, left: -100 }} />

            {/* Toast message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{
                        position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
                        zIndex: 1000, padding: '12px 20px', borderRadius: 8,
                        background: message.type === 'success' ? 'rgba(34,197,94,0.95)' : 'rgba(239,68,68,0.95)',
                        color: '#fff', fontSize: 14, fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                >
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </motion.div>
            )}

            <main className="content-area" style={{ position: 'relative', zIndex: 1, paddingTop: 40 }}>

                {/* Welcome hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: 40, textAlign: 'center' }}
                >
                    <h1 style={{ fontSize: 34, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.03em' }}>
                        Project Requests
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
                        Review and manage incoming project requests from clients.
                    </p>
                </motion.div>

                {/* Main tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
                    {[
                        { id: 'requests', label: 'Project Requests', icon: Send, count: requests.length, badge: pendingCount > 0 },
                        { id: 'projects', label: 'Projects', icon: FolderOpen, count: projects.length },
                    ].map(({ id, label, icon: Icon, count, badge }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '10px 18px', border: 'none', background: 'none',
                                fontSize: 14, fontWeight: activeTab === id ? 600 : 500,
                                color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
                                borderBottom: activeTab === id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                                marginBottom: -1, cursor: 'pointer', transition: 'all 0.15s ease',
                                position: 'relative',
                            }}
                        >
                            <Icon size={15} /> {label}
                            {badge && (
                                <span style={{
                                    padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                                    background: 'var(--accent-blue)', color: '#fff', marginLeft: 2,
                                }}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Requests tab */}
                {activeTab === 'requests' && (
                    <>
                        {/* Filter tabs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
                            {[
                                { id: 'all', label: 'All', icon: Send, count: requests.length },
                                { id: 'pending', label: 'Pending', icon: Clock, count: pendingCount, badge: pendingCount > 0 },
                                { id: 'accepted', label: 'Accepted', icon: CheckCircle, count: requests.filter(r => r.status === 'accepted').length },
                                { id: 'rejected', label: 'Rejected', icon: XCircle, count: requests.filter(r => r.status === 'rejected').length },
                            ].map(({ id, label, icon: Icon, count, badge }) => (
                                <button
                                    key={id}
                                    onClick={() => setFilter(id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 7,
                                        padding: '8px 16px', border: 'none', background: 'none',
                                        fontSize: 13, fontWeight: filter === id ? 600 : 500,
                                        color: filter === id ? 'var(--text-primary)' : 'var(--text-muted)',
                                        borderBottom: filter === id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                                        marginBottom: -1, cursor: 'pointer', transition: 'all 0.15s ease',
                                        position: 'relative',
                                    }}
                                >
                                    <Icon size={14} /> {label}
                                    {badge && (
                                        <span style={{
                                            padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                                            background: 'var(--accent-blue)', color: '#fff', marginLeft: 2,
                                        }}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Requests list */}
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                                <Loader2 size={32} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                                <Send size={48} style={{ margin: '0 auto 20px', opacity: 0.15, display: 'block', color: 'var(--accent-indigo)' }} />
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No requests found</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 340, margin: '0 auto 20px' }}>
                                    {filter === 'pending' ? 'No pending requests to review.' : 'No requests match the current filter.'}
                                </p>
                                {filter !== 'all' && (
                                    <button
                                        onClick={() => setFilter('all')}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                            background: 'var(--accent-blue)', color: '#fff', border: 'none', cursor: 'pointer',
                                        }}
                                    >
                                        View All <ChevronRight size={15} />
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {filteredRequests.map((req, i) => (
                                    <RequestCard
                                        key={req._id}
                                        req={req}
                                        index={i}
                                        onAccept={handleAccept}
                                        onReject={handleReject}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Projects tab */}
                {activeTab === 'projects' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                                <Loader2 size={32} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
                            </div>
                        ) : projects.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                                <FolderOpen size={48} style={{ margin: '0 auto 20px', opacity: 0.15, display: 'block', color: 'var(--accent-indigo)' }} />
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No projects yet</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 340, margin: '0 auto' }}>
                                    Accepted project requests will appear here.
                                </p>
                            </motion.div>
                        ) : (
                            projects.map((project, i) => (
                                <motion.div
                                    key={project._id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card"
                                    style={{ padding: '20px 24px', cursor: 'pointer' }}
                                    onClick={() => navigate(`/admin/project/${project._id}`)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 8 }}>
                                                {project.title}
                                            </h3>
                                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                                                {project.description || 'No description'}
                                            </p>
                                            {project.client && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                                    <User size={12} /> {project.client.name || project.client.email}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <ChevronRight size={16} color="var(--accent-blue)" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </main>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
