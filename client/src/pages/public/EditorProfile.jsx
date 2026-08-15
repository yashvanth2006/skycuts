import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Monitor, Film, Layers, Cpu, Star, Award, Clock,
  Play, ChevronRight, Mail, Zap, Eye,
  Shield, Video, MonitorPlay, ArrowRight
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import GoogleAuthModal from "../../components/GoogleAuthModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

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
];

const CATEGORY_COLORS = (isDark) => ({
  "Commercial":  { bg: "rgba(47,116,208,0.12)",  border: "rgba(47,116,208,0.3)",  text: "#4A9EFF" },
  "Music Video": { bg: "rgba(245,166,35,0.12)",  border: "rgba(245,166,35,0.3)",  text: "#FFB74D" },
  "Narrative":   { bg: "rgba(74,158,255,0.12)",  border: "rgba(74,158,255,0.3)",  text: "#7CBFFF" },
  "Documentary": { bg: "var(--bg-glass)", border: "var(--border-subtle)", text: "var(--text-secondary)" },
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
function PanelHeader({ icon, title, subtitle, colors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: "rgba(47,116,208,0.15)",
        border: `1px solid rgba(47,116,208,0.3)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: colors.blue,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
          color: colors.blue, fontWeight: 600, marginBottom: 2,
        }}>
          {subtitle}
        </p>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// ─── Horizontal rule with label ───────────────────────────────────────────────
function DVDivider({ label, colors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "48px 0 36px" }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      {label && (
        <span style={{
          fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--text-secondary)", whiteSpace: "nowrap",
        }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  );
}

// ─── Portfolio Clip Card ──────────────────────────────────────────────────────
function ClipCard({ item, colors }) {
  const [hovered, setHovered] = useState(false);
  const cat = CATEGORY_COLORS(colors.theme === 'dark')[item.category] || CATEGORY_COLORS(colors.theme === 'dark')["Documentary"];
  const accentColor = item.accent || colors.blue;

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
        background: "var(--bg-card)",
        border: `1px solid ${hovered ? accentColor : 'var(--border-subtle)'}`,
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.2), 0 0 0 1px ${item.accent}55`
          : "var(--shadow-card)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div style={{
        aspectRatio: "16/9",
        background: `linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-card) 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            radial-gradient(ellipse at 30% 40%, ${item.accent}18 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, ${colors.blue}12 0%, transparent 55%)
          `,
        }} />

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 24, display: "flex", alignItems: "flex-end", gap: 2, padding: "0 12px 6px", opacity: 0.4 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${Math.max(20, Math.sin(i * 0.7) * 50 + 60)}%`,
              background: item.accent,
              borderRadius: 1,
              opacity: 0.6 + Math.sin(i) * 0.4,
            }} />
          ))}
        </div>

        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute", inset: 0,
            border: `2px solid ${item.accent}`,
            pointerEvents: "none",
          }}
        />

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
            background: `${item.accent}22`,
            backdropFilter: "blur(8px)",
            border: `1px solid ${item.accent}88`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Play size={18} color={item.accent} style={{ marginLeft: 3 }} />
          </div>
        </motion.div>

        <div style={{
          position: "absolute", top: 10, right: 10,
          padding: "3px 8px", borderRadius: 4,
          background: "var(--bg-card)",
          fontSize: 11, fontWeight: 600, color: "var(--text-primary)",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          letterSpacing: "0.04em",
        }}>
          {item.duration}
        </div>

        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "3px 8px", borderRadius: 4,
          background: `${item.accent}22`,
          border: `1px solid ${item.accent}44`,
          fontSize: 9, fontWeight: 600, color: item.accent,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          {item.grade}
        </div>
      </div>

      <div style={{ padding: "14px 16px 16px", background: "var(--bg-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
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
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-secondary)" }}>
            <Eye size={11} /> {item.views}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>·</span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{item.year}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Toolkit Row ─────────────────────────────────────────────────────────────
function ToolkitRow({ tool, delay, colors }) {
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
        borderBottom: `1px solid var(--border-subtle)`,
        transition: "background 0.2s ease",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          background: hovered ? "rgba(47,116,208,0.2)" : "rgba(47,116,208,0.08)",
          border: `1px solid ${hovered ? "rgba(47,116,208,0.5)" : "var(--border-subtle)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: hovered ? colors.blue : "var(--text-secondary)",
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}>
          {tool.icon}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{tool.name}</p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{tool.role}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 80, height: 3, background: "var(--bg-deep)", borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tool.level}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${colors.blue}, ${colors.blueL})`,
              borderRadius: 2,
            }}
          />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: "var(--text-secondary)", letterSpacing: "0.04em",
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
function StatTile({ stat, delay, colors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      style={{
        padding: "20px 24px",
        background: "var(--bg-card)",
        border: `1px solid var(--border-subtle)`,
        borderRadius: 6,
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", gap: 8,
      }}
    >
      <div style={{ color: colors.blue, opacity: 0.8 }}>{stat.icon}</div>
      <p style={{
        fontSize: 32, fontWeight: 800, color: "var(--text-primary)",
        letterSpacing: "-0.03em", fontFamily: "'Inter', system-ui",
        lineHeight: 1,
      }}>
        {stat.value}
      </p>
      <p style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {stat.label}
      </p>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function EditorProfile() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState(false);

  const colors = {
      blue:   "#2F74D0",
      blueL:  "#4A9EFF",
      amber:  "#F5A623",
      amberL: "#FFB74D",
      purple: "#8B5CF6",
      cyan:   "#06b6d4",
      theme
  };

  useEffect(() => {
    if (!loading && location.state?.openProjectRequest) {
      setAuthModalOpen(true);
      // Consume the state exactly once so refresh doesn't reopen the modal
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [loading, location.state, navigate, location.pathname]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/public`);
        if (res.ok) {
          const data = await res.json();
          setPortfolio(data);
        } else {
          setPortfolioError(true);
        }
      } catch {
        setPortfolioError(true);
      } finally {
        setPortfolioLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const handleStartProject = () => {
    if (loading) return;
    if (user) {
      setAuthModalOpen(true);
    } else {
      navigate('/login', { state: { from: 'start-project' } });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-void)",
      color: "var(--text-primary)",
      fontFamily: "'Inter', system-ui, sans-serif",
      colorScheme: theme === 'dark' ? "dark" : "light",
      overflowX: "hidden",
    }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-deep); }
        ::-webkit-scrollbar-thumb { background: var(--accent-blue); border-radius: 4px; }

        @keyframes clip-select-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.3); }
          50%       { box-shadow: 0 0 0 4px rgba(245,166,35,0.1); }
        }

        @keyframes dv-scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        /* ── Mobile responsiveness ─────────────────────────────── */

        /* Hero: replace fixed 100vh with a sensible mobile height */
        .ep-hero {
          height: 100vh;
          min-height: 600px;
          max-height: 900px;
        }

        /* Hero content padding tightened on mobile */
        .ep-hero-content {
          padding: 0 24px;
        }

        /* CTA button group: row on desktop */
        .ep-cta-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Stats: 2 columns */
        .ep-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          background: var(--border-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          overflow: hidden;
          margin: 40px 0;
        }

        /* Portfolio: multi-col on desktop */
        .ep-portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        /* Contact box */
        .ep-contact-box {
          padding: 36px 40px;
        }

        /* HUD decorative corner labels */
        .ep-hud-topleft, .ep-hud-bottomright {
          display: flex;
        }

        /* ── ≤ 768px ─────────────────────────────────────────── */
        @media (max-width: 768px) {

          /* Hero: shrink to fit viewport content naturally */
          .ep-hero {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            padding: 60px 0 48px;
          }

          /* Hero content: switch to relative positioning flow */
          .ep-hero-content {
            position: relative !important;
            padding: 0 20px !important;
          }

          /* CTA group: stack vertically */
          .ep-cta-group {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }

          .ep-cta-group button {
            width: min(280px, 85vw) !important;
            justify-content: center;
          }

          /* Stats: force 2 columns */
          .ep-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            margin: 24px 0 !important;
          }

          /* Portfolio: single column */
          .ep-portfolio-grid {
            grid-template-columns: 1fr !important;
          }

          /* Contact: reduce padding & stack */
          .ep-contact-box {
            padding: 24px 20px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          /* Hide decorative HUD labels */
          .ep-hud-topleft, .ep-hud-bottomright {
            display: none !important;
          }

          /* Bottom fade overlay: shrink */
          .ep-hero-bottom-fade {
            height: 100px !important;
          }
        }

        /* ── ≤ 480px ─────────────────────────────────────────── */
        @media (max-width: 480px) {

          .ep-hero {
            padding: 48px 0 36px;
          }

          .ep-hero-content {
            padding: 0 16px !important;
          }

          /* Stats tile: compact text */
          .ep-stats-grid > div {
            padding: 16px 12px !important;
          }
        }
      `}</style>

      <div style={{
        background: "var(--bg-void)",
        borderBottom: `1px solid var(--border-subtle)`,
      }}>
        <Navbar showDashboard={!!user} />
      </div>

      {/* ═══ HERO SECTION ═══════════════════════════════════════════════════ */}
      <section
        className="ep-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--bg-void)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {/* Clean CSS-only background replacement */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 30%, rgba(47,116,208,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(245,166,35,0.05) 0%, transparent 50%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          }} />
        </div>

        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${colors.blue}, ${colors.amber}, transparent)`,
          zIndex: 2, opacity: 0.6,
        }} />

        <div
          className="ep-hero-bottom-fade"
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
            background: `linear-gradient(to bottom, transparent, var(--bg-void))`,
            zIndex: 1, pointerEvents: "none",
          }}
        />

        <div
          className="ep-hero-content"
          style={{
            position: "absolute", inset: 0, zIndex: 2,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 4,
              background: "var(--bg-deep)",
              border: "1px solid rgba(47,116,208,0.3)",
              marginBottom: 20,
            }}
          >
            <Zap size={12} color={colors.blue} />
            <span style={{ fontSize: 11, fontWeight: 600, color: colors.blue, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Editor Profile — SkyCuts
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "clamp(32px, 10vw, 88px)",
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: 16,
              fontFamily: "'Inter', system-ui",
              whiteSpace: "nowrap",
            }}
          >
            Yashvanth
            <span style={{
              background: `linear-gradient(135deg, ${colors.blue}, ${colors.blueL})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}> SKY</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              fontSize: "clamp(11px, 3vw, 20px)",
              fontWeight: 500,
              color: colors.amber,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 16,
              lineHeight: 1.4,
              maxWidth: "90vw",
            }}
          >
            Senior Colorist & Post-Production Editor
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{
              fontSize: "clamp(13px, 1.8vw, 16px)",
              color: "var(--text-secondary)",
              maxWidth: "min(560px, 90vw)",
              lineHeight: 1.7,
              fontWeight: 400,
              marginBottom: 28,
            }}
          >
            Transforming raw footage into cinematic experiences for over 8 years.
            Specialized in DaVinci Resolve color science, narrative-driven editing,
            and broadcast-ready delivery at the highest technical standards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="ep-cta-group"
            style={{ pointerEvents: "all" }}
          >
            <button
              onClick={() => document.getElementById("portfolio-grid").scrollIntoView({ behavior: "smooth" })}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 6,
                background: colors.blue, color: "#fff",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                fontFamily: "'Inter', system-ui",
                transition: "all 0.2s ease",
                minHeight: 44,
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.blueL}
              onMouseLeave={e => e.currentTarget.style.background = colors.blue}
            >
              <Play size={15} /> View Portfolio
            </button>
            <button
              onClick={handleStartProject}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 6,
                background: colors.amber, color: "#111",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700,
                fontFamily: "'Inter', system-ui",
                letterSpacing: "0.02em",
                transition: "all 0.2s ease",
                minHeight: 44,
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.amberL}
              onMouseLeave={e => e.currentTarget.style.background = colors.amber}
            >
              START PROJECT <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>

        <div
          className="ep-hud-topleft"
          style={{
            position: "absolute", top: 20, left: 24, zIndex: 2,
            flexDirection: "column", gap: 4,
          }}
        >
          {["NODE / 17", "CONN / 19", "FPS  / 24"].map((t, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              style={{
                fontSize: 9, color: "var(--text-secondary)",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.08em",
              }}
            >
              {t}
            </motion.p>
          ))}
        </div>

        <div
          className="ep-hud-bottomright"
          style={{
            position: "absolute", bottom: 60, right: 24, zIndex: 2,
            flexDirection: "column", gap: 4, alignItems: "flex-end",
          }}
        >
          {["COLOR SCIENCE: DaVinci Wide Gamut", "GRADE: ACES AP0", "OUTPUT: P3-D65"].map((t, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              style={{
                fontSize: 9, color: "var(--text-secondary)",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.05em",
              }}
            >
              {t}
            </motion.p>
          ))}
        </div>
      </section>

      {/* ═══ MAIN CONTENT ════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 80px" }}>

        <SectionReveal>
          <div className="ep-stats-grid">
            {AWARDS.map((s, i) => (
              <StatTile key={i} stat={s} delay={i * 0.08} colors={colors} />
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Software Arsenal" colors={colors} />

        <SectionReveal>
          <div style={{
            background: "var(--bg-card)",
            border: `1px solid var(--border-subtle)`,
            borderRadius: 8,
            overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px",
              height: 40,
              background: "var(--bg-deep)",
              borderBottom: `1px solid var(--border-subtle)`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {["Color", "Edit", "Cut", "Fusion", "Deliver"].map((tab, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: i === 0 ? 700 : 500,
                    color: i === 0 ? "var(--text-primary)" : "var(--text-secondary)",
                    letterSpacing: "0.04em",
                    paddingBottom: 2,
                    borderBottom: i === 0 ? `2px solid ${colors.amber}` : "2px solid transparent",
                    cursor: "pointer",
                  }}>
                    {tab}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.06em" }}>INSPECTOR — TOOLKIT</span>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto",
              padding: "8px 16px",
              background: "var(--bg-deep)",
              borderBottom: `1px solid var(--border-subtle)`,
            }}>
              <span style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Application</span>
              <span style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Proficiency</span>
            </div>

            {TOOLKIT.map((tool, i) => (
              <ToolkitRow key={i} tool={tool} delay={i * 0.06} colors={colors} />
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Selected Works" colors={colors} />

        <SectionReveal>
          <PanelHeader
            icon={<Film size={16} />}
            title="Portfolio"
            subtitle="Media Pool — Selected Works"
            colors={colors}
          />
          <div
            id="portfolio-grid"
            className="ep-portfolio-grid"
          >
            {portfolioLoading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: "var(--text-secondary)", fontSize: 14 }}>
                Loading portfolio...
              </div>
            ) : portfolioError ? (
              <div style={{
                gridColumn: '1/-1', textAlign: 'center', padding: '60px 0',
                color: "var(--text-secondary)", fontSize: 14,
              }}>
                <div style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '28px 36px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
                }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>&#9888;</span>
                  <span style={{ fontWeight: 600, color: '#f87171' }}>Unable to load portfolio.</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Please try again later.</span>
                </div>
              </div>
            ) : portfolio.length === 0 ? (
              <div style={{
                gridColumn: '1/-1', textAlign: 'center', padding: '60px 0',
                color: 'var(--text-secondary)', fontSize: 14,
              }}>
                <div style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '28px 36px', borderRadius: 8,
                  background: 'var(--bg-deep)', border: `1px solid var(--border-subtle)`,
                }}>
                  <span style={{ fontSize: 22, lineHeight: 1, opacity: 0.5 }}>&#127916;</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No portfolio projects available yet.</span>
                </div>
              </div>
            ) : portfolio.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
              >
                <ClipCard item={item} colors={colors} />
              </motion.div>
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Contact" colors={colors} />

        {/* ── Contact Footer ─────────────────────────────────────────────── */}
        <SectionReveal>
          <div
            className="ep-contact-box"
            style={{
              background: 'var(--bg-deep)',
              border: `1px solid var(--border-subtle)`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <div>
              <p style={{ fontSize: 11, color: colors.blue, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
                Available for Projects
              </p>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: "-0.02em", marginBottom: 8 }}>
                Let&apos;s Create Something Exceptional
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6 }}>
                Open to commercial projects, narrative work, and long-term studio partnerships.
                Response within 24 hours.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: <Mail size={14} />, label: "marcus@skycuts.studio" },
                { icon: <Video size={14} />, label: "@marcusreid_color" },
                { icon: <MonitorPlay size={14} />, label: "youtube.com/marcusreid" },
              ].map((c, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, color: 'var(--text-secondary)',
                }}>
                  <span style={{ color: colors.blue }}>{c.icon}</span>
                  {c.label}
                </div>
              ))}
            </div>
            <button
              onClick={handleStartProject}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 6,
                background: colors.amber, color: "#111",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700,
                fontFamily: "'Inter', system-ui",
                letterSpacing: "0.02em",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.amberL}
              onMouseLeave={e => e.currentTarget.style.background = colors.amber}
            >
              START PROJECT <ArrowRight size={16} />
            </button>
          </div>
        </SectionReveal>

        {/* Footer bar */}
        <div style={{
          marginTop: 48, paddingTop: 24,
          borderTop: `1px solid var(--border-subtle)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            © 2025 Marcus Reid · Powered by{" "}
            <span style={{ color: colors.blue }}>SkyCuts</span>
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "monospace" }}>
            DaVinci Resolve Studio 19.1 · ACES · P3-D65
          </p>
        </div>
      </div>

      <GoogleAuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}
