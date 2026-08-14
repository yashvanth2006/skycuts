import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Link2, Loader2, Download,
  CreditCard, CheckCircle2, AlertCircle, Lock,
  Film, Upload, ExternalLink, MessageSquare,
  CheckCircle, Circle,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import VideoPlayer from "../../components/VideoPlayer.jsx";
import CommentSidebar from "../../components/CommentSidebar.jsx";
import ChatPanel from "../../components/ChatPanel.jsx";
import Modal from "../../components/Modal.jsx";
import api from "../../api/axiosInstance.js";

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
              <div style={{
                width:28, height:28, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: done ? "rgba(52,211,153,0.15)" : active ? "rgba(99,102,241,0.2)" : "var(--bg-glass)",
                border: done ? "2px solid #34d399" : active ? "2px solid var(--accent-blue)" : "2px solid var(--border-subtle)",
                flexShrink:0,
              }}>
                {done   ? <CheckCircle size={14} color="#34d399" />
                : active ? <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--accent-blue)", boxShadow:"0 0 8px rgba(99,102,241,0.6)" }} />
                : <Circle size={10} color="var(--text-muted)" />}
              </div>
              <span style={{
                fontSize:10, fontWeight: active ? 600 : 500,
                color: done ? "#34d399" : active ? "var(--accent-indigo)" : "var(--text-muted)",
                letterSpacing:"0.04em", textTransform:"uppercase", whiteSpace:"nowrap",
              }}>{step.short}</span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className="pw-timeline-line" style={{
                background: i < cur ? "linear-gradient(90deg,#34d399,#22d3ee)" : "var(--border-subtle)"
              }} />
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
      style={{
        aspectRatio:"16/9", position:"relative", overflow:"hidden", width: "100%",
        background:"radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(167,139,250,0.08) 0%, transparent 55%), var(--bg-deep)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16,
      }}
    >
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)",
        backgroundSize:"40px 40px",
      }} />
      {[
        { top:16, left:16, borderTop:"2px solid", borderLeft:"2px solid" },
        { top:16, right:16, borderTop:"2px solid", borderRight:"2px solid" },
        { bottom:16, left:16, borderBottom:"2px solid", borderLeft:"2px solid" },
        { bottom:16, right:16, borderBottom:"2px solid", borderRight:"2px solid" },
      ].map((s,i) => (
        <div key={i} style={{ position:"absolute", width:20, height:20, borderColor:"rgba(99,102,241,0.25)", ...s }} />
      ))}
      <div style={{
        width:72, height:72, borderRadius:"50%",
        background:"rgba(99,102,241,0.1)", border:"1.5px solid rgba(99,102,241,0.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative", boxShadow:"0 0 32px rgba(99,102,241,0.15)",
      }}>
        <Film size={28} color="var(--accent-indigo)" strokeWidth={1.5} />
        <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.12)" }} />
      </div>
      <div style={{ textAlign:"center", padding:"0 24px", zIndex:1 }}>
        <p style={{ fontSize:14, fontWeight:600, color:"var(--text-secondary)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>
          {isAwaiting ? "Awaiting Raw Footage" : "Editor Is Assembling Your Cut"}
        </p>
        <p style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6, maxWidth:280 }}>
          {isAwaiting
            ? "Submit your raw footage below to begin the editing process. Your deliverable will appear here once ready."
            : "Check back soon — your video is being crafted with care."}
        </p>
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value, accent }) {
  if (!value) return null;
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, padding:"10px 0", borderBottom:"1px solid var(--border-subtle)", width: "100%" }}>
      <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:500, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13, color: accent || "var(--text-primary)", fontWeight:600, textAlign:"right", wordBreak:"break-word", flex: 1, minWidth: 0 }}>{value}</span>
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
  const [assetModal,    setAssetModal]   = useState(false);
  const [assetForm,     setAssetForm]    = useState([{ url:"", label:"" }]);
  const [submitting,    setSubmitting]   = useState(false);

  const [paymentState,  setPaymentState] = useState(null); // null, 'verifying', 'success', 'failed', 'cancelled'

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
        }
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
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
              // Refresh project data to get updated status
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

  const handleSubmitAssets = async (e) => {
    e.preventDefault();
    const valid = assetForm.filter(a => a.url.trim());
    if (!valid.length) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/projects/${id}/assets`, { assets: valid });
      setProject(data); setAssetModal(false); setAssetForm([{ url:"", label:"" }]);
    } catch {/* */}
    finally { setSubmitting(false); }
  };

  const addAssetRow    = () => setAssetForm(p => [...p, { url:"", label:"" }]);
  const removeAssetRow = (i) => setAssetForm(p => p.filter((_,idx) => idx !== i));
  const updateAssetRow = (i, field, val) => setAssetForm(p => p.map((r,idx) => idx===i ? {...r,[field]:val} : r));

  if (loading) return (
    <div className="page-container">
      <Navbar showBack />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:16, padding:80 }}>
        <div style={{ width:48,height:48,borderRadius:"50%",border:"3px solid var(--border-subtle)",borderTopColor:"var(--accent-blue)",animation:"spin 0.8s linear infinite" }} />
        <p style={{ color:"var(--text-muted)", fontSize:13 }}>Loading workspace…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}
        
        .pw-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 16px;
          align-items: start;
        }
        
        .pw-col-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }
        
        .pw-col-right {
          position: sticky;
          top: 80px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .pw-timeline {
          display: flex;
          align-items: center;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        
        .pw-timeline-step {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        
        .pw-timeline-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 0 0 auto;
        }
        
        .pw-timeline-line {
          flex: 1;
          height: 2px;
          margin: 0 4px;
          margin-bottom: 24px;
          min-width: 8px;
        }
        
        @media(max-width:1024px){
          .pw-grid { grid-template-columns: 1fr 260px; }
        }
        
        @media(max-width:768px){
          .pw-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .pw-col-left, .pw-col-right {
            display: contents; /* Flattens children so they are directly in the flex column */
          }
          
          /* Order items perfectly on mobile */
          .pw-header-card { order: 1; margin-bottom: 0 !important; }
          .pw-video       { order: 2; }
          .pw-details     { order: 3; }
          .pw-actions     { order: 4; }
          .pw-upload-cta  { order: 5; }
          .pw-assets-list { order: 6; }
          .pw-comments    { order: 7; height: auto !important; min-height: 200px; max-height: none !important; }
          .pw-timeline-section { order: 8; margin-top: 16px; background: var(--bg-card); padding: 16px; border-radius: 12px; border: 1px solid var(--border-subtle); }
          
          .pw-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          /* Vertical Timeline for mobile */
          .pw-timeline {
            flex-direction: column;
            align-items: flex-start;
            padding-bottom: 0;
            overflow-x: visible;
          }
          .pw-timeline-step {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
          }
          .pw-timeline-content {
            flex-direction: row;
            gap: 12px;
          }
          .pw-timeline-line {
            width: 2px;
            height: 16px;
            margin: 4px 0 4px 13px !important;
            min-height: 16px;
          }
          
          /* Buttons */
          .pw-action-row { width: 100%; }
          .pw-action-row button { width: 100%; justify-content: center; }
        }
        
        @media(max-width:480px){
          .pw-header-card { padding: 16px !important; }
        }
      `}</style>

      <main className="content-area" style={{ paddingTop:20, paddingBottom:60 }}>

        {/* Payment toast */}
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
              <Loader2 size={15} style={{animation:"spin 0.8s linear infinite"}}/> Verifying payment...
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
        </AnimatePresence>

        {/* Main grid wrapper (handles all reordering via CSS on mobile) */}
        <div className="pw-grid">

          {/* Project header card (Usually top, but order: 1 on mobile) */}
          <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}}
            className="glass-card pw-header-card"
            style={{ padding:"20px 24px", marginBottom:16, border:"1px solid var(--border-subtle)", gridColumn: "1 / -1" }}>
            <div className="pw-header-row" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
              <div style={{ minWidth:0, width: "100%" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                  <h1 style={{ fontSize:22, fontWeight:700, lineHeight:1.2, wordBreak: "break-word" }}>{project.title}</h1>
                  <StatusBadge status={project.status} />
                </div>
                {project.description && (
                  <p style={{ color:"var(--text-muted)", fontSize:13, lineHeight:1.6, maxWidth:560 }}>{project.description}</p>
                )}
              </div>

              <div className="pw-action-row" style={{ display:"flex", gap:8, flexWrap:"wrap", flexShrink:0 }}>
                {canSubmitAssets && (
                  <button onClick={() => setAssetModal(true)} className="btn-ghost" id="submit-assets-btn" style={{ padding:"9px 18px", fontSize:13, gap:7 }}>
                    <Upload size={14}/> Submit Raw Assets
                  </button>
                )}
                {project.status === "in_review" && (
                  <button onClick={handlePay} disabled={paying} className="btn-primary" id="pay-invoice-btn" style={{ padding:"9px 18px", fontSize:13, gap:7 }}>
                    {paying ? <><Loader2 size={14} style={{animation:"spin 0.8s linear infinite"}}/> Redirecting…</> : <><CreditCard size={14}/> Pay Invoice — ${project.price?.toLocaleString()}</>}
                  </button>
                )}
                {project.status === "paid" && (
                  <button onClick={handleDownload} disabled={downloading} className="btn-primary" id="download-final-btn" style={{ background:"linear-gradient(135deg,#34d399,#059669)", padding:"9px 18px", fontSize:13, gap:7 }}>
                    {downloading ? <><Loader2 size={14} style={{animation:"spin 0.8s linear infinite"}}/> Generating…</> : <><Download size={14}/> Download Final File</>}
                  </button>
                )}
              </div>
            </div>

            {downloadError && (
              <div style={{ marginTop:12, padding:"9px 14px", borderRadius:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171", fontSize:12, display:"flex", gap:7, alignItems:"center" }}>
                <AlertCircle size={13}/> {downloadError}
              </div>
            )}
            
            {/* Timeline embedded in header on desktop, split out via CSS on mobile */}
            <div className="pw-timeline-section" style={{ paddingTop:14, marginTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
              <p style={{ fontSize:11, color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>Project Progress</p>
              <StatusTimeline status={project.status} />
            </div>
          </motion.div>

          {/* Left column */}
          <div className="pw-col-left">

            {/* Video / empty state */}
            <motion.div className="pw-video" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.1}} style={{ width: "100%" }}>
              <div className="glass-card" style={{ padding:0, overflow:"hidden", border:"1px solid var(--border-subtle)", width: "100%" }}>
                {deliverable ? (
                  <>
                    <VideoPlayer hlsUrl={deliverable.hlsPlaylistUrl} seekTo={seekTo} onTimeUpdate={setCurrentTime} />
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
            </motion.div>

            {/* Upload CTA */}
            {canSubmitAssets && (
              <motion.div className="pw-upload-cta" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}} style={{ width: "100%" }}>
                <div className="glass-card" style={{ padding:"20px 24px", border:"1px solid var(--border-subtle)" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                    <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Upload size={20} color="var(--accent-indigo)"/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <h3 style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Submit Your Raw Footage</h3>
                      <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.6, marginBottom:14 }}>
                        Share links from Google Drive, Dropbox, WeTransfer, or any cloud storage. The editor will review and begin processing.
                      </p>
                      <button onClick={() => setAssetModal(true)} className="btn-primary" id="submit-assets-cta" style={{ width: "100%", justifyContent: "center", padding:"9px 20px", fontSize:13, gap:7 }}>
                        <Link2 size={14}/> Submit Raw Assets
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submitted assets list */}
            {project.rawAssets?.length > 0 && (
              <motion.div className="pw-assets-list" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.25}} style={{ width: "100%" }}>
                <div className="glass-card" style={{ padding:"16px 20px", border:"1px solid var(--border-subtle)" }}>
                  <h3 style={{ fontSize:12, fontWeight:600, marginBottom:12, color:"var(--text-secondary)", letterSpacing:"0.06em", textTransform:"uppercase" }}>Submitted Raw Assets</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {project.rawAssets.map((asset,i) => (
                      <a key={i} href={asset.url} target="_blank" rel="noopener noreferrer"
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:8, background:"var(--bg-glass)", border:"1px solid var(--border-subtle)", color:"var(--accent-cyan)", textDecoration:"none", fontSize:13 }}
                        onMouseEnter={e => e.currentTarget.style.background="var(--bg-glass-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background="var(--bg-glass)"}>
                        <Link2 size={13} style={{flexShrink:0}}/>
                        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{asset.label || asset.url}</span>
                        <ExternalLink size={11} style={{flexShrink:0,opacity:0.5}}/>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Comments panel */}
            <motion.div className="pw-comments" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3}} style={{ width: "100%" }}>
              <div className="glass-card" style={{ overflow:"hidden", border:"1px solid var(--border-subtle)", height: "100%", minHeight: deliverable ? 480 : 0 }}>
                {deliverable ? (
                  <CommentSidebar projectId={id} currentTime={currentTime} onSeek={(ts) => setSeekTo(ts)} />
                ) : (
                  <div style={{ height:"100%", minHeight: 200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:24, textAlign:"center" }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
                      <MessageSquare size={20} style={{opacity:0.25}}/>
                    </div>
                    <p style={{ fontSize:14, fontWeight:600, color:"var(--text-secondary)" }}>Review & Comments</p>
                    <p style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.7, maxWidth:260 }}>
                      Comments become available once your deliverable is uploaded.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="pw-col-right">

            {/* Details card */}
            <motion.div className="pw-details" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:0.2}} style={{ width: "100%" }}>
              <div className="glass-card" style={{ padding:"18px 20px", border:"1px solid var(--border-subtle)" }}>
                <h2 style={{ fontSize:12, fontWeight:600, color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>Project Details</h2>
                <DetailRow label="Status" value={project.status?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())} accent="var(--accent-indigo)"/>
                <DetailRow label="Type" value={project.type}/>
                <DetailRow label="Budget" value={project.price ? `$${Number(project.price).toLocaleString()}` : null} accent="#fbbf24"/>
                <DetailRow label="Created" value={fmtDate(project.createdAt)}/>
                <DetailRow label="Deadline" value={fmtDate(project.deadline)}/>
                <DetailRow label="Delivery" value={fmtDate(project.deliveryDate)}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, width: "100%" }}>
                  <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:500 }}>Assets Submitted</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{project.rawAssets?.length ?? 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Actions wrapper */}
            <motion.div className="pw-actions" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:0.25}} style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
              {/* Awaiting assets action */}
              {canSubmitAssets && (
                <div style={{ padding:"16px 18px", borderRadius:14, background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(167,139,250,0.07))", border:"1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", boxShadow:"0 0 8px rgba(251,191,36,0.4)", animation:"pulse-dot 1.5s ease-in-out infinite" }}/>
                    <p style={{ fontSize:12, fontWeight:600, color:"#fbbf24", textTransform:"uppercase", letterSpacing:"0.06em" }}>Action Required</p>
                  </div>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6, marginBottom:14 }}>Your project is waiting for raw footage before the editor can begin.</p>
                  <button onClick={() => setAssetModal(true)} id="sidebar-assets-btn" style={{ width:"100%", padding:"10px 0", borderRadius:8, border:"none", cursor:"pointer", background:"linear-gradient(135deg,var(--accent-blue),var(--accent-purple))", color:"#fff", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                    <Upload size={14}/> Submit Raw Assets
                  </button>
                </div>
              )}

              {/* In review action */}
              {project.status === "in_review" && (
                <div style={{ padding:"16px 18px", borderRadius:14, background:"linear-gradient(135deg,rgba(52,211,153,0.08),rgba(6,182,212,0.06))", border:"1px solid rgba(52,211,153,0.2)" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#34d399", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Ready for Review</p>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6, marginBottom:14 }}>Your edited video is ready. Review it then pay the invoice to unlock the final file.</p>
                  <button onClick={handlePay} disabled={paying} id="sidebar-pay-btn" style={{ width:"100%", padding:"10px 0", borderRadius:8, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#34d399,#059669)", color:"#fff", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                    {paying ? <><Loader2 size={14} style={{animation:"spin 0.8s linear infinite"}}/> Redirecting…</> : <><CreditCard size={14}/> Pay ${project.price?.toLocaleString()}</>}
                  </button>
                </div>
              )}

              {/* Paid action */}
              {project.status === "paid" && (
                <div style={{ padding:"16px 18px", borderRadius:14, background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(34,211,238,0.06))", border:"1px solid rgba(99,102,241,0.25)" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"var(--accent-indigo)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Project Paid</p>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6, marginBottom:14 }}>Payment received. Download the full-resolution final file below.</p>
                  <button onClick={handleDownload} disabled={downloading} id="sidebar-download-btn" style={{ width:"100%", padding:"10px 0", borderRadius:8, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                    {downloading ? <><Loader2 size={14} style={{animation:"spin 0.8s linear infinite"}}/> Generating…</> : <><Download size={14}/> Download Final File</>}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Submit assets modal */}
      <Modal isOpen={assetModal} onClose={() => setAssetModal(false)} title="Submit Raw Footage Links" maxWidth={560}>
        <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:20, lineHeight:1.6 }}>
          Paste Google Drive, Dropbox, WeTransfer, or any cloud storage links. Add a short label to help the editor identify each file.
        </p>
        <form onSubmit={handleSubmitAssets} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {assetForm.map((row,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ flex:2, minWidth:180 }}>
                <input value={row.url} onChange={e=>updateAssetRow(i,"url",e.target.value)} placeholder="https://drive.google.com/…" className="input-field" style={{ padding:"10px 14px", fontSize:13 }} required/>
              </div>
              <div style={{ flex:1, minWidth:100 }}>
                <input value={row.label} onChange={e=>updateAssetRow(i,"label",e.target.value)} placeholder="Label (optional)" className="input-field" style={{ padding:"10px 14px", fontSize:13 }}/>
              </div>
              {assetForm.length > 1 && (
                <button type="button" onClick={() => removeAssetRow(i)} className="btn-danger" style={{ padding:"10px", flexShrink:0 }}>
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addAssetRow} className="btn-ghost" style={{ alignSelf:"flex-start", padding:"8px 14px", gap:6, fontSize:13 }}>
            <Plus size={14}/> Add another link
          </button>
          <div style={{ display:"flex", gap:10, paddingTop:8 }}>
            <button type="button" onClick={() => setAssetModal(false)} className="btn-ghost" style={{ flex:1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex:2 }}>
              {submitting ? <><Loader2 size={14} style={{animation:"spin 0.8s linear infinite"}}/> Submitting…</> : <><Link2 size={14}/> Submit Assets</>}
            </button>
          </div>
        </form>
      </Modal>

      <ChatPanel projectId={id}/>
    </div>
  );
}
