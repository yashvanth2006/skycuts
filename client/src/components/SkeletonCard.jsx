import { motion } from 'framer-motion';

export default function SkeletonCard({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card"
      style={{ padding: '24px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }} />
        <div style={{
          width: 80, height: 24, borderRadius: 100,
          background: 'var(--bg-surface)',
        }} />
      </div>

      {/* Title */}
      <div style={{
        width: '70%', height: 20, borderRadius: 6,
        background: 'var(--bg-surface)', marginBottom: 8,
      }} />
      <div style={{
        width: '90%', height: 14, borderRadius: 4,
        background: 'var(--bg-surface)', marginBottom: 6,
      }} />
      <div style={{
        width: '60%', height: 14, borderRadius: 4,
        background: 'var(--bg-surface)', marginBottom: 16,
      }} />

      {/* Divider */}
      <div style={{
        height: 1, background: 'var(--border-subtle)',
        marginBottom: 16,
      }} />

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{
            width: 60, height: 14, borderRadius: 4,
            background: 'var(--bg-surface)',
          }} />
          <div style={{
            width: 50, height: 14, borderRadius: 4,
            background: 'var(--bg-surface)',
          }} />
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--bg-surface)',
        }} />
      </div>
    </motion.div>
  );
}
