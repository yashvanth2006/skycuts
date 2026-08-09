import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Monitor, Film, Layers, Cpu, Star, Award, Clock,
  Play, ChevronRight, Globe, Mail, Zap, Eye, Download,
  Shield, Video, MonitorPlay, ArrowRight
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import DaVinciNodeTree from "../../components/three/DaVinciNodeTree.jsx";
import GoogleAuthModal from "../../components/GoogleAuthModal.jsx";

// ─── DaVinci Resolve-inspired color palette (locked dark) ──────────────────
const dv = {
  bg0:    "#111111",
  bg1:    "#181818",
  bg2:    "#202020",
  bg3:    "#272727",
  panel:  "#1c1c1c",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(47,116,208,0.5)",
  blue:   "#2F74D0",
  blueL:  "#4A9EFF",
  amber:  "#F5A623",
  amberL: "#FFB74D",
  white:  "#E8E8E8",
  gray1:  "#9A9A9A",
  gray2:  "#5A5A5A",
  gray3:  "#3A3A3A",
};


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

const CATEGORY_COLORS = {
  "Commercial":  { bg: "rgba(47,116,208,0.12)",  border: "rgba(47,116,208,0.3)",  text: dv.blueL },
  "Music Video": { bg: "rgba(245,166,35,0.12)",  border: "rgba(245,166,35,0.3)",  text: dv.amberL },
  "Narrative":   { bg: "rgba(74,158,255,0.12)",  border: "rgba(74,158,255,0.3)",  text: "#7CBFFF" },
  "Documentary": { bg: "rgba(155,155,155,0.10)", border: "rgba(155,155,155,0.25)",text: "#BBBBBB" },
};

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
function PanelHeader({ icon, title, subtitle }) {
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
function DVDivider({ label }) {
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
// Accepts both API items (from MongoDB) and fallback mock items
function ClipCard({ item }) {
  const [hovered, setHovered] = useState(false);
  const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Documentary"];
  const accentColor = item.accent || dv.blue;

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
        border: `1px solid ${hovered ? accentColor : dv.border}`,
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${item.accent}55`
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
            radial-gradient(ellipse at 30% 40%, ${item.accent}18 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, ${dv.blue}12 0%, transparent 55%)
          `,
        }} />

        {/* Waveform / timeline indicator lines */}
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

        {/* Amber accent border on hover (mimics DaVinci selected clip) */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute", inset: 0,
            border: `2px solid ${item.accent}`,
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
            background: `${item.accent}22`,
            backdropFilter: "blur(8px)",
            border: `1px solid ${item.accent}88`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Play size={18} color={item.accent} style={{ marginLeft: 3 }} />
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
          background: `${item.accent}22`,
          border: `1px solid ${item.accent}44`,
          fontSize: 9, fontWeight: 600, color: item.accent,
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
function ToolkitRow({ tool, delay }) {
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
function StatTile({ stat, delay }) {
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState(false);

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

  return (
    <div style={{
      minHeight: "100vh",
      background: dv.bg0,
      color: dv.white,
      fontFamily: "'Inter', system-ui, sans-serif",
      // Force dark mode regardless of user setting
      colorScheme: "dark",
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
        background: "#141414",
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
        background: `linear-gradient(to bottom, ${dv.bg0} 0%, #0d1520 60%, ${dv.bg0} 100%)`,
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
            Marcus
            <span style={{
              background: `linear-gradient(135deg, ${dv.blue}, ${dv.blueL})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}> Reid</span>
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
              <StatTile key={i} stat={s} delay={i * 0.08} />
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Software Arsenal" />

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
              <ToolkitRow key={i} tool={tool} delay={i * 0.06} />
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Selected Works" />

        {/* ── Portfolio Grid ───────────────────────────────────────────────── */}
        <SectionReveal>
          <PanelHeader
            icon={<Film size={16} />}
            title="Portfolio"
            subtitle="Media Pool — Selected Works"
          />
          <div
            id="portfolio-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {portfolioLoading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: dv.gray1, fontSize: 14 }}>
                Loading portfolio...
              </div>
            ) : portfolioError ? (
              <div style={{
                gridColumn: '1/-1', textAlign: 'center', padding: '60px 0',
                color: dv.gray1, fontSize: 14,
              }}>
                <div style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '28px 36px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
                }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>&#9888;</span>
                  <span style={{ fontWeight: 600, color: '#f87171' }}>Unable to load portfolio.</span>
                  <span style={{ fontSize: 13, color: dv.gray2 }}>Please try again later.</span>
                </div>
              </div>
            ) : portfolio.length === 0 ? (
              <div style={{
                gridColumn: '1/-1', textAlign: 'center', padding: '60px 0',
                color: dv.gray2, fontSize: 14,
              }}>
                <div style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '28px 36px', borderRadius: 8,
                  background: dv.bg2, border: `1px solid ${dv.border}`,
                }}>
                  <span style={{ fontSize: 22, lineHeight: 1, opacity: 0.5 }}>&#127916;</span>
                  <span style={{ fontWeight: 600, color: dv.gray1 }}>No portfolio projects available yet.</span>
                </div>
              </div>
            ) : portfolio.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
              >
                <ClipCard item={item} />
              </motion.div>
            ))}
          </div>
        </SectionReveal>

        <DVDivider label="Contact" />

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
                { icon: <Video size={14} />, label: "@marcusreid_color" },
                { icon: <MonitorPlay size={14} />, label: "youtube.com/marcusreid" },
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
              onClick={() => setAuthModalOpen(true)}
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
              START PROJECT <ArrowRight size={16} />
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

      <GoogleAuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}
