import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, Link2, ChevronDown, Loader2, CheckCircle2,
  AlertCircle, ExternalLink, Settings
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import VideoPlayer from '../../components/VideoPlayer.jsx';
import CommentSidebar from '../../components/CommentSidebar.jsx';
import ChatPanel from '../../components/ChatPanel.jsx';
import Processing3DPlaceholder from '../../components/three/Processing3DPlaceholder.jsx';
import api from '../../api/axiosInstance.js';

const STATUS_OPTIONS = ['awaiting_assets', 'in_progress', 'in_review', 'paid'];

export default function AdminProjectPage() {
  const { id } = useParams();
  const fileRef = useRef(null);

  const [project,     setProject]     = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMsg,   setUploadMsg]   = useState('');
  const [statusChanging, setStatusChanging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo,      setSeekTo]      = useState(null);

  const fetchProject = async () => {
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

  useEffect(() => { fetchProject(); }, [id]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'video/mp4') {
      setUploadMsg('error:Only .mp4 files are accepted.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadMsg('info:Uploading and transcoding… this may take a few minutes.');

    const formData = new FormData();
    formData.append('video', file);

    try {
      const { data } = await api.post(`/deliverables/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setDeliverable(data.deliverable);
      setUploadMsg('success:Video uploaded and transcoded successfully!');
      await fetchProject();
    } catch (err) {
      setUploadMsg(`error:${err.response?.data?.message || 'Upload failed. Check FFmpeg and S3 config.'}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      const { data } = await api.patch(`/projects/${id}/status`, { status: newStatus });
      setProject(data);
    } catch {/* */}
    finally { setStatusChanging(false); }
  };

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
          <p style={{ color: 'var(--text-muted)' }}>Project not found.</p>
        </div>
      </div>
    );
  }

  const [msgType, msgText] = uploadMsg.includes(':') ? uploadMsg.split(':') : ['', uploadMsg];

  return (
    <div className="page-container">
      <Navbar showBack />

      <main className="content-area" style={{ paddingTop: 20, paddingBottom: 60 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="project-header"
          style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Client: <span style={{ color: 'var(--text-secondary)' }}>{project.client?.name}</span>
              {' · '}Invoice: <span style={{ color: 'var(--accent-indigo)' }}>${project.price.toLocaleString()}</span>
            </p>
          </div>

          {/* Status Control */}
          <div className="project-status-control" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status:</span>
            <div style={{ position: 'relative' }}>
              <select
                value={project.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={statusChanging}
                className="input-field"
                style={{ padding: '6px 32px 6px 12px', fontSize: 12, cursor: 'pointer', appearance: 'none', minWidth: 148 }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
        </motion.div>

        <div className="project-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, alignItems: 'start' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Video Player / 3D Empty State */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              {deliverable ? (
                <VideoPlayer
                  hlsUrl={deliverable.hlsPlaylistUrl}
                  seekTo={seekTo}
                  onTimeUpdate={setCurrentTime}
                />
              ) : (
                <Processing3DPlaceholder
                  label="No Deliverable Uploaded"
                  subLabel="Upload an .mp4 below — it will be transcoded to HLS"
                />
              )}
            </motion.div>

            {/* Upload Panel */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '18px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Upload Deliverable</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                Upload the final .mp4 — transcoded to HLS and stored on S3.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept="video/mp4"
                style={{ display: 'none' }}
                id="video-upload"
                onChange={handleUpload}
                disabled={uploading}
              />
              <label htmlFor="video-upload" style={{ display: 'block' }}>
                <div
                  style={{
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 10, padding: '22px',
                    textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.2s',
                    background: 'rgba(99,102,241,0.02)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glow)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={22} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 10px', display: 'block' }} />
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
                        {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Transcoding with FFmpeg…'}
                      </p>
                      <div style={{ height: 3, background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg,var(--accent-blue),var(--accent-purple))', transition: 'width 0.3s' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={22} color="var(--accent-indigo)" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.65 }} />
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Drop .mp4 here or click to browse</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>Up to 5 GB · Auto-transcoded to HLS</p>
                    </>
                  )}
                </div>
              </label>

              {uploadMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: 10, padding: '9px 12px', borderRadius: 8, fontSize: 12,
                    background: msgType === 'success' ? 'rgba(52,211,153,0.08)' : msgType === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
                    border: `1px solid ${msgType === 'success' ? 'rgba(52,211,153,0.2)' : msgType === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`,
                    color: msgType === 'success' ? '#34d399' : msgType === 'error' ? '#f87171' : '#818cf8',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                >
                  {msgType === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {msgText}
                </motion.div>
              )}
            </motion.div>

            {/* Raw Assets */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '18px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Client Raw Assets</h3>
              {project.rawAssets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No assets submitted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {project.rawAssets.map((asset, i) => (
                    <a
                      key={i}
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', borderRadius: 8,
                        background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Link2 size={12} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.label || asset.url}</span>
                      <ExternalLink size={11} style={{ flexShrink: 0, opacity: 0.45 }} />
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column — Comments */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="project-comments-sidebar"
            style={{ height: 500, position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
          >
            <CommentSidebar
              projectId={id}
              currentTime={currentTime}
              onSeek={(ts) => setSeekTo(ts)}
            />
          </motion.div>
        </div>
      </main>

      <ChatPanel projectId={id} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
