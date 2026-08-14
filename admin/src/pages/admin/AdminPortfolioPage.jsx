import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Eye, EyeOff,
    Film, Loader2, CheckCircle, X, AlertTriangle, PlayCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import api from '../../api/axiosInstance.js';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const Badge = ({ published }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
        background: published ? 'rgba(34,197,94,0.12)' : 'rgba(100,100,100,0.12)',
        border: `1px solid ${published ? 'rgba(34,197,94,0.3)' : 'rgba(100,100,100,0.25)'}`,
        color: published ? '#4ade80' : 'var(--text-muted)',
    }}>
        {published ? <Eye size={12} /> : <EyeOff size={12} />}
        {published ? 'Published' : 'Draft'}
    </span>
);

// ─── Portfolio Item Form Modal ────────────────────────────────────────────────
function PortfolioModal({ item, onClose, onSave }) {
    const isEdit = Boolean(item?._id);
    const [form, setForm] = useState({
        title: item?.title || '',
        description: item?.description || '',
        category: item?.category || '',
        thumbnail: item?.thumbnail || '',
        videoUrl: item?.videoUrl || '',
        isPublished: item?.isPublished ?? false,
        order: item?.order ?? 0,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return setError('Title is required');
        setSaving(true);
        setError('');
        try {
            if (isEdit) {
                const res = await api.put(`/portfolio/${item._id}`, form);
                onSave(res.data, 'update');
            } else {
                const res = await api.post('/portfolio', form);
                onSave(res.data, 'create');
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16
        }}>
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12, padding: '24px 24px',
                    width: '100%', maxWidth: 520,
                    maxHeight: '90vh', overflowY: 'auto',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>{isEdit ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, marginBottom: 16, color: '#f87171', fontSize: 13 }}>
                        <AlertTriangle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                        { label: 'Title *', key: 'title', placeholder: 'AURORA — Fashion Campaign' },
                        { label: 'Category', key: 'category', placeholder: 'Commercial / Music Video / Narrative / Documentary' },
                        { label: 'Thumbnail URL', key: 'thumbnail', placeholder: 'https://...' },
                        { label: 'Video URL', key: 'videoUrl', placeholder: 'https://...' },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>{label}</label>
                            <input
                                type="text"
                                value={form[key]}
                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                placeholder={placeholder}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)', borderRadius: 8,
                                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    ))}

                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Description</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Brief description of the work..."
                            style={{
                                width: '100%', padding: '12px', resize: 'vertical',
                                background: 'var(--bg-input)', color: 'var(--text-primary)',
                                border: '1px solid var(--border-subtle)', borderRadius: 8,
                                fontSize: 14, outline: 'none', boxSizing: 'border-box',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Display Order</label>
                            <input
                                type="number"
                                min={0}
                                value={form.order}
                                onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)', borderRadius: 8,
                                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                                <input
                                    type="checkbox"
                                    checked={form.isPublished}
                                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                                    style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)' }}
                                />
                                Publish immediately
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                        <button type="button" onClick={onClose} style={{ padding: '12px 20px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Main Portfolio Management Page ──────────────────────────────────────────
export default function AdminPortfolioPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalItem, setModalItem] = useState(null); // null = closed, {} = new, {_id,...} = edit
    const [modalOpen, setModalOpen] = useState(false);
    const [toast, setToast] = useState('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await api.get('/portfolio');
            setItems(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load portfolio items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const handleSave = (savedItem, type) => {
        if (type === 'create') {
            setItems(prev => [savedItem, ...prev]);
            showToast('Portfolio item created');
        } else {
            setItems(prev => prev.map(i => i._id === savedItem._id ? savedItem : i));
            showToast('Portfolio item updated');
        }
    };

    const handleTogglePublish = async (item) => {
        try {
            const res = await api.put(`/portfolio/${item._id}`, { isPublished: !item.isPublished });
            setItems(prev => prev.map(i => i._id === item._id ? res.data : i));
            showToast(`Item ${res.data.isPublished ? 'published' : 'unpublished'}`);
        } catch {
            showToast('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this portfolio item? This cannot be undone.')) return;
        try {
            await api.delete(`/portfolio/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
            showToast('Portfolio item deleted');
        } catch {
            showToast('Failed to delete item');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-void)', color: 'var(--text-primary)', width: '100%' }}>
            <Navbar />

            <div className="portfolio-container">
                {/* Responsive Page header */}
                <div className="portfolio-header">
                    <div className="portfolio-header-text">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <Film size={22} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                            <h1 className="portfolio-title">Portfolio Management</h1>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            Manage the public showcase items displayed on the editor profile.
                        </p>
                    </div>
                    <button
                        className="add-item-btn"
                        onClick={() => { setModalItem({}); setModalOpen(true); }}
                    >
                        <Plus size={18} /> Add Item
                    </button>
                </div>

                {/* Error state */}
                {error && (
                    <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', marginBottom: 24, fontSize: 14 }}>
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 0', color: 'var(--text-muted)' }}>
                        <Loader2 size={24} className="spin" color="var(--accent-blue)" />
                        <span style={{ fontSize: 14 }}>Loading portfolio items...</span>
                    </div>
                )}

                {/* Empty state */}
                {!loading && items.length === 0 && !error && (
                    <div className="empty-state">
                        <Film size={48} className="empty-icon" />
                        <h2 className="empty-title">No portfolio items yet</h2>
                        <p className="empty-subtitle">Add your first showcase video to your editor profile.</p>
                        <button
                            onClick={() => { setModalItem({}); setModalOpen(true); }}
                            className="empty-add-btn"
                        >
                            <Plus size={18} /> Add Item
                        </button>
                    </div>
                )}

                {/* Items Grid */}
                {!loading && items.length > 0 && (
                    <div className="portfolio-grid">
                        {items.map((item, i) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="portfolio-card glass-card"
                            >
                                {/* Thumbnail Header */}
                                <div className="card-thumbnail-container">
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt={item.title} className="card-thumbnail" />
                                    ) : (
                                        <div className="card-thumbnail-placeholder">
                                            <PlayCircle size={32} color="var(--text-muted)" opacity={0.3} />
                                        </div>
                                    )}
                                    <div className="card-order-badge">
                                        {item.order ?? i}
                                    </div>
                                    <div className="card-status-badge">
                                        <Badge published={item.isPublished} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="card-content">
                                    <h3 className="card-title" title={item.title}>{item.title}</h3>
                                    {item.category && <span className="card-category">{item.category}</span>}
                                    {item.description && <p className="card-description" title={item.description}>{item.description}</p>}
                                </div>

                                {/* Actions Footer */}
                                <div className="card-actions">
                                    <button
                                        onClick={() => handleTogglePublish(item)}
                                        title={item.isPublished ? 'Unpublish' : 'Publish'}
                                        className="card-action-btn"
                                    >
                                        {item.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        onClick={() => { setModalItem(item); setModalOpen(true); }}
                                        title="Edit"
                                        className="card-action-btn edit-btn"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        title="Delete"
                                        className="card-action-btn delete-btn"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <PortfolioModal
                    item={modalItem}
                    onClose={() => { setModalOpen(false); setModalItem(null); }}
                    onSave={handleSave}
                />
            )}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 18px', background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)', borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: 14, fontWeight: 500,
                }}>
                    <CheckCircle size={16} color="var(--accent-blue)" /> {toast}
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 0.8s linear infinite; }

                /* Base container responsive padding */
                .portfolio-container {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 24px 16px;
                    box-sizing: border-box;
                }
                
                @media (min-width: 768px) {
                    .portfolio-container {
                        padding: 32px;
                    }
                }
                @media (min-width: 1024px) {
                    .portfolio-container {
                        padding: 40px 80px;
                    }
                }

                /* Responsive Header */
                .portfolio-header {
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .portfolio-header-text {
                    flex: 1;
                    min-width: 0;
                }
                .portfolio-title {
                    font-size: clamp(24px, 4vw, 32px);
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                    white-space: normal;
                }
                .add-item-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 0 20px;
                    min-height: 44px;
                    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    box-shadow: 0 4px 12px rgba(99,102,241,0.25);
                    transition: opacity 0.2s, transform 0.2s;
                }
                .add-item-btn:active {
                    transform: scale(0.98);
                }
                @media (min-width: 768px) {
                    .portfolio-header {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .add-item-btn {
                        width: auto;
                    }
                }

                /* Empty State */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-muted);
                    background: var(--bg-card);
                    border: 1px dashed var(--border-subtle);
                    border-radius: 12px;
                }
                .empty-icon {
                    opacity: 0.4;
                    margin-bottom: 20px;
                    color: var(--accent-indigo);
                }
                .empty-title {
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }
                .empty-subtitle {
                    font-size: 14px;
                    margin-bottom: 24px;
                    max-width: 300px;
                    line-height: 1.5;
                }
                .empty-add-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 24px;
                    min-height: 44px;
                    background: var(--bg-glass);
                    color: var(--text-primary);
                    border: 1px solid var(--border-subtle);
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .empty-add-btn:hover {
                    background: var(--bg-glass-hover);
                    border-color: var(--border-glow);
                }
                @media (min-width: 1024px) {
                    .empty-state {
                        padding: 100px 20px;
                    }
                }

                /* Responsive Grid */
                .portfolio-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                @media (min-width: 768px) {
                    .portfolio-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 20px;
                    }
                }
                @media (min-width: 1024px) {
                    .portfolio-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 24px;
                    }
                }

                /* Card Design */
                .portfolio-card {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    padding: 0;
                    min-width: 0; /* crucial for grid containment */
                }
                .card-thumbnail-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 16/9;
                    background: #111;
                    border-bottom: 1px solid var(--border-subtle);
                }
                .card-thumbnail {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .card-thumbnail-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(145deg, rgba(99,102,241,0.05), rgba(0,0,0,0.5));
                }
                .card-order-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 700;
                    color: #fff;
                }
                .card-status-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                }
                
                .card-content {
                    padding: 16px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .card-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-category {
                    font-size: 12px;
                    color: var(--accent-blue);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    width: fit-content;
                }
                .card-description {
                    font-size: 13px;
                    color: var(--text-muted);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.5;
                    margin-top: 4px;
                }

                .card-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: rgba(255,255,255,0.02);
                    border-top: 1px solid var(--border-subtle);
                }
                .card-action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px 0;
                    background: var(--bg-input);
                    border: 1px solid var(--border-subtle);
                    border-radius: 6px;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }
                .card-action-btn:hover {
                    background: var(--bg-glass);
                    color: var(--text-primary);
                }
                .card-action-btn.edit-btn:hover {
                    color: var(--accent-blue);
                    border-color: rgba(99,102,241,0.3);
                }
                .card-action-btn.delete-btn {
                    color: #f87171;
                }
                .card-action-btn.delete-btn:hover {
                    background: rgba(239,68,68,0.1);
                    border-color: rgba(239,68,68,0.3);
                }
            `}</style>
        </div>
    );
}
