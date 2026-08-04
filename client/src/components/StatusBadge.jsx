import { motion } from 'framer-motion';

const statusConfig = {
  pending:          { label: 'Pending Review',  cls: 'badge-pending',   dot: '#f59e0b' },
  awaiting_assets:  { label: 'Awaiting Assets', cls: 'badge-awaiting', dot: '#fbbf24' },
  in_progress:      { label: 'In Progress',      cls: 'badge-progress', dot: '#818cf8' },
  in_review:        { label: 'In Review',        cls: 'badge-review',   dot: '#c084fc' },
  paid:             { label: 'Paid ✓',           cls: 'badge-paid',     dot: '#34d399' },
  declined:         { label: 'Declined',         cls: 'badge-declined', dot: '#ef4444' },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { label: status, cls: 'badge-progress', dot: '#818cf8' };
  return (
    <motion.span
      className={`badge ${cfg.cls}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: cfg.dot,
          boxShadow: `0 0 6px ${cfg.dot}`,
          display: 'inline-block'
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {cfg.label}
    </motion.span>
  );
}
