import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, Link2, ChevronDown, Loader2, CheckCircle2,
  AlertCircle, Film, ExternalLink, Settings
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import VideoPlayer from '../../components/VideoPlayer.jsx';
import CommentSidebar from '../../components/CommentSidebar.jsx';
import ChatPanel from '../../components/ChatPanel.jsx';
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

      <main className="content-area" style={{ paddingTop: 28, paddingBottom: 80 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Client: <span style={{ color: 'var(--text-secondary)' }}>{project.client?.name}</span>
              {' · '}Invoice: <span style={{ color: 'var(--accent-indigo)' }}>${project.price.toLocaleString()}</span>
            </p>
          </div>

          {/* Status Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={15} color="var(--text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Status:</span>
            <div style={{ position: 'relative' }}>
              <select
                value={project.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={statusChanging}
                className="input-field"
                style={{ padding: '8px 36px 8px 14px', fontSize: 13, cursor: 'pointer', appearance: 'none', minWidth: 160 }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Video Player */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              {deliverable ? (
                <VideoPlayer
                  hlsUrl={deliverable.hlsPlaylistUrl}
                  seekTo={seekTo}
                  onTimeUpdate={setCurrentTime}
                />
              ) : (
                <div style={{
                  aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12,
                  background: 'rgba(0,0,0,0.5)',
                }}>
                  <Film size={40} style={{ opacity: 0.2 }} color="var(--accent-indigo)" />
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No deliverable uploaded yet</p>
                </div>
              )}
            </motion.div>

            {/* Upload Panel */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Upload Deliverable</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Upload the final .mp4 — it will be transcoded to HLS and stored on S3.
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
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 12, padding: '32px',
                    textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.2s',
                    background: 'rgba(99,102,241,0.03)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glow)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={28} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
                        {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Transcoding with FFmpeg…'}
                      </p>
                      <div style={{ height: 4, background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg,var(--accent-blue),var(--accent-purple))', transition: 'width 0.3s' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={28} color="var(--accent-indigo)" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.7 }} />
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Drop .mp4 here or click to browse</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>Up to 5GB. Will be auto-transcoded to HLS.</p>
                    </>
                  )}
                </div>
              </label>

              {uploadMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                    background: msgType === 'success' ? 'rgba(52,211,153,0.1)' : msgType === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                    border: `1px solid ${msgType === 'success' ? 'rgba(52,211,153,0.25)' : msgType === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}`,
                    color: msgType === 'success' ? '#34d399' : msgType === 'error' ? '#f87171' : '#818cf8',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {msgType === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {msgText}
                </motion.div>
              )}
            </motion.div>

            {/* Raw Assets */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Client Raw Assets</h3>
              {project.rawAssets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No assets submitted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {project.rawAssets.map((asset, i) => (
                    <a
                      key={i}
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px', borderRadius: 10,
                        background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Link2 size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.label || asset.url}</span>
                      <ExternalLink size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column — Comments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ height: 680, position: 'sticky', top: 80, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
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
