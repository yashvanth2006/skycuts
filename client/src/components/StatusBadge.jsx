import { motion } from 'framer-motion';

const statusConfig = {
  awaiting_assets: { label: 'Awaiting Assets', cls: 'badge-awaiting', dot: '#fbbf24' },
  AWAITING_ASSETS: { label: 'Awaiting Assets', cls: 'badge-awaiting', dot: '#fbbf24' },
  in_progress:     { label: 'In Progress',      cls: 'badge-progress', dot: '#818cf8' },
  IN_PROGRESS:     { label: 'In Progress',      cls: 'badge-progress', dot: '#818cf8' },
  in_review:       { label: 'In Review',         cls: 'badge-review',   dot: '#c084fc' },
  REVIEW:          { label: 'In Review',         cls: 'badge-review',   dot: '#c084fc' },
  COMPLETED:       { label: 'Completed',         cls: 'badge-paid',     dot: '#34d399' },
  paid:            { label: 'Paid ✓',            cls: 'badge-paid',     dot: '#34d399' },
  PAID:            { label: 'Paid ✓',            cls: 'badge-paid',     dot: '#34d399' },
  DELIVERED:       { label: 'Delivered ✓',       cls: 'badge-paid',     dot: '#34d399' },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { label: status, cls: 'badge-progress', dot: '#818cf8' };
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot,
        boxShadow: `0 0 6px ${cfg.dot}`,
        display: 'inline-block'
      }} />
      {cfg.label}
    </span>
  );
}
