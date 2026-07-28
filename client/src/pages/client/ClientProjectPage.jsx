import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Link2, Loader2, Download,
  CreditCard, CheckCircle2, AlertCircle, Film, Lock
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import VideoPlayer from '../../components/VideoPlayer.jsx';
import CommentSidebar from '../../components/CommentSidebar.jsx';
import ChatPanel from '../../components/ChatPanel.jsx';
import Modal from '../../components/Modal.jsx';
import api from '../../api/axiosInstance.js';

export default function ClientProjectPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [project,     setProject]     = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo,      setSeekTo]      = useState(null);

  // Payment state
  const [paying,     setPaying]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // Asset submission modal
  const [assetModal, setAssetModal] = useState(false);
  const [assetForm,  setAssetForm]  = useState([{ url: '', label: '' }]);
  const [submitting, setSubmitting] = useState(false);

  // Payment toast
  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, delivRes] = await Promise.allSettled([
          api.get(`/projects/${id}`),
          api.get(`/deliverables/${id}`),
        ]);
        if (projRes.status === 'fulfilled') setProject(projRes.value.data);
        if (delivRes.status === 'fulfilled') setDeliverable(delivRes.value.data);
      } catch {/* */}
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await api.post(`/stripe/checkout/${id}`);
      window.location.href = data.sessionUrl;
    } catch (err) {
      console.error(err);
      setPaying(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const { data } = await api.get(`/deliverables/${id}/download`);
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = `${project?.title || 'final'}.mp4`;
      a.click();
    } catch (err) {
      setDownloadError(err.response?.data?.message || 'Download failed. Try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitAssets = async (e) => {
    e.preventDefault();
    const validAssets = assetForm.filter(a => a.url.trim());
    if (!validAssets.length) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/projects/${id}/assets`, { assets: validAssets });
      setProject(data);
      setAssetModal(false);
      setAssetForm([{ url: '', label: '' }]);
    } catch {/* */}
    finally { setSubmitting(false); }
  };

  const addAssetRow = () => setAssetForm(p => [...p, { url: '', label: '' }]);
  const removeAssetRow = (i) => setAssetForm(p => p.filter((_, idx) => idx !== i));
  const updateAssetRow = (i, field, val) =>
    setAssetForm(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  if (loading) {
    return (
      <div className="page-container">
        <Navbar showBack />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Loader2 size={36} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-container">
        <Navbar showBack />
        <div style={{ textAlign: 'center', padding: 80 }}>
          <AlertCircle size={40} color="#f87171" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: 'var(--text-muted)' }}>Project not found or access denied.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar showBack />

      <main className="content-area" style={{ paddingTop: 28, paddingBottom: 80 }}>

        {/* Payment Toast */}
        <AnimatePresence>
          {paymentStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                marginBottom: 20, padding: '14px 20px', borderRadius: 12,
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                color: '#34d399', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
              }}
            >
              <CheckCircle2 size={18} /> Payment successful! Your project is now unlocked for download.
            </motion.div>
          )}
          {paymentStatus === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                marginBottom: 20, padding: '14px 20px', borderRadius: 12,
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
              }}
            >
              <AlertCircle size={18} /> Payment was cancelled. You can try again below.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 500 }}>{project.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Submit Assets — only if awaiting or in_progress */}
            {['awaiting_assets', 'in_progress'].includes(project.status) && (
              <button onClick={() => setAssetModal(true)} className="btn-ghost" id="submit-assets-btn">
                <Link2 size={15} /> Submit Raw Assets
              </button>
            )}

            {/* Pay Button — only if in_review */}
            {project.status === 'in_review' && (
              <button onClick={handlePay} disabled={paying} className="btn-primary" id="pay-invoice-btn">
                {paying ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Redirecting…</>
                ) : (
                  <><CreditCard size={15} /> Pay Invoice — ${project.price.toLocaleString()}</>
                )}
              </button>
            )}

            {/* Download — only if paid */}
            {project.status === 'paid' && (
              <button onClick={handleDownload} disabled={downloading} className="btn-primary" id="download-final-btn"
                style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>
                {downloading ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating link…</>
                ) : (
                  <><Download size={15} /> Download Final File</>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {downloadError && (
          <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertCircle size={14} /> {downloadError}
          </div>
        )}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* Left — Player */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              {deliverable ? (
                <>
                  <VideoPlayer
                    hlsUrl={deliverable.hlsPlaylistUrl}
                    seekTo={seekTo}
                    onTimeUpdate={setCurrentTime}
                  />
                  {/* Payment Gate Overlay when in_review */}
                  {project.status === 'in_review' && (
                    <div style={{
                      padding: '16px 20px',
                      background: 'rgba(99,102,241,0.06)',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)'
                    }}>
                      <Lock size={14} color="var(--accent-indigo)" />
                      Pay the invoice to download the full-resolution original file.
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32
                }}>
                  <Film size={44} style={{ opacity: 0.15 }} color="var(--accent-indigo)" />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Deliverable Not Ready</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {project.status === 'awaiting_assets'
                        ? 'Submit your raw footage below so the editor can get started.'
                        : 'Your editor is working on this. Check back soon.'}
                    </p>
                  </div>
                  {['awaiting_assets', 'in_progress'].includes(project.status) && (
                    <button onClick={() => setAssetModal(true)} className="btn-primary">
                      <Link2 size={15} /> Submit Raw Assets
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Raw Assets Submitted */}
            {project.rawAssets.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '20px', marginTop: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Submitted Raw Assets</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {project.rawAssets.map((asset, i) => (
                    <a
                      key={i}
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 12px', borderRadius: 8,
                        background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                        color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: 13,
                      }}
                    >
                      <Link2 size={13} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {asset.label || asset.url}
                      </span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right — Comments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ height: 620, position: 'sticky', top: 80, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
          >
            {deliverable ? (
              <CommentSidebar
                projectId={id}
                currentTime={currentTime}
                onSeek={(ts) => setSeekTo(ts)}
              />
            ) : (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 10,
                background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-subtle)', borderRadius: 16,
              }}>
                <Lock size={24} style={{ opacity: 0.2 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '0 24px' }}>
                  Comments become available when the deliverable is uploaded.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Submit Raw Assets Modal */}
      <Modal isOpen={assetModal} onClose={() => setAssetModal(false)} title="Submit Raw Footage Links" maxWidth={560}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Paste Google Drive, Dropbox, or any cloud storage links to your raw footage.
        </p>
        <form onSubmit={handleSubmitAssets} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assetForm.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 2 }}>
                <input
                  value={row.url}
                  onChange={e => updateAssetRow(i, 'url', e.target.value)}
                  placeholder="https://drive.google.com/…"
                  className="input-field"
                  style={{ padding: '10px 14px', fontSize: 13 }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  value={row.label}
                  onChange={e => updateAssetRow(i, 'label', e.target.value)}
                  placeholder="Label (optional)"
                  className="input-field"
                  style={{ padding: '10px 14px', fontSize: 13 }}
                />
              </div>
              {assetForm.length > 1 && (
                <button type="button" onClick={() => removeAssetRow(i)} className="btn-danger" style={{ padding: '10px 10px', flexShrink: 0 }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addAssetRow} className="btn-ghost" style={{ alignSelf: 'flex-start', padding: '8px 14px', gap: 6, fontSize: 13 }}>
            <Plus size={14} /> Add another link
          </button>

          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button type="button" onClick={() => setAssetModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 2 }}>
              {submitting ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting…</> : <><Link2 size={14} /> Submit Assets</>}
            </button>
          </div>
        </form>
      </Modal>

      <ChatPanel projectId={id} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
