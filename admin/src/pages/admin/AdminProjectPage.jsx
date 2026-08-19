import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, Link2, ChevronDown, Loader2, CheckCircle2,
  AlertCircle, ExternalLink, Settings, Film, Clock,
  CheckCircle, FileText
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import VideoPlayer from '../../components/VideoPlayer.jsx';
import CommentSidebar from '../../components/CommentSidebar.jsx';
import ChatPanel from '../../components/ChatPanel.jsx';
import api from '../../api/axiosInstance.js';
import { formatCurrency } from '../../utils/currency.js';

const STATUS_OPTIONS = ['awaiting_assets', 'in_progress', 'in_review', 'paid'];
const STATUS_LABELS = {
  'awaiting_assets': 'Assets',
  'in_progress': 'Editing',
  'in_review': 'Review',
  'paid': 'Delivered'
};

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
      // Validate ID locally first before making requests
      if (!id || id === 'undefined') return;

      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);

      try {
        const delivRes = await api.get(`/deliverables/${id}`);
        setDeliverable(delivRes.data);
      } catch (err) {
        // 404 is expected if no deliverable exists yet.
        // Don't treat it as an error that breaks the page.
        if (err.response && err.response.status === 404) {
          setDeliverable(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch project', err);
    } finally {
      setLoading(false);
    }
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
      setUploadMsg(`error:${err.response?.data?.message || 'Upload failed. Please try again.'}`);
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
    } catch (err) {
      console.error('Failed to change status', err);
    } finally {
      setStatusChanging(false);
    }
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
  const currentStatusIndex = STATUS_OPTIONS.indexOf(project.status);

  return (
    <div className="page-container">
      <Navbar showBack />

      <main className="content-area" style={{ paddingTop: 20, paddingBottom: 60, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Responsive Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="project-header"
        >
          <div className="project-header-info">
            <h1 className="project-title">{project.title}</h1>
            <p className="project-meta">
              Client: <span className="project-meta-highlight">{project.client?.name}</span>
              {' · '}Invoice: <span className="project-meta-accent">{formatCurrency(project.price)}</span>
            </p>
          </div>

          <div className="project-status-control">
            <Settings size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                value={project.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={statusChanging}
                className="input-field status-select"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
        </motion.div>

        {/* 2-Column Responsive Layout */}
        <div className="project-layout">
          
          {/* Left / Main Column */}
          <div className="main-column">
            
            {/* Video Player / Empty State */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="video-container glass-card">
              {deliverable ? (
                <VideoPlayer
                  hlsUrl={deliverable.videoUrl || deliverable.hlsPlaylistUrl}
                  seekTo={seekTo}
                  onTimeUpdate={setCurrentTime}
                />
              ) : (
                <div className="empty-video">
                  <Film size={48} className="empty-video-icon" />
                  <h3 className="empty-video-title">NO DELIVERABLE</h3>
                  <p className="empty-video-text">
                    No final video has been uploaded yet.<br/>
                    The video preview will appear here once you upload a deliverable.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Project Progress */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: '16px 20px', border: '1px solid var(--border-subtle)' }}>
              <div className="progress-tracker">
                {STATUS_OPTIONS.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={status} className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-circle">
                        {isCompleted ? <CheckCircle size={14} /> : <span className="step-dot" />}
                      </div>
                      <span className="step-label">{STATUS_LABELS[status]}</span>
                      {index < STATUS_OPTIONS.length - 1 && <div className="step-line" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Upload Panel */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '20px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Upload Deliverable</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Upload the final .mp4 file. The file will be securely stored and processed.
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
              <label htmlFor="video-upload" style={{ display: 'block', width: '100%' }}>
                <div
                  className="upload-dropzone"
                  style={{
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    borderColor: uploading ? 'var(--accent-blue)' : 'var(--border-subtle)'
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={24} color="var(--accent-blue)" style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 10, fontWeight: 500 }}>
                        {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Processing video…'}
                      </p>
                      <div style={{ height: 4, background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden', width: '100%', maxWidth: 300, margin: '0 auto' }}>
                        <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg,var(--accent-blue),var(--accent-purple))', transition: 'width 0.3s' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={28} color="var(--accent-indigo)" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
                      <p style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Upload Video</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tap to browse or drag & drop</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 12, opacity: 0.7 }}>Maximum 5 GB · Ready for playback</p>
                    </>
                  )}
                </div>
              </label>

              {uploadMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`upload-message ${msgType}`}
                >
                  {msgType === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{msgText}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Raw Assets */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '20px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>RAW FOOTAGE</h3>
                {project.rawAssets?.length > 0 ? (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                    SUBMITTED
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                    NOT SUBMITTED
                  </span>
                )}
              </div>
              
              {!project.rawAssets || project.rawAssets.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: '12px 16px', background: 'var(--bg-panel)', borderRadius: 8 }}>
                  <FileText size={16} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: 13 }}>Client has not submitted the Google Drive folder yet.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Google Drive folder submitted</p>
                  <a
                    href={project.rawAssets[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="asset-link"
                    style={{ background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', color: '#fff', border: 'none', justifyContent: 'center', padding: '12px', fontWeight: 500 }}
                  >
                    Open Google Drive Folder <ExternalLink size={14} style={{ marginLeft: 6 }} />
                  </a>
                </div>
              )}
            </motion.div>

            {/* Project Details (Mobile-friendly grid) */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card" style={{ padding: '20px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Project Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value"><StatusBadge status={project.status} /></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Budget</span>
                  <span className="detail-value" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(project.price)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Raw Footage</span>
                  <span className="detail-value">{project.rawAssets?.length > 0 ? "Submitted" : "Awaiting"}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column — Comments */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="sidebar-column"
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile First Responsive Styles */
        .project-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        .project-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--text-primary);
        }
        .project-meta {
          color: var(--text-muted);
          font-size: 13px;
        }
        .project-meta-highlight {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .project-meta-accent {
          color: var(--accent-indigo);
          font-weight: 600;
        }
        .project-status-control {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .status-select {
          width: 100%;
          padding: 10px 32px 10px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          appearance: none;
          background: var(--bg-panel);
          border-radius: 8px;
        }

        .project-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }

        .main-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .video-container {
          padding: 0;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .empty-video {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
          height: 100%;
          background: linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-void) 100%);
        }
        .empty-video-icon {
          color: var(--text-muted);
          opacity: 0.4;
          margin-bottom: 16px;
        }
        .empty-video-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .empty-video-text {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
          max-width: 320px;
        }

        .upload-dropzone {
          border: 2px dashed var(--border-subtle);
          border-radius: 12px;
          padding: 32px 20px;
          text-align: center;
          transition: all 0.2s;
          background: rgba(99,102,241,0.02);
          width: 100%;
        }
        .upload-dropzone:active {
          background: rgba(99,102,241,0.05);
        }

        .upload-message {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .upload-message.success {
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          color: #34d399;
        }
        .upload-message.error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
        }
        .upload-message.info {
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          color: #818cf8;
        }

        .asset-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13px;
          transition: all 0.2s;
        }
        .asset-link:active {
          background: var(--bg-glass);
        }
        .asset-link-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .progress-tracker {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .progress-step {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        .step-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          z-index: 2;
        }
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--border-subtle);
        }
        .progress-step.completed .step-circle,
        .progress-step.current .step-circle {
          border-color: var(--accent-blue);
        }
        .progress-step.completed .step-circle {
          background: var(--accent-blue);
          color: white;
        }
        .progress-step.current .step-dot {
          background: var(--accent-blue);
        }
        .step-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
        }
        .progress-step.completed .step-label,
        .progress-step.current .step-label {
          color: var(--text-primary);
          font-weight: 600;
        }
        .step-line {
          position: absolute;
          left: 11px;
          top: 24px;
          bottom: -16px;
          width: 2px;
          background: var(--border-subtle);
          z-index: 1;
        }
        .progress-step.completed .step-line {
          background: var(--accent-blue);
        }

        .details-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 14px;
          background: var(--bg-panel);
          border-radius: 8px;
        }
        .detail-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 600;
        }
        .detail-value {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .sidebar-column {
          width: 100%;
          min-width: 0;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          /* On mobile, height auto. Desktop will fix height. */
          height: auto;
          min-height: 400px;
        }

        /* Desktop Layout Overrides */
        @media (min-width: 768px) {
          .project-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .project-status-control {
            width: auto;
            min-width: 200px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .detail-item {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            background: transparent;
            border-bottom: 1px solid var(--border-subtle);
            border-radius: 0;
          }
          .detail-item:last-child {
            border-bottom: none;
          }
          
          /* Horizontal Progress on Desktop */
          .progress-tracker {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .progress-step {
            flex-direction: column;
            flex: 1;
            gap: 8px;
          }
          .step-line {
            left: 50%;
            top: 11px;
            bottom: auto;
            right: -50%;
            width: 100%;
            height: 2px;
          }
          .progress-step:last-child .step-line {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .project-layout {
            grid-template-columns: minmax(0, 1fr) 340px;
          }
          .sidebar-column {
            position: sticky;
            top: 80px;
            height: calc(100vh - 120px);
            max-height: 800px;
          }
          .upload-dropzone:hover {
            border-color: var(--border-glow);
          }
          .asset-link:hover {
            background: var(--bg-glass);
            border-color: var(--border-glow);
          }
        }
      `}</style>
    </div>
  );
}
