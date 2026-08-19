import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Loader2, Download,
  CreditCard, CheckCircle2, AlertCircle, Lock,
  Film, ExternalLink, MessageSquare,
  CheckCircle, Circle,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import VideoPlayer from "../../components/VideoPlayer.jsx";
import CommentSidebar from "../../components/CommentSidebar.jsx";
import ChatPanel from "../../components/ChatPanel.jsx";
import Modal from "../../components/Modal.jsx";
import api from "../../api/axiosInstance.js";
import { formatCurrency } from "../../utils/currency.js";

const TIMELINE_STEPS = [
  { key: "awaiting_assets", short: "Assets"    },
  { key: "in_progress",     short: "Editing"   },
  { key: "in_review",       short: "Review"    },
  { key: "paid",            short: "Paid"      },
  { key: "delivered",       short: "Delivered" },
];
const STATUS_ORDER = { awaiting_assets:0, in_progress:1, in_review:2, paid:3, delivered:4 };

function StatusTimeline({ status }) {
  const cur = STATUS_ORDER[status] ?? 0;
  return (
    <div className="pw-timeline">
      {TIMELINE_STEPS.map((step, i) => {
        const done   = i < cur;
        const active = i === cur;
        return (
          <div key={step.key} className="pw-timeline-step">
            <div className="pw-timeline-content">
              <div className={`pw-timeline-circle ${done ? 'done' : active ? 'active' : ''}`}>
                {done   ? <CheckCircle size={14} color="#34d399" />
                : active ? <div className="pw-timeline-dot" />
                : <Circle size={10} color="var(--text-muted)" />}
              </div>
              <span className={`pw-timeline-label ${done ? 'done' : active ? 'active' : ''}`}>
                {step.short}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`pw-timeline-line ${i < cur ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function VideoEmptyState({ status }) {
  const isAwaiting = status === "awaiting_assets";
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6 }}
      className="pw-video-empty"
    >
      <div className="pw-video-empty-bg" />
      <div className="pw-video-empty-icon">
        <Film size={28} color="var(--accent-indigo)" strokeWidth={1.5} />
      </div>
      <div className="pw-video-empty-text">
        <h3>{isAwaiting ? "AWAITING RAW FOOTAGE" : "EDITOR IS ASSEMBLING YOUR CUT"}</h3>
        <p>
          {isAwaiting
            ? "Submit your Google Drive folder containing the raw footage to begin the editing process."
            : "Check back soon — your video is being crafted with care."}
        </p>
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value, accent }) {
  if (!value) return null;
  return (
    <div className="pw-detail-row">
      <span className="pw-detail-label">{label}</span>
      <span className="pw-detail-value" style={{ color: accent || "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" }); }
  catch { return null; }
}

export default function ClientProjectPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [project,       setProject]      = useState(null);
  const [deliverable,   setDeliverable]  = useState(null);
  const [loading,       setLoading]      = useState(true);
  const [currentTime,   setCurrentTime]  = useState(0);
  const [seekTo,        setSeekTo]       = useState(null);
  const [paying,        setPaying]       = useState(false);
  const [downloading,   setDownloading]  = useState(false);
  const [downloadError, setDownloadError]= useState("");
  const [driveLink,     setDriveLink]    = useState("");
  const [linkError,     setLinkError]    = useState("");
  const [isSubmittingDriveLink, setIsSubmittingDriveLink] = useState(false);

  const [paymentState,  setPaymentState] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await api.get(`/projects/${id}`);
        setProject(projRes.data);
        
        try {
          const delivRes = await api.get(`/deliverables/${id}`);
          setDeliverable(delivRes.data);
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error("Failed to fetch deliverable:", err);
          }
          // Intentionally do not throw or alert for 404s
          setDeliverable(null);
        }
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally { 
        setLoading(false); 
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await api.post(`/payments/create-order/${id}`);
      
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "SkyCuts",
        description: `Payment for ${project.title}`,
        order_id: data.orderId,
        handler: async function (response) {
          setPaymentState("verifying");
          try {
            const verifyRes = await api.post("/payments/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            if (verifyRes.data.success) {
              setPaymentState("success");
              const projRes = await api.get(`/projects/${id}`);
              setProject(projRes.data);
            } else {
              setPaymentState("failed");
            }
          } catch (err) {
            console.error("Verification failed", err);
            setPaymentState("failed");
          }
        },
        prefill: {
          email: project.client?.email || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            setPaymentState("cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentState("failed");
      });
      rzp.open();

    } catch (err) {
      console.error("Failed to initiate payment", err);
      setPaying(false);
      setPaymentState("failed");
    }
  };

  const handleDownload = async () => {
    setDownloading(true); setDownloadError("");
    try {
      const { data } = await api.get(`/deliverables/${id}/download`);
      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = `${project?.title || "final"}.mp4`;
      a.click();
    } catch (err) {
      setDownloadError(err.response?.data?.message || "Download failed. Try again.");
    } finally { setDownloading(false); }
  };

  const handleSubmitDriveLink = async (e) => {
    e.preventDefault();
    setLinkError("");
    const url = driveLink.trim();

    if (!url) {
      setLinkError("Please enter a Google Drive link.");
      return;
    }

    try {
      const parsed = new URL(url);
      if (parsed.hostname !== "drive.google.com") {
        setLinkError("Please enter a valid Google Drive link.");
        return;
      }
    } catch {
      setLinkError("Please enter a valid Google Drive link.");
      return;
    }

    setIsSubmittingDriveLink(true);
    try {
      const { data } = await api.post(`/projects/${id}/assets`, { 
        assets: [{ url, label: "Google Drive Folder" }] 
      });
      setProject(data);
      setDriveLink("");
    } catch (err) {
      setLinkError(err.response?.data?.message || "Failed to submit link. Please try again.");
    } finally {
      setIsSubmittingDriveLink(false);
    }
  };

  if (loading) return (
    <div className="page-container">
      <Navbar showBack />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:16, padding:80 }}>
        <Loader2 size={32} color="var(--accent-blue)" className="spin" />
        <p style={{ color:"var(--text-muted)", fontSize:14 }}>Loading workspace…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );

  if (!project) return (
    <div className="page-container">
      <Navbar showBack />
      <div style={{ textAlign:"center", padding:80, flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
        <AlertCircle size={40} color="#f87171" />
        <p style={{ color:"var(--text-secondary)", fontSize:15 }}>Project not found or access denied.</p>
      </div>
    </div>
  );

  const canSubmitAssets = ["awaiting_assets","in_progress"].includes(project.status);

  return (
    <div className="page-container">
      <Navbar showBack />
      
      {/* 
        INJECTED RESPONSIVE CSS
        This completely overrides any fixed widths and enforces a fluid mobile-first workspace.
      */}
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}
        
        .spin { animation: spin 0.8s linear infinite; }

        .pw-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 14px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 14px;
            padding-bottom: 80px; /* Space for the floating chat button */
        }
        
        @media (min-width: 768px) {
            .pw-container {
                padding: 24px 32px;
                gap: 24px;
            }
        }

        /* Top Header Area */
        .pw-header {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
            min-width: 0;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-subtle);
        }
        .pw-header-title-row {
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
        }
        .pw-title {
            font-size: 20px;
            font-weight: 700;
            line-height: 1.2;
            color: var(--text-primary);
            word-break: break-word;
            margin: 0;
        }
        @media (max-width: 400px) {
            .pw-title { font-size: 18px; }
        }
        .pw-header-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 13px;
            color: var(--text-muted);
        }
        .pw-meta-item strong {
            color: var(--text-secondary);
            font-weight: 600;
        }
        @media (min-width: 768px) {
            .pw-header-title-row {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
            .pw-title {
                font-size: 28px;
            }
            .pw-header-left {
                display: flex;
                align-items: center;
                gap: 16px;
            }
        }

        /* Timeline */
        .pw-timeline {
            display: flex;
            align-items: center;
            width: 100%;
            overflow-x: auto;
            padding: 2px 0 12px 0;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .pw-timeline::-webkit-scrollbar {
            display: none;
        }
        .pw-timeline-step {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 1;
        }
        /* On narrow mobile, give each step a fixed minimum so they don't get crushed
           but keep DELIVERED visible by making min-width small enough for 5 steps */
        @media (max-width: 767px) {
            .pw-timeline-step {
                flex: 1 1 0;
                min-width: 0;
            }
            /* Shrink the label font and circle so 5 steps fit in ~362px+ */
            .pw-timeline-label {
                font-size: 9px !important;
                letter-spacing: 0 !important;
            }
            .pw-timeline-circle {
                width: 22px !important;
                height: 22px !important;
            }
            .pw-timeline-line {
                margin: 0 4px !important;
                margin-bottom: 22px !important;
                min-width: 6px !important;
            }
        }
        @media (max-width: 360px) {
            .pw-timeline-label { font-size: 8px !important; }
            .pw-timeline-line { min-width: 4px !important; }
        }
        .pw-timeline-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        .pw-timeline-circle {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-glass);
            border: 2px solid var(--border-subtle);
            flex-shrink: 0;
        }
        .pw-timeline-circle.done {
            background: rgba(52,211,153,0.15);
            border-color: #34d399;
        }
        .pw-timeline-circle.active {
            background: rgba(99,102,241,0.2);
            border-color: var(--accent-blue);
        }
        .pw-timeline-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--accent-blue);
            box-shadow: 0 0 8px rgba(99,102,241,0.6);
        }
        .pw-timeline-label {
            font-size: 11px;
            font-weight: 500;
            color: var(--text-muted);
            letter-spacing: 0.04em;
            text-transform: uppercase;
            white-space: nowrap;
        }
        .pw-timeline-label.active {
            color: var(--accent-indigo);
            font-weight: 600;
        }
        .pw-timeline-label.done {
            color: #34d399;
        }
        .pw-timeline-line {
            flex: 1;
            height: 2px;
            margin: 0 8px;
            margin-bottom: 24px;
            min-width: 16px;
            background: var(--border-subtle);
        }
        .pw-timeline-line.done {
            background: linear-gradient(90deg, #34d399, #22d3ee);
        }

        /* Main Workspace Grid */
        .pw-workspace {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            align-items: start;
        }
        @media (min-width: 1024px) {
            .pw-workspace {
                grid-template-columns: minmax(0, 1fr) 340px;
                gap: 24px;
            }
        }

        /* Main Column (Video) */
        .pw-main-col {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 0;
            width: 100%;
        }

        /* Sidebar Column */
        .pw-side-col {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 0;
            width: 100%;
        }
        @media (min-width: 1024px) {
            .pw-side-col {
                position: sticky;
                top: 88px;
            }
        }

        /* Video Empty State */
        .pw-video-empty {
            width: 100%;
            aspect-ratio: 16 / 9;
            background: var(--bg-deep);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            text-align: center;
            padding: 16px;
        }
        .pw-video-empty-bg {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 60%);
            pointer-events: none;
        }
        .pw-video-empty-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: rgba(99,102,241,0.1);
            border: 1px solid rgba(99,102,241,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            z-index: 1;
        }
        .pw-video-empty-text {
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        .pw-video-empty-text h3 {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin: 0;
        }
        .pw-video-empty-text p {
            font-size: 13px;
            color: var(--text-muted);
            max-width: 320px;
            line-height: 1.5;
            margin: 0;
        }
        .pw-btn-empty-upload {
            margin-top: 12px;
            background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(99,102,241,0.2);
        }

        /* Action Cards */
        .pw-action-card {
            padding: 16px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
        }
        @media (min-width: 768px) {
            .pw-action-card { padding: 20px; gap: 12px; }
        }
        .pw-action-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        .pw-action-desc {
            font-size: 13px;
            line-height: 1.6;
            color: var(--text-secondary);
        }
        .pw-action-btn {
            width: 100%;
            min-height: 44px; /* Touch target */
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            color: #fff;
        }

        /* Details Card */
        .pw-details-card {
            padding: 16px;
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            background: var(--bg-card);
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 100%;
        }
        @media (min-width: 768px) {
            .pw-details-card { padding: 20px; gap: 8px; }
        }
        .pw-detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .pw-detail-row:last-child {
            border-bottom: none;
        }
        .pw-detail-label {
            font-size: 13px;
            color: var(--text-muted);
            font-weight: 500;
        }
        .pw-detail-value {
            font-size: 13px;
            font-weight: 600;
            text-align: right;
            word-break: break-word;
        }

        /* Comments Wrapper */
        .pw-comments-wrapper {
            width: 100%;
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            overflow: hidden;
            background: var(--bg-card);
            height: auto;
            min-height: 180px;
            display: flex;
            flex-direction: column;
        }
        @media (min-width: 1024px) {
            .pw-comments-wrapper {
                height: 500px;
            }
        }
      `}</style>

      <main className="pw-container">
        
        {/* Toast Notifications */}
        <AnimatePresence>
          {paymentState === "success" && (
            <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
              style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.22)", color:"#34d399", display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
              <CheckCircle2 size={15}/> Payment successful! Your project is now unlocked for download.
            </motion.div>
          )}
          {paymentState === "verifying" && (
            <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
              style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.22)", color:"var(--accent-indigo)", display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
              <Loader2 size={15} className="spin"/> Verifying payment...
            </motion.div>
          )}
          {paymentState === "failed" && (
            <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
              style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)", color:"#ef4444", display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
              <AlertCircle size={15}/> Payment failed. Please try again.
            </motion.div>
          )}
          {paymentState === "cancelled" && (
            <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
              style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.22)", color:"#fbbf24", display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
              <AlertCircle size={15}/> Payment was cancelled. You can retry below.
            </motion.div>
          )}
          {downloadError && (
            <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
              style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)", color:"#ef4444", display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
              <AlertCircle size={15}/> {downloadError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMPACT PROJECT HEADER */}
        <div className="pw-header">
            <div className="pw-header-title-row">
                <div className="pw-header-left">
                    <h1 className="pw-title">{project.title}</h1>
                </div>
                <StatusBadge status={project.status} />
            </div>
            
            <div className="pw-header-meta">
                <span className="pw-meta-item">Client: <strong>{project.client?.name || 'Unknown'}</strong></span>
                <span className="pw-meta-item">Budget: <strong>{formatCurrency(project.price)}</strong></span>
                {project.type && <span className="pw-meta-item">Type: <strong>{project.type}</strong></span>}
            </div>
        </div>

        {/* HORIZONTAL PROGRESS TRACKER */}
        <StatusTimeline status={project.status} />

        {/* WORKSPACE GRID */}
        <div className="pw-workspace">
            {/* LEFT / MAIN COLUMN */}
            <div className="pw-main-col">
                {/* VIDEO / EMPTY STATE */}
                <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: deliverable ? '1px solid var(--border-subtle)' : 'none' }}>
                    {deliverable ? (
                        <>
                            <VideoPlayer hlsUrl={deliverable.videoUrl || deliverable.hlsPlaylistUrl} seekTo={seekTo} onTimeUpdate={setCurrentTime} />
                            {project.status === "in_review" && (
                                <div style={{ padding:"12px 16px", background:"rgba(99,102,241,0.05)", borderTop:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--text-muted)" }}>
                                <Lock size={12} color="var(--accent-indigo)"/> Pay the invoice to download the full-resolution original file.
                                </div>
                            )}
                        </>
                    ) : (
                        <VideoEmptyState status={project.status} />
                    )}
                </div>

                {/* ACTION REQUIRED: SUBMIT DRIVE LINK */}
                {canSubmitAssets && (!project.rawAssets || project.rawAssets.length === 0) && (
                    <div className="pw-action-card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(167,139,250,0.07))", border:"1px solid rgba(99,102,241,0.2)" }}>
                        <div className="pw-action-header" style={{ color: "#fbbf24" }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", boxShadow:"0 0 8px rgba(251,191,36,0.4)", animation:"pulse-dot 1.5s ease-in-out infinite" }}/>
                            ACTION REQUIRED
                        </div>
                        <p className="pw-action-desc">
                            Your project is waiting for raw footage.<br/><br/>
                            Upload your raw footage to Google Drive, make sure the folder is accessible, and submit the Google Drive link below.
                        </p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                            <input
                                type="url"
                                value={driveLink}
                                onChange={e => {
                                    setDriveLink(e.target.value);
                                    if(linkError) setLinkError("");
                                }}
                                placeholder="https://drive.google.com/drive/folders/..."
                                className="input-field"
                                style={{ width: "100%", minWidth: 0, boxSizing: "border-box", minHeight: 44, padding: "10px 14px", borderRadius: 8, fontSize: 14 }}
                            />
                            {linkError && <span style={{ color: "#f87171", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={14}/> {linkError}</span>}
                            <span style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Make sure your Google Drive folder is accessible to the editor before submitting. (Anyone with the link can view)</span>
                            <button onClick={handleSubmitDriveLink} disabled={isSubmittingDriveLink} className="pw-action-btn" style={{ background:"linear-gradient(135deg,var(--accent-blue),var(--accent-purple))", width: "100%", minHeight: 44 }}>
                                {isSubmittingDriveLink ? <Loader2 size={16} className="spin" /> : <Link2 size={16}/>} Submit Google Drive Link
                            </button>
                        </div>
                    </div>
                )}

                {/* RAW FOOTAGE SUBMITTED */}
                {project.rawAssets?.length > 0 && (
                    <div className="pw-action-card" style={{ background:"linear-gradient(135deg,rgba(52,211,153,0.08),rgba(6,182,212,0.06))", border:"1px solid rgba(52,211,153,0.2)" }}>
                        <div className="pw-action-header" style={{ color: "#34d399" }}>
                            <CheckCircle2 size={16} color="#34d399" /> RAW FOOTAGE SUBMITTED
                        </div>
                        <p className="pw-action-desc">Your Google Drive link has been submitted successfully. The editor can now access your footage.</p>
                        <a href={project.rawAssets[0].url} target="_blank" rel="noopener noreferrer" className="pw-action-btn" style={{ background:"linear-gradient(135deg,#34d399,#059669)", textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", minHeight: 44, marginTop: 8 }}>
                            Open Google Drive Folder <ExternalLink size={14} style={{ marginLeft: 6 }}/>
                        </a>
                    </div>
                )}

                {project.status === "in_review" && (
                    <div className="pw-action-card" style={{ background:"linear-gradient(135deg,rgba(52,211,153,0.08),rgba(6,182,212,0.06))", border:"1px solid rgba(52,211,153,0.2)" }}>
                        <div className="pw-action-header" style={{ color: "#34d399" }}>Ready for Review</div>
                        <p className="pw-action-desc">Your edited video is ready. Review it then pay the invoice to unlock the final file.</p>
                        <button onClick={handlePay} disabled={paying} className="pw-action-btn" style={{ background:"linear-gradient(135deg,#34d399,#059669)" }}>
                            {paying ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />}
                            Pay {formatCurrency(project.price)}
                        </button>
                    </div>
                )}

                {project.status === "paid" && (
                    <div className="pw-action-card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(34,211,238,0.06))", border:"1px solid rgba(99,102,241,0.25)" }}>
                        <div className="pw-action-header" style={{ color: "var(--accent-indigo)" }}>Project Paid</div>
                        <p className="pw-action-desc">Payment received. Download the full-resolution final file below.</p>
                        <button onClick={handleDownload} disabled={downloading} className="pw-action-btn" style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                            {downloading ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                            Download Final File
                        </button>
                    </div>
                )}

                {/* PROJECT DETAILS */}
                <div className="pw-details-card">
                    <h2 style={{ fontSize:12, fontWeight:600, color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Project Details</h2>
                    <DetailRow label="Status" value={project.status?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())} accent="var(--accent-indigo)"/>
                    <DetailRow label="Created" value={fmtDate(project.createdAt)}/>
                    <DetailRow label="Deadline" value={fmtDate(project.deadline)}/>
                    <DetailRow label="Raw Footage" value={project.rawAssets?.length > 0 ? "Submitted" : "Awaiting"}/>
                </div>

                {/* COMMENTS */}
                <div className="pw-comments-wrapper">
                    {deliverable ? (
                        <CommentSidebar projectId={id} currentTime={currentTime} onSeek={(ts) => setSeekTo(ts)} />
                    ) : (
                        <div style={{ flex: 1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:32, textAlign:"center" }}>
                            <div style={{ width:48, height:48, borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <MessageSquare size={20} style={{opacity:0.25}}/>
                            </div>
                            <div>
                                <p style={{ fontSize:15, fontWeight:600, color:"var(--text-secondary)", marginBottom: 4 }}>Review & Comments</p>
                                <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5, maxWidth:240 }}>
                                Comments become available once your deliverable is uploaded.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>

      </main>

      <ChatPanel projectId={id}/>
    </div>
  );
}
