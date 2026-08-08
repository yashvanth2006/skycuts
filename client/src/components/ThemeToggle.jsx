import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, MousePointer2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme, customCursor, toggleCustomCursor } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <motion.button
        onClick={toggleCustomCursor}
        aria-label={customCursor ? 'Disable custom cursor' : 'Enable custom cursor'}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: customCursor ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
          background: customCursor ? 'rgba(47,116,208,0.1)' : 'var(--bg-glass)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'border-color 0.3s ease, background 0.3s ease',
        }}
      >
        <MousePointer2 size={17} color={customCursor ? 'var(--accent-blue)' : 'var(--text-muted)'} strokeWidth={2} />
      </motion.button>
      
      <motion.button
        id="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
          boxShadow: isDark
            ? '0 0 12px rgba(99,102,241,0.2)'
            : '0 0 12px rgba(251,191,36,0.25)',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{    rotate: 90,  opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Moon size={17} color="var(--accent-indigo)" strokeWidth={2} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90,  opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{    rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Sun size={17} color="#f59e0b" strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
