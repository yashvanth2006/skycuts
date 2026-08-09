import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Film, Loader2, Zap, Clock, CheckCircle, XCircle,
    FolderOpen, ChevronRight, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import ProjectCard from '../../components/ProjectCard.jsx';
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
function RequestCard({ req, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card"
            style={{ padding: '18px 22px' }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.title}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{req.type}</p>
                    {req.description && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 420 }}>
                            {req.description}
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <StatusBadge status={req.status} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>
            {req.status === 'rejected' && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 13, color: '#fca5a5' }}>
                    This request was not accepted. You may submit a new request from the editor profile.
                </div>
            )}
            {req.status === 'accepted' && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', fontSize: 13, color: '#86efac' }}>
                    Your project workspace has been created. Check the Projects tab to get started.
                </div>
            )}
        </motion.div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ClientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);

    useEffect(() => {
        api.get('/projects')
            .then(r => setProjects(r.data))
            .catch(() => {})
            .finally(() => setLoadingProjects(false));

        api.get('/project-requests')
            .then(r => setRequests(r.data))
            .catch(() => {})
            .finally(() => setLoadingRequests(false));
    }, []);

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <div className="page-container">
            <Navbar />

            {/* Ambient glows */}
            <div className="glow-orb" style={{ width: 500, height: 500, background: 'var(--accent-blue)', top: -200, right: -150 }} />
            <div className="glow-orb" style={{ width: 300, height: 300, background: 'var(--accent-purple)', bottom: 100, left: -100 }} />

            <main className="content-area" style={{ position: 'relative', zIndex: 1, paddingTop: 40 }}>

                {/* Welcome hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: 40, textAlign: 'center' }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px', borderRadius: 100, marginBottom: 20,
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)'
                    }}>
                        <Zap size={14} color="var(--accent-blue)" />
                        <span style={{ fontSize: 13, color: 'var(--accent-indigo)', fontWeight: 500 }}>Your Studio Portal</span>
                    </div>
                    <h1 style={{ fontSize: 34, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.03em' }}>
                        Welcome back,{' '}
                        <span style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple), var(--accent-luma))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            {user?.name?.split(' ')[0]}
                        </span>
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
                        Review deliverables, leave feedback, and track your project requests.
                    </p>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
                    {[
                        { id: 'projects', label: 'My Projects', icon: FolderOpen, count: projects.length },
                        { id: 'requests', label: 'My Requests', icon: Send, count: pendingCount, badge: pendingCount > 0 },
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
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Projects tab ── */}
                {activeTab === 'projects' && (
                    loadingProjects ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                            <Loader2 size={32} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
                        </div>
                    ) : projects.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <Film size={48} style={{ margin: '0 auto 20px', opacity: 0.15, display: 'block', color: 'var(--accent-indigo)' }} />
                            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No projects yet</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 340, margin: '0 auto 20px' }}>
                                Once the editor accepts your request, your project workspace will appear here.
                            </p>
                            <button
                                onClick={() => setActiveTab('requests')}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                    background: 'var(--accent-blue)', color: '#fff', border: 'none', cursor: 'pointer',
                                }}
                            >
                                View Requests <ChevronRight size={15} />
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid-auto">
                            {projects.map((p, i) => (
                                <ProjectCard key={p._id} project={p} index={i} basePath="/dashboard" />
                            ))}
                        </div>
                    )
                )}

                {/* ── Requests tab ── */}
                {activeTab === 'requests' && (
                    loadingRequests ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                            <Loader2 size={32} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
                        </div>
                    ) : requests.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <Send size={48} style={{ margin: '0 auto 20px', opacity: 0.15, display: 'block', color: 'var(--accent-indigo)' }} />
                            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No requests yet</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 340, margin: '0 auto 20px' }}>
                                Visit the editor profile to start a project request.
                            </p>
                            <button
                                onClick={() => navigate('/profile')}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                    background: 'var(--accent-blue)', color: '#fff', border: 'none', cursor: 'pointer',
                                }}
                            >
                                Go to Editor Profile <ChevronRight size={15} />
                            </button>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {requests.map((req, i) => (
                                <RequestCard key={req._id} req={req} index={i} />
                            ))}
                        </div>
                    )
                )}
            </main>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
