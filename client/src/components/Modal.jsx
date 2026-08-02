import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 520 }) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 201,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              className="glass-card"
              initial={{ y: 0 }}
              whileInView={{ y: 0 }}
              style={{
                width: '100%', maxWidth,
                padding: '32px',
                pointerEvents: 'all',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </motion.button>
              </div>
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
