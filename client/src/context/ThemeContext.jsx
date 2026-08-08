import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

// Resolve initial theme: saved preference → system preference → 'dark'
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('skycuts_theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* ignore */ }
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

// Resolve initial custom cursor preference
function getInitialCustomCursor() {
  try {
    const saved = localStorage.getItem('skycuts_custom_cursor');
    return saved === 'true';
  } catch { /* ignore */ }
  return false;
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [customCursor, setCustomCursor] = useState(getInitialCustomCursor);

  // Apply class to <html> and persist whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    try {
      localStorage.setItem('skycuts_theme', theme);
    } catch { /* ignore */ }
  }, [theme]);

  // Persist custom cursor preference
  useEffect(() => {
    try {
      localStorage.setItem('skycuts_custom_cursor', customCursor.toString());
    } catch { /* ignore */ }
  }, [customCursor]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleCustomCursor = useCallback(() => {
    setCustomCursor(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, customCursor, toggleCustomCursor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
