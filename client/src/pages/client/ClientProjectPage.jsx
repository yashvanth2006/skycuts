import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Link2, Loader2, Download,
  CreditCard, CheckCircle2, AlertCircle, Lock
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import VideoPlayer from '../../components/VideoPlayer.jsx';
import CommentSidebar from '../../components/CommentSidebar.jsx';
import ChatPanel from '../../components/ChatPanel.jsx';
import Modal from '../../components/Modal.jsx';
import Processing3DPlaceholder from '../../components/three/Processing3DPlaceholder.jsx';
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

      <main className="content-area" style={{ paddingTop: 20, paddingBottom: 60 }}>

        {/* Payment Toast */}
        <AnimatePresence>
          {paymentStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                marginBottom: 14, padding: '11px 16px', borderRadius: 10,
                background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)',
                color: '#34d399', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              }}
            >
              <CheckCircle2 size={15} /> Payment successful! Your project is now unlocked for download.
            </motion.div>
          )}
          {paymentStatus === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                marginBottom: 14, padding: '11px 16px', borderRadius: 10,
                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.22)',
                color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              }}
            >
              <AlertCircle size={15} /> Payment was cancelled. You can try again below.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 480 }}>{project.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['awaiting_assets', 'in_progress'].includes(project.status) && (
              <button onClick={() => setAssetModal(true)} className="btn-ghost" id="submit-assets-btn" style={{ padding: '8px 16px', fontSize: 13 }}>
                <Link2 size={14} /> Submit Raw Assets
              </button>
            )}
            {project.status === 'in_review' && (
              <button onClick={handlePay} disabled={paying} className="btn-primary" id="pay-invoice-btn" style={{ padding: '8px 18px', fontSize: 13 }}>
                {paying ? (
                  <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Redirecting…</>
                ) : (
                  <><CreditCard size={14} /> Pay Invoice — ${project.price.toLocaleString()}</>
                )}
              </button>
            )}
            {project.status === 'paid' && (
              <button onClick={handleDownload} disabled={downloading} className="btn-primary" id="download-final-btn"
                style={{ background: 'linear-gradient(135deg,#34d399,#059669)', padding: '8px 18px', fontSize: 13 }}>
                {downloading ? (
                  <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating link…</>
                ) : (
                  <><Download size={14} /> Download Final File</>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {downloadError && (
          <div style={{ marginBottom: 12, padding: '9px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, display: 'flex', gap: 7, alignItems: 'center' }}>
            <AlertCircle size={13} /> {downloadError}
          </div>
        )}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          {/* Left — Player */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
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
                      padding: '12px 16px',
                      background: 'rgba(99,102,241,0.05)',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)'
                    }}>
                      <Lock size={12} color="var(--accent-indigo)" />
                      Pay the invoice to download the full-resolution original file.
                    </div>
                  )}
                </>
              ) : (
                <Processing3DPlaceholder
                  label={
                    project.status === 'awaiting_assets'
                      ? 'Awaiting Raw Footage'
                      : 'Editor Is Assembling Your Cut'
                  }
                  subLabel={
                    project.status === 'awaiting_assets'
                      ? 'Submit your raw footage below to get started'
                      : 'Check back soon — your video is being crafted'
                  }
                />
              )}
            </div>

            {/* Raw Assets Submitted */}
            {project.rawAssets.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '16px', marginTop: 12, border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>Submitted Raw Assets</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {project.rawAssets.map((asset, i) => (
                    <a
                      key={i}
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '8px 10px', borderRadius: 7,
                        background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                        color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: 12,
                      }}
                    >
                      <Link2 size={12} style={{ flexShrink: 0 }} />
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
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ height: 600, position: 'sticky', top: 80, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
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
                alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}>
                <Lock size={20} style={{ opacity: 0.18 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '0 20px', lineHeight: 1.6 }}>
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
