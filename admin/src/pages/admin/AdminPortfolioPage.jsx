import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Eye, EyeOff,
    Film, Loader2, CheckCircle, X, AlertTriangle,
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import api from '../../api/axiosInstance.js';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const Badge = ({ published }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
        background: published ? 'rgba(34,197,94,0.12)' : 'rgba(100,100,100,0.12)',
        border: `1px solid ${published ? 'rgba(34,197,94,0.3)' : 'rgba(100,100,100,0.25)'}`,
        color: published ? '#4ade80' : 'var(--text-muted)',
    }}>
        {published ? <Eye size={11} /> : <EyeOff size={11} />}
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
        }}>
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12, padding: 32,
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
                                    width: '100%', padding: '10px 12px',
                                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)', borderRadius: 6,
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
                                width: '100%', padding: '10px 12px', resize: 'vertical',
                                background: 'var(--bg-input)', color: 'var(--text-primary)',
                                border: '1px solid var(--border-subtle)', borderRadius: 6,
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
                                    width: '100%', padding: '10px 12px',
                                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)', borderRadius: 6,
                                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                                <input
                                    type="checkbox"
                                    checked={form.isPublished}
                                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                                    style={{ width: 16, height: 16, accentColor: 'var(--accent-blue)' }}
                                />
                                Publish immediately
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14 }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} style={{ padding: '10px 22px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-void)', color: 'var(--text-primary)' }}>
            <Navbar />

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
                {/* Page header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <Film size={20} color="var(--accent-blue)" />
                            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Portfolio Management</h1>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Manage the public showcase items displayed on the editor profile.
                        </p>
                    </div>
                    <button
                        onClick={() => { setModalItem({}); setModalOpen(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 18px', background: 'var(--accent-blue)',
                            color: '#fff', border: 'none', borderRadius: 8,
                            fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                {/* Error state */}
                {error && (
                    <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', marginBottom: 24 }}>
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 0', color: 'var(--text-muted)' }}>
                        <Loader2 size={20} className="spin" />
                        Loading portfolio items...
                    </div>
                )}

                {/* Empty state */}
                {!loading && items.length === 0 && !error && (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                        <Film size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No portfolio items yet</p>
                        <p style={{ fontSize: 13 }}>Click "Add Item" to add your first showcase video.</p>
                    </div>
                )}

                {/* Items list */}
                {!loading && items.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {items.map((item, i) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass-card"
                                style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}
                            >
                                {/* Order badge */}
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                                    {item.order ?? i}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        {item.category && <span style={{ fontSize: 12, color: 'var(--accent-blue)' }}>{item.category}</span>}
                                        {item.description && <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{item.description}</span>}
                                    </div>
                                </div>

                                {/* Status */}
                                <Badge published={item.isPublished} />

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    <button
                                        onClick={() => handleTogglePublish(item)}
                                        title={item.isPublished ? 'Unpublish' : 'Publish'}
                                        style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                                    >
                                        {item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button
                                        onClick={() => { setModalItem(item); setModalOpen(true); }}
                                        title="Edit"
                                        style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: 'var(--accent-blue)', display: 'flex' }}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        title="Delete"
                                        style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#f87171', display: 'flex' }}
                                    >
                                        <Trash2 size={14} />
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
        </div>
    );
}
