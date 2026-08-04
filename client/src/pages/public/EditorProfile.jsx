import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Monitor, Film, Layers, Cpu, Star, Award, Clock,
  Play, ChevronRight, Globe, Mail,
  Zap, Eye, Download, Plus, Users, TrendingUp, Search, AlertCircle, Loader2
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import DaVinciNodeTree from "../../components/three/DaVinciNodeTree.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import ProjectCard from "../../components/ProjectCard.jsx";
import SkeletonCard from "../../components/SkeletonCard.jsx";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../api/axiosInstance.js";

// ─── DaVinci Resolve-inspired color palette (theme-aware) ──────────────────
const getDaVinciColors = (isDark) => ({
  bg0:    isDark ? "#111111" : "#f8fafc",
  bg1:    isDark ? "#181818" : "#f1f5f9",
  bg2:    isDark ? "#202020" : "#e8edf5",
  bg3:    isDark ? "#272727" : "#e2e8f0",
  panel:  isDark ? "#1c1c1c" : "#ffffff",
  border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
  borderHover: "rgba(47,116,208,0.5)",
  blue:   "#2F74D0",
  blueL:  "#4A9EFF",
  amber:  "#F5A623",
  amberL: "#FFB74D",
  white:  isDark ? "#E8E8E8" : "#1e1e2e",
  gray1:  isDark ? "#9A9A9A" : "#4a4a6e",
  gray2:  isDark ? "#5A5A5A" : "#9090aa",
  gray3:  isDark ? "#3A3A3A" : "#cbd5e1",
});

// ─── Mock Data ──────────────────────────────────────────────────────────────
const PORTFOLIO = [
  { id: 1, title: "AURORA — Fashion Campaign",   category: "Commercial",   duration: "2:34", year: 2024, views: "2.4M", grade: "Bleach Bypass",  accentKey: "blue"  },
  { id: 2, title: "ECHOES — Music Video",         category: "Music Video",  duration: "4:12", year: 2024, views: "8.1M", grade: "Desaturated Teal", accentKey: "amber" },
  { id: 3, title: "THRESHOLD — Short Film",       category: "Narrative",    duration: "18:45", year: 2023, views: "340K", grade: "Warm Cinematic",  accentKey: "blue"  },
  { id: 4, title: "KINETIC — Sports Promo",       category: "Commercial",   duration: "0:30", year: 2024, views: "5.7M", grade: "High Contrast",   accentKey: "amber" },
  { id: 5, title: "SOLSTICE — Documentary",       category: "Documentary",  duration: "52:00", year: 2023, views: "120K", grade: "Filmic Grain",    accentKey: "blue"  },
  { id: 6, title: "REVERIE — Brand Identity",    category: "Commercial",   duration: "1:00", year: 2025, views: "1.2M", grade: "Matte Orange",    accentKey: "amber" },
];

const TOOLKIT = [
  { name: "DaVinci Resolve Studio",  version: "19.1",  icon: <Cpu size={16} />,     role: "Color Grading · Editing · Fusion",  level: 98 },
  { name: "Adobe Premiere Pro",      version: "2025",  icon: <Film size={16} />,     role: "Assembly Edit · Multicam",           level: 90 },
  { name: "After Effects",           version: "2025",  icon: <Layers size={16} />,   role: "Motion Graphics · Compositing",      level: 85 },
  { name: "Cinema 4D",               version: "2025",  icon: <Monitor size={16} />,  role: "3D Integration · Title Sequences",   level: 72 },
  { name: "Avid Media Composer",     version: "23.x",  icon: <Film size={16} />,     role: "Broadcast Delivery",                 level: 68 },
  { name: "Blackmagic Design RAW",   version: "Latest",icon: <Star size={16} />,     role: "RAW Processing · Dailies",           level: 95 },
];

const AWARDS = [
  { label: "Projects Delivered", value: "340+",  icon: <Award size={18} /> },
  { label: "Years Experience",   value: "8",     icon: <Clock size={18} /> },
  { label: "Client Countries",   value: "22",    icon: <Globe size={18} /> },
  { label: "Awards Won",         value: "14",    icon: <Star size={18} /> },
];

const getCategoryColors = (dv) => ({
  "Commercial":  { bg: "rgba(47,116,208,0.12)",  border: "rgba(47,116,208,0.3)",  text: dv.blueL },
  "Music Video": { bg: "rgba(245,166,35,0.12)",  border: "rgba(245,166,35,0.3)",  text: dv.amberL },
  "Narrative":   { bg: "rgba(74,158,255,0.12)",  border: "rgba(74,158,255,0.3)",  text: "#7CBFFF" },
  "Documentary": { bg: "rgba(155,155,155,0.10)", border: "rgba(155,155,155,0.25)",text: "#BBBBBB" },
});

// ─── Section fade-in wrapper ─────────────────────────────────────────────────
function SectionReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── DaVinci-style section header ────────────────────────────────────────────
function PanelHeader({ icon, title, subtitle, dv }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: "rgba(47,116,208,0.15)",
        border: `1px solid rgba(47,116,208,0.3)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: dv.blue,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
          color: dv.blue, fontWeight: 600, marginBottom: 2,
        }}>
          {subtitle}
        </p>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: dv.white, letterSpacing: "-0.02em",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// ─── Horizontal rule with label ───────────────────────────────────────────────
function DVDivider({ label, dv }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "48px 0 36px" }}>
      <div style={{ flex: 1, height: 1, background: dv.border }} />
      {label && (
        <span style={{
          fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
          color: dv.gray2, whiteSpace: "nowrap",
        }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: dv.border }} />
    </div>
  );
}

// ─── Portfolio Clip Card ──────────────────────────────────────────────────────
function ClipCard({ item, dv }) {
  const [hovered, setHovered] = useState(false);
  const cat = getCategoryColors(dv)[item.category] || getCategoryColors(dv)["Documentary"];
  const accent = item.accentKey === "blue" ? dv.blue : dv.amber;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.025 : 1,
        y: hovered ? -4 : 0,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        background: dv.bg2,
        border: `1px solid ${hovered ? accent : dv.border}`,
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accent}55`
          : "0 4px 16px rgba(0,0,0,0.3)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Cinematic thumbnail area */}
      <div style={{
        aspectRatio: "16/9",
        background: `linear-gradient(135deg, ${dv.bg3} 0%, ${dv.bg1} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Film grain overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            radial-gradient(ellipse at 30% 40%, ${accent}18 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, ${dv.blue}12 0%, transparent 55%)
          `,
        }} />

        {/* Waveform / timeline indicator lines */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 24, display: "flex", alignItems: "flex-end", gap: 2, padding: "0 12px 6px", opacity: 0.4 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${Math.max(20, Math.sin(i * 0.7) * 50 + 60)}%`,
              background: accent,
              borderRadius: 1,
              opacity: 0.6 + Math.sin(i) * 0.4,
            }} />
          ))}
        </div>

        {/* Amber accent border on hover (mimics DaVinci selected clip) */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute", inset: 0,
            border: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />

        {/* Play button */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: `${accent}22`,
            backdropFilter: "blur(8px)",
            border: `1px solid ${accent}88`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Play size={18} color={accent} style={{ marginLeft: 3 }} />
          </div>
        </motion.div>

        {/* Duration badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          padding: "3px 8px", borderRadius: 4,
          background: "rgba(0,0,0,0.7)",
          fontSize: 11, fontWeight: 600, color: dv.white,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          letterSpacing: "0.04em",
        }}>
          {item.duration}
        </div>

        {/* Grade label */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "3px 8px", borderRadius: 4,
          background: `${accent}22`,
          border: `1px solid ${accent}44`,
          fontSize: 9, fontWeight: 600, color: accent,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          {item.grade}
        </div>
      </div>

      {/* Card meta */}
      <div style={{ padding: "14px 16px 16px", background: dv.panel }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: dv.white,
            letterSpacing: "-0.01em", lineHeight: 1.3,
          }}>
            {item.title}
          </p>
          <span style={{
            fontSize: 10, fontWeight: 600, color: cat.text,
            background: cat.bg, border: `1px solid ${cat.border}`,
            padding: "2px 8px", borderRadius: 4,
            letterSpacing: "0.06em", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            {item.category}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: dv.gray1 }}>
            <Eye size={11} /> {item.views}
          </span>
          <span style={{ fontSize: 11, color: dv.gray2 }}>·</span>
          <span style={{ fontSize: 11, color: dv.gray2 }}>{item.year}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Toolkit Row ─────────────────────────────────────────────────────────────
function ToolkitRow({ tool, delay, dv }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: "grid", gridTemplateColumns: "1fr auto",
        alignItems: "center", gap: 16,
        padding: "14px 16px",
        background: hovered ? "rgba(47,116,208,0.06)" : "transparent",
        borderBottom: `1px solid ${dv.border}`,
        transition: "background 0.2s ease",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          background: hovered ? "rgba(47,116,208,0.2)" : "rgba(47,116,208,0.08)",
          border: `1px solid ${hovered ? "rgba(47,116,208,0.5)" : dv.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: hovered ? dv.blue : dv.gray1,
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}>
          {tool.icon}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: dv.white, marginBottom: 2 }}>{tool.name}</p>
          <p style={{ fontSize: 11, color: dv.gray2 }}>{tool.role}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {/* Level bar */}
        <div style={{ width: 80, height: 3, background: dv.bg3, borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tool.level}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${dv.blue}, ${dv.blueL})`,
              borderRadius: 2,
            }}
          />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: dv.gray2, letterSpacing: "0.04em",
          fontFamily: "'JetBrains Mono', monospace",
          minWidth: 32, textAlign: "right",
        }}>
          v{tool.version}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Stat tile ───────────────────────────────────────────────────────────────
function StatTile({ stat, delay, dv }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      style={{
        padding: "20px 24px",
        background: dv.bg2,
        border: `1px solid ${dv.border}`,
        borderRadius: 6,
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", gap: 8,
      }}
    >
      <div style={{ color: dv.blue, opacity: 0.8 }}>{stat.icon}</div>
      <p style={{
        fontSize: 32, fontWeight: 800, color: dv.white,
        letterSpacing: "-0.03em", fontFamily: "'Inter', system-ui",
        lineHeight: 1,
      }}>
        {stat.value}
      </p>
      <p style={{ fontSize: 11, color: dv.gray2, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {stat.label}
      </p>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function EditorProfile() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const dv = getDaVinciColors(isDark);
  
  // Editor-only state
  const isEditor = user?.role === 'admin' && user?.email === 'yashvanth@skycuts.io';
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', clientId: '', price: '' });
  const [formError, setFormError] = useState('');
  const [showWorkspace, setShowWorkspace] = useState(false);

  // Public project request state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', email: '', title: '', description: '', assetLink: '' });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Fetch editor-only data
  const fetchEditorData = async () => {
    if (!isEditor) return;
    try {
      setLoading(true);
      setError(null);
      const [projRes, clientRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/clients'),
      ]);
      setProjects(projRes.data);
      setClients(clientRes.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditor) {
      fetchEditorData();
    }
  }, [isEditor]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Project title is required.');
      return;
    }
    if (!form.clientId) {
      setFormError('Please select a client.');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      await api.post('/projects', {
        title: form.title.trim(),
        description: form.description.trim(),
        clientId: form.clientId,
        price: parseFloat(form.price) || 0,
      });
      setModalOpen(false);
      setForm({ title: '', description: '', clientId: '', price: '' });
      await fetchEditorData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { icon: Film, label: 'Total Projects', value: projects.length, color: '#6366f1' },
    { icon: Users, label: 'Active Clients', value: clients.length, color: '#22d3ee' },
    { icon: Clock, label: 'In Review', value: projects.filter(p => p.status === 'in_review').length, color: '#c084fc' },
    { icon: TrendingUp, label: 'Paid', value: projects.filter(p => p.status === 'paid').length, color: '#34d399' },
  ];

  // Handle public project request submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.name.trim() || !requestForm.email.trim() || !requestForm.title.trim()) {
      setRequestError('Name, email, and project title are required.');
      return;
    }
    setRequestSubmitting(true);
    setRequestError('');
    try {
      await api.post('/projects/request', requestForm);
      setRequestSuccess(true);
      setRequestForm({ name: '', email: '', title: '', description: '', assetLink: '' });
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setRequestSuccess(false);
    setRequestError('');
    setRequestForm({ name: '', email: '', title: '', description: '', assetLink: '' });
  };

  // Handle accepting/declining pending requests
  const handleRequestAction = async (projectId, action) => {
    try {
      const newStatus = action === 'accept' ? 'awaiting_assets' : 'declined';
      await api.patch(`/projects/${projectId}/status`, { status: newStatus });
      await fetchEditorData();
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  const pendingRequests = projects.filter(p => p.status === 'pending');

  return (
    <div style={{
      minHeight: "100vh",
      background: dv.bg0,
      color: dv.white,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #2F74D0; border-radius: 2px; }

        /* Timeline clip hover glow */
        @keyframes clip-select-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.3); }
          50%       { box-shadow: 0 0 0 4px rgba(245,166,35,0.1); }
        }

        @keyframes dv-scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      {/* Navbar — always shown */}
      <div style={{
        background: dv.bg1,
        borderBottom: `1px solid ${dv.border}`,
      }}>
        <Navbar />
      </div>

      {/* ═══ HERO SECTION ═══════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        maxHeight: 900,
        overflow: "hidden",
        background: `linear-gradient(to bottom, ${dv.bg0} 0%, ${isDark ? '#0d1520' : '#e2e8f0'} 60%, ${dv.bg0} 100%)`,
      }}>
        {/* 3D Node Canvas — fills hero */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <DaVinciNodeTree />
        </div>

        {/* Subtle top scan-line decor */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${dv.blue}, ${dv.amber}, transparent)`,
          zIndex: 2, opacity: 0.6,
        }} />

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
          background: `linear-gradient(to bottom, transparent, ${dv.bg0})`,
          zIndex: 1, pointerEvents: "none",
        }} />

        {/* Hero text overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px",
          textAlign: "center",
          pointerEvents: "none",
        }}>
          {/* Label chip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 4,
              background: "rgba(47,116,208,0.12)",
              border: "1px solid rgba(47,116,208,0.3)",
              marginBottom: 20,
            }}
          >
            <Zap size={12} color={dv.blue} />
            <span style={{ fontSize: 11, fontWeight: 600, color: dv.blue, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Editor Profile — SkyCuts
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "clamp(40px, 8vw, 88px)",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              marginBottom: 16,
              fontFamily: "'Inter', system-ui",
            }}
          >
            Yashvanth
            <span style={{
              background: `linear-gradient(135deg, ${dv.blue}, ${dv.blueL})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}> SKY</span>
          </motion.h1>

          {/* Title */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              fontSize: "clamp(14px, 2.5vw, 20px)",
              fontWeight: 500,
              color: dv.amber,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Senior Colorist & Post-Production Editor
          </motion.p>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{
              fontSize: "clamp(13px, 1.8vw, 16px)",
              color: dv.gray1,
              maxWidth: 560,
              lineHeight: 1.7,
              fontWeight: 400,
              marginBottom: 36,
            }}
          >
            Transforming raw footage into cinematic experiences for over 8 years.
            Specialized in DaVinci Resolve color science, narrative-driven editing,
            and broadcast-ready delivery at the highest technical standards.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            style={{ display: "flex", gap: 12, pointerEvents: "all", flexWrap: "wrap", justifyContent: "center" }}
          >
            <button
              onClick={() => document.getElementById("portfolio-grid").scrollIntoView({ behavior: "smooth" })}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 6,
                background: dv.blue, color: "#fff",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                fontFamily: "'Inter', system-ui",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = dv.blueL}
              onMouseLeave={e => e.currentTarget.style.background = dv.blue}
            >
              <Play size={15} /> View Portfolio
            </button>
            <button
              onClick={() => setRequestModalOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 6,
                background: dv.amber, color: "#111",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                fontFamily: "'Inter', system-ui",
                transition: "all 0.2s ease",
                boxShadow: "0 0 20px rgba(245,166,35,0.4)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = dv.amberL; e.currentTarget.style.boxShadow = "0 0 30px rgba(245,166,35,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = dv.amber; e.currentTarget.style.boxShadow = "0 0 20px rgba(245,166,35,0.4)"; }}
            >
              <Zap size={15} /> Start a Project
            </button>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 6,
                background: "transparent", color: dv.gray1,
                border: `1px solid ${dv.gray3}`, cursor: "pointer",
                fontSize: 14, fontWeight: 500,
                fontFamily: "'Inter', system-ui",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = dv.amber; e.currentTarget.style.color = dv.amber; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dv.gray3; e.currentTarget.style.color = dv.gray1; }}
            >
              <Download size={15} /> Download Reel
            </button>
          </motion.div>
        </div>

        {/* Corner technical decoration — top left */}
        <div style={{
          position: "absolute", top: 20, left: 24, zIndex: 2,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {["NODE / 17", "CONN / 19", "FPS  / 24"].map((t, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              style={{
                fontSize: 9, color: dv.gray3,
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.08em",
              }}
            >
              {t}
            </motion.p>
          ))}
        </div>

        {/* Corner technical decoration — bottom right */}
        <div style={{
          position: "absolute", bottom: 60, right: 24, zIndex: 2,
          display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end",
        }}>
          {["COLOR SCIENCE: DaVinci Wide Gamut", "GRADE: ACES AP0", "OUTPUT: P3-D65"].map((t, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              style={{
                fontSize: 9, color: dv.gray3,
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.05em",
              }}
            >
              {t}
            </motion.p>
          ))}
        </div>
      </section>

      {/* ═══ STUDIO WORKSPACE (Editor Only) ═══════════════════════════════════ */}
      {isEditor && (
        <section style={{
          padding: "40px 24px",
          background: dv.bg0,
          borderBottom: `1px solid ${dv.border}`,
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            {/* Workspace Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 16px", borderRadius: 4,
                    background: "rgba(245,166,35,0.12)",
                    border: "1px solid rgba(245,166,35,0.3)",
                    marginBottom: 12,
                  }}
                >
                  <Zap size={12} color={dv.amber} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: dv.amber, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Studio Workspace
                  </span>
                </motion.div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: dv.white, marginBottom: 4 }}>
                  Manage Your Projects
                </h2>
                <p style={{ fontSize: 14, color: dv.gray2 }}>
                  Create, track, and deliver client projects from one place.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 8,
                  background: dv.blue, color: "#fff",
                  border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = dv.blueL}
                onMouseLeave={e => e.currentTarget.style.background = dv.blue}
              >
                <Plus size={16} /> New Project
              </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 36 }}>
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  style={{
                    padding: "22px 24px",
                    background: dv.bg1,
                    border: `1px solid ${dv.border}`,
                    borderRadius: 12,
                    display: "flex", alignItems: "center", gap: 16,
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: `${s.color}18`, border: `1px solid ${s.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <s.icon size={22} color={s.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: dv.gray2, fontWeight: 500, marginBottom: 3 }}>{s.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 700, color: dv.white, letterSpacing: "-0.03em" }}>{s.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Incoming Requests Section */}
            {pendingRequests.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 16px", borderRadius: 4,
                      background: "rgba(245,166,35,0.12)",
                      border: "1px solid rgba(245,166,35,0.3)",
                    }}
                  >
                    <Zap size={12} color={dv.amber} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: dv.amber, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      New Leads
                    </span>
                  </motion.div>
                  <p style={{ fontSize: 13, color: dv.gray2 }}>{pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} pending</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                  {pendingRequests.map((request, i) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        padding: "20px",
                        background: dv.bg1,
                        border: `1px solid ${dv.amber}40`,
                        borderRadius: 12,
                        boxShadow: "0 0 20px rgba(245,166,35,0.1)",
                      }}
                    >
                      <div style={{ marginBottom: 12 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600, color: dv.white, marginBottom: 4 }}>{request.title}</h4>
                        <p style={{ fontSize: 13, color: dv.gray2, marginBottom: 8 }}>{request.description || 'No description provided'}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: dv.gray1 }}>
                          <span style={{ fontWeight: 500 }}>{request.requesterName}</span>
                          <span style={{ opacity: 0.5 }}>•</span>
                          <span>{request.requesterEmail}</span>
                        </div>
                        {request.assetLink && (
                          <a
                            href={request.assetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              fontSize: 12, color: dv.blue, marginTop: 8,
                              textDecoration: "none",
                            }}
                          >
                            <Download size={12} /> View Assets
                          </a>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleRequestAction(request._id, 'accept')}
                          style={{
                            flex: 1, padding: "10px", borderRadius: 6,
                            background: dv.blue, color: "#fff",
                            border: "none", cursor: "pointer",
                            fontSize: 13, fontWeight: 600,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = dv.blueL}
                          onMouseLeave={e => e.currentTarget.style.background = dv.blue}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(request._id, 'decline')}
                          style={{
                            flex: 1, padding: "10px", borderRadius: 6,
                            background: "transparent", color: dv.gray1,
                            border: `1px solid ${dv.border}`, cursor: "pointer",
                            fontSize: 13, fontWeight: 500,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = dv.border; e.currentTarget.style.color = dv.gray1; }}
                        >
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Search + Projects */}
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: dv.gray2 }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search projects or clients…"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    background: dv.bg1,
                    border: `1px solid ${dv.border}`,
                    borderRadius: 8,
                    color: dv.white,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              <p style={{ fontSize: 13, color: dv.gray2 }}>{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Project Grid */}
            {error ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: dv.bg1, border: `1px solid ${dv.border}`, borderRadius: 12 }}>
                <AlertCircle size={48} style={{ margin: "0 auto 16px", opacity: 0.3, display: "block", color: "#ef4444" }} />
                <p style={{ color: dv.gray2, fontSize: 15, marginBottom: 16 }}>{error}</p>
                <button onClick={fetchEditorData} style={{ padding: "10px 20px", background: dv.blue, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} delay={i * 0.05} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: dv.bg1, border: `1px solid ${dv.border}`, borderRadius: 12 }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Film size={40} style={{ margin: "0 auto 16px", opacity: 0.2, display: "block", color: dv.blue }} />
                  <p style={{ color: dv.gray2, fontSize: 15, marginBottom: 16 }}>
                    {search ? 'No projects match your search.' : 'No projects yet. Create your first one!'}
                  </p>
                  {!search && (
                    <button
                      onClick={() => setModalOpen(true)}
                      style={{ padding: "10px 20px", background: dv.blue, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
                    >
                      <Plus size={14} /> Create Project
                    </button>
                  )}
                </motion.div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                {filtered.map((p, i) => (
                  <ProjectCard key={p._id} project={p} index={i} basePath="/profile" />
                ))}
              </div>
            )}
          </div>

          {/* Create Project Modal */}
          <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setFormError(''); }} title="Create New Project">
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Project Title *
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Brand Campaign Edit"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: dv.bg1,
                    border: `1px solid ${dv.border}`,
                    borderRadius: 8,
                    color: dv.white,
                    fontSize: 14,
                    outline: "none",
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief project description…"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: dv.bg1,
                    border: `1px solid ${dv.border}`,
                    borderRadius: 8,
                    color: dv.white,
                    fontSize: 14,
                    outline: "none",
                    minHeight: 80,
                  }}
                  rows={3}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Assign Client *
                </label>
                <select
                  value={form.clientId}
                  onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: dv.bg1,
                    border: `1px solid ${dv.border}`,
                    borderRadius: 8,
                    color: dv.white,
                    fontSize: 14,
                    outline: "none",
                    appearance: "none",
                    cursor: "pointer",
                  }}
                  required
                >
                  <option value="">Select a client…</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Invoice Price (USD)
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: dv.bg1,
                    border: `1px solid ${dv.border}`,
                    borderRadius: 8,
                    color: dv.white,
                    fontSize: 14,
                    outline: "none",
                  }}
                  min="0"
                  step="0.01"
                />
              </div>

              {formError && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, padding: "12px", background: "transparent", border: `1px solid ${dv.border}`, borderRadius: 8, color: dv.gray1, cursor: "pointer", fontSize: 14 }}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={{ flex: 2, padding: "12px", background: dv.blue, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  {creating ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Creating…</> : <><Plus size={16} /> Create Project</>}
                </button>
              </div>
            </form>
          </Modal>
        </section>
      )}

      {/* ═══ PUBLIC PROJECT REQUEST MODAL ═══════════════════════════════════ */}
      <Modal isOpen={requestModalOpen} onClose={closeRequestModal} title="Start a Project">
        {requestSuccess ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ marginBottom: 20 }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(52,211,153,0.15)", border: "2px solid #34d399",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <Zap size={32} color="#34d399" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: dv.white, marginBottom: 8 }}>
                Request Sent!
              </h3>
              <p style={{ fontSize: 14, color: dv.gray2, lineHeight: 1.6 }}>
                Yashvanth will review your project request and get back to you shortly.
              </p>
            </motion.div>
            <button
              onClick={closeRequestModal}
              style={{
                width: "100%", padding: "12px",
                background: dv.blue, color: "#fff",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontSize: 14, fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Your Name *
              </label>
              <input
                value={requestForm.name}
                onChange={e => setRequestForm(f => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: dv.bg1,
                  border: `1px solid ${dv.border}`,
                  borderRadius: 8,
                  color: dv.white,
                  fontSize: 14,
                  outline: "none",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Email Address *
              </label>
              <input
                type="email"
                value={requestForm.email}
                onChange={e => setRequestForm(f => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: dv.bg1,
                  border: `1px solid ${dv.border}`,
                  borderRadius: 8,
                  color: dv.white,
                  fontSize: 14,
                  outline: "none",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Project Title *
              </label>
              <input
                value={requestForm.title}
                onChange={e => setRequestForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Brand Campaign Edit"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: dv.bg1,
                  border: `1px solid ${dv.border}`,
                  borderRadius: 8,
                  color: dv.white,
                  fontSize: 14,
                  outline: "none",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Project Brief
              </label>
              <textarea
                value={requestForm.description}
                onChange={e => setRequestForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe your project, timeline, and vision…"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: dv.bg1,
                  border: `1px solid ${dv.border}`,
                  borderRadius: 8,
                  color: dv.white,
                  fontSize: 14,
                  outline: "none",
                  minHeight: 100,
                }}
                rows={4}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dv.gray2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Link to Raw Assets (Optional)
              </label>
              <input
                type="url"
                value={requestForm.assetLink}
                onChange={e => setRequestForm(f => ({ ...f, assetLink: e.target.value }))}
                placeholder="https://drive.google.com/..."
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: dv.bg1,
                  border: `1px solid ${dv.border}`,
                  borderRadius: 8,
                  color: dv.white,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            {requestError && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>
                {requestError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button type="button" onClick={closeRequestModal} style={{ flex: 1, padding: "12px", background: "transparent", border: `1px solid ${dv.border}`, borderRadius: 8, color: dv.gray1, cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
              <button type="submit" disabled={requestSubmitting} style={{ flex: 2, padding: "12px", background: dv.amber, border: "none", borderRadius: 8, color: "#111", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                {requestSubmitting ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Sending…</> : <><Zap size={16} /> Submit Request</>}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ═══ PUBLIC SECTIONS ═══════════════════════════════════════════════════ */}

      {/* ═══ MAIN CONTENT ════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <SectionReveal>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 2,
            background: dv.border,
            border: `1px solid ${dv.border}`,
            borderRadius: 8,
            overflow: "hidden",
            margin: "40px 0",
          }}>
            {AWARDS.map((s, i) => (
              <StatTile key={i} stat={s} delay={i * 0.08} dv={dv} />
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Software Arsenal" dv={dv} />

        {/* ── Toolkit Panel ───────────────────────────────────────────────── */}
        <SectionReveal>
          <div style={{
            background: dv.bg1,
            border: `1px solid ${dv.border}`,
            borderRadius: 8,
            overflow: "hidden",
          }}>
            {/* Panel header bar — mimics DaVinci Resolve Inspector tab */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px",
              height: 40,
              background: dv.bg3,
              borderBottom: `1px solid ${dv.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {["Color", "Edit", "Cut", "Fusion", "Deliver"].map((tab, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: i === 0 ? 700 : 500,
                    color: i === 0 ? dv.white : dv.gray2,
                    letterSpacing: "0.04em",
                    paddingBottom: 2,
                    borderBottom: i === 0 ? `2px solid ${dv.amber}` : "2px solid transparent",
                    cursor: "pointer",
                  }}>
                    {tab}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 10, color: dv.gray2, letterSpacing: "0.06em" }}>INSPECTOR — TOOLKIT</span>
            </div>

            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto",
              padding: "8px 16px",
              background: dv.bg2,
              borderBottom: `1px solid ${dv.border}`,
            }}>
              <span style={{ fontSize: 10, color: dv.gray2, letterSpacing: "0.08em", textTransform: "uppercase" }}>Application</span>
              <span style={{ fontSize: 10, color: dv.gray2, letterSpacing: "0.08em", textTransform: "uppercase" }}>Proficiency</span>
            </div>

            {/* Tool rows */}
            {TOOLKIT.map((tool, i) => (
              <ToolkitRow key={i} tool={tool} delay={i * 0.06} dv={dv} />
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Selected Works" dv={dv} />

        {/* ── Portfolio Grid ───────────────────────────────────────────────── */}
        <SectionReveal>
          <PanelHeader
            icon={<Film size={16} />}
            title="Portfolio"
            subtitle="Media Pool — Selected Works"
            dv={dv}
          />
          <div
            id="portfolio-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {PORTFOLIO.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
              >
                <ClipCard item={item} dv={dv} />
              </motion.div>
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Contact" dv={dv} />

        {/* ── Contact Footer ─────────────────────────────────────────────── */}
        <SectionReveal>
          <div style={{
            background: dv.bg1,
            border: `1px solid ${dv.border}`,
            borderRadius: 8,
            padding: "36px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}>
            <div>
              <p style={{ fontSize: 11, color: dv.blue, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
                Available for Projects
              </p>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: dv.white, letterSpacing: "-0.02em", marginBottom: 8 }}>
                Let&apos;s Create Something Exceptional
              </h3>
              <p style={{ fontSize: 14, color: dv.gray1, maxWidth: 420, lineHeight: 1.6 }}>
                Open to commercial projects, narrative work, and long-term studio partnerships.
                Response within 24 hours.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: <Mail size={14} />, label: "marcus@skycuts.studio" },
                
              ].map((c, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, color: dv.gray1,
                }}>
                  <span style={{ color: dv.blue }}>{c.icon}</span>
                  {c.label}
                </div>
              ))}
            </div>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 6,
                background: dv.amber, color: "#111",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700,
                fontFamily: "'Inter', system-ui",
                letterSpacing: "0.02em",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.background = dv.amberL}
              onMouseLeave={e => e.currentTarget.style.background = dv.amber}
            >
              Get in Touch <ChevronRight size={16} />
            </button>
          </div>
        </SectionReveal>

        {/* Footer bar */}
        <div style={{
          marginTop: 48, paddingTop: 24,
          borderTop: `1px solid ${dv.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ fontSize: 11, color: dv.gray2 }}>
            © 2025 Marcus Reid · Powered by{" "}
            <span style={{ color: dv.blue }}>SkyCuts</span>
          </p>
          <p style={{ fontSize: 10, color: dv.gray3, fontFamily: "monospace" }}>
            DaVinci Resolve Studio 19.1 · ACES · P3-D65
          </p>
        </div>
      </div>
    </div>
  );
}
