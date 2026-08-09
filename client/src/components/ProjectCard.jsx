import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Film, DollarSign, Clock, Archive, RotateCcw } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import api from '../api/axiosInstance.js';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

export default function ProjectCard({ project, index = 0, basePath = '/dashboard', onArchive, onRestore }) {
  const navigate = useNavigate();

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    try {
      await api.patch(`/projects/${project._id}/archive`);
      if (onArchive) onArchive(project._id);
    } catch (err) {
      console.error('Failed to archive project:', err);
    }
  };

  const handleRestore = async (e) => {
    e.stopPropagation();
    try {
      await api.patch(`/projects/${project._id}/restore`);
      if (onRestore) onRestore(project._id);
    } catch (err) {
      console.error('Failed to restore project:', err);
    }
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card project-card"
      onClick={() => navigate(`${basePath}/project/${project._id}`)}
      style={{ padding: '20px', cursor: 'pointer', userSelect: 'none' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="project-card-icon" style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(167,139,250,0.2))',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Film size={20} color="var(--accent-indigo)" />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge status={project.status} />
          {(onArchive || onRestore) && (
            <button
              onClick={project.isArchived ? handleRestore : handleArchive}
              className="project-card-archive-btn"
              style={{
                padding: 8,
                borderRadius: 6,
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                color: project.isArchived ? 'var(--accent-green)' : 'var(--text-muted)',
                transition: 'all 0.2s',
                minWidth: 36,
                minHeight: 36,
              }}
              title={project.isArchived ? 'Restore project' : 'Archive project'}
            >
              {project.isArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="project-card-title" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
        {project.title}
      </h3>
      {project.description && (
        <p className="project-card-desc" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>
      )}

      <hr className="divider" />

      {/* Meta */}
      <div className="project-card-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="project-card-meta-left" style={{ display: 'flex', gap: 12 }}>
          <span className="project-card-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
            <DollarSign size={13} />
            {project.price > 0 ? `$${project.price.toLocaleString()}` : 'TBD'}
          </span>
          <span className="project-card-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
            <Clock size={13} />
            {timeAgo(project.updatedAt)}
          </span>
        </div>
        <div className="project-card-arrow" style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}>
          <ArrowRight size={14} color="var(--accent-indigo)" />
        </div>
      </div>

      {/* Client chip (admin view) */}
      {project.client?.name && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="project-card-client-avatar" style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff'
          }}>
            {project.client.name[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.client.name}</span>
        </div>
      )}
    </motion.div>
  );
}
