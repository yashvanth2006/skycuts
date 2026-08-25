import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency.js';
import { ArrowRight, Film, IndianRupee, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

export default function ProjectCard({ project, index = 0, basePath = '/dashboard' }) {
  const navigate = useNavigate();

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={() => navigate(`${basePath}/project/${project._id}`)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '20px',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'border-color 0.15s ease, background 0.15s ease',
      }}
      whileHover={{ borderColor: 'var(--border-hover)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: 'var(--accent-red-surface)',
          border: '1px solid rgba(185,28,28,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Film size={18} color="var(--accent-red)" />
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 5, color: 'var(--text-primary)', lineHeight: 1.3 }}>
        {project.title}
      </h3>
      {project.description && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>
      )}

      <div style={{ height: 1, background: 'var(--border)', margin: '0 0 14px 0' }} />

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            <IndianRupee size={12} />
            {formatCurrency(project.price)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            <Clock size={12} />
            {timeAgo(project.updatedAt)}
          </span>
        </div>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowRight size={13} color="var(--accent-red)" />
        </div>
      </div>

      {/* Client chip (admin view) */}
      {project.client?.name && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--accent-red-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>
            {project.client.name[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.client.name}</span>
        </div>
      )}
    </motion.div>
  );
}
