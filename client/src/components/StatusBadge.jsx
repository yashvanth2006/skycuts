import { motion } from 'framer-motion';

const statusConfig = {
  awaiting_assets: { label: 'Awaiting Assets', cls: 'badge-awaiting', dot: '#FBBF24' },
  AWAITING_ASSETS: { label: 'Awaiting Assets', cls: 'badge-awaiting', dot: '#FBBF24' },
  in_progress:     { label: 'In Progress',      cls: 'badge-progress', dot: '#60A5FA' },
  IN_PROGRESS:     { label: 'In Progress',      cls: 'badge-progress', dot: '#60A5FA' },
  in_review:       { label: 'In Review',         cls: 'badge-review',   dot: '#A78BFA' },
  REVIEW:          { label: 'In Review',         cls: 'badge-review',   dot: '#A78BFA' },
  COMPLETED:       { label: 'Completed',         cls: 'badge-delivered', dot: '#4ADE80' },
  paid:            { label: 'Paid ✓',            cls: 'badge-paid',     dot: '#EF4444' },
  PAID:            { label: 'Paid ✓',            cls: 'badge-paid',     dot: '#EF4444' },
  delivered:       { label: 'Delivered ✓',       cls: 'badge-delivered', dot: '#4ADE80' },
  DELIVERED:       { label: 'Delivered ✓',       cls: 'badge-delivered', dot: '#4ADE80' },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { label: status, cls: 'badge-progress', dot: '#60A5FA' };
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}
