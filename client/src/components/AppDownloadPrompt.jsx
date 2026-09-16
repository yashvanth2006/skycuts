import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const APP_DOWNLOAD_CONFIG = {
  androidUrl: import.meta.env.VITE_ANDROID_APP_URL || '#',
  iosUrl: import.meta.env.VITE_IOS_APP_URL || '',
  delay: 3000,
  reminderDays: 7
};

export default function AppDownloadPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, platform: 'desktop' });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Check dismissal state
    const checkDismissal = () => {
      try {
        const dismissedStr = localStorage.getItem('skyCutsAppPromptDismissed');
        if (dismissedStr) {
          const dismissedAt = new Date(dismissedStr).getTime();
          const now = new Date().getTime();
          const daysSinceDismissed = (now - dismissedAt) / (1000 * 3600 * 24);
          if (daysSinceDismissed < APP_DOWNLOAD_CONFIG.reminderDays) {
            return true;
          }
        }
      } catch (e) {
        // ignore localstorage errors
      }
      return false;
    };

    if (checkDismissal()) return;

    // Detect device
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    let platform = 'desktop';
    let isMobile = false;

    if (/android/i.test(ua)) {
      platform = 'android';
      isMobile = true;
    } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      platform = 'ios';
      isMobile = true;
    } else if (/Mobile/.test(ua)) {
      isMobile = true;
    }

    // Treat narrow screens as mobile layout even if UA isn't strictly mobile
    if (window.innerWidth < 768) {
      isMobile = true;
    }

    setDeviceInfo({ isMobile, platform });

    // PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, APP_DOWNLOAD_CONFIG.delay);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('skyCutsAppPromptDismissed', new Date().toISOString());
    } catch (e) {
      // ignore
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        handleDismiss();
      }
      setDeferredPrompt(null);
    } else {
      // Redirect to store
      if (deviceInfo.platform === 'android' && APP_DOWNLOAD_CONFIG.androidUrl) {
        window.open(APP_DOWNLOAD_CONFIG.androidUrl, '_blank', 'noopener,noreferrer');
      } else if (deviceInfo.platform === 'ios' && APP_DOWNLOAD_CONFIG.iosUrl) {
        window.open(APP_DOWNLOAD_CONFIG.iosUrl, '_blank', 'noopener,noreferrer');
      } else if (APP_DOWNLOAD_CONFIG.androidUrl) {
        // Fallback for desktop or unknown
        window.open(APP_DOWNLOAD_CONFIG.androidUrl, '_blank', 'noopener,noreferrer');
      }
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  // Contextual messaging
  let message = "Manage your projects faster on mobile.";
  if (user) {
    if (user.role === 'client') {
      message = "Manage your projects from anywhere.";
    } else if (user.role === 'admin' || user.role === 'editor') {
      message = "Manage your projects and deliverables on the go.";
    }
  }

  // App store labels
  let installLabel = "Get the App";
  const isIosPwaFallback = deviceInfo.platform === 'ios' && !deferredPrompt && !APP_DOWNLOAD_CONFIG.iosUrl;

  if (deferredPrompt) {
    installLabel = "Install SkyCuts";
  } else if (isIosPwaFallback) {
    installLabel = "Install SkyCuts";
  } else if (deviceInfo.platform === 'android') {
    installLabel = "Get it on Google Play";
  } else if (deviceInfo.platform === 'ios') {
    installLabel = "Download on App Store";
  }

  // Mobile Bottom Sheet
  if (deviceInfo.isMobile) {
    return (
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
              onClick={handleDismiss}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative pointer-events-auto bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-[var(--radius-xl)] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-glow-md)] w-full max-w-md mx-auto flex flex-col items-center text-center"
            >
              <div className="w-12 h-1.5 bg-[var(--border-subtle)] rounded-full mb-6" />
              
              <div className="w-16 h-16 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex items-center justify-center shadow-[var(--shadow-glow-sm)] mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-red)]/20 to-transparent pointer-events-none" />
                <span className="text-2xl font-display font-bold gradient-text tracking-tighter">SC</span>
              </div>
              
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
                Get the SkyCuts App
              </h2>
              
              <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed max-w-[280px]">
                {message}
              </p>
              
              <div className="w-full space-y-3">
                {isIosPwaFallback ? (
                  <div className="flex flex-col items-center gap-2 mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border)]">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Install SkyCuts</p>
                    <p className="text-xs text-[var(--text-secondary)] text-center">
                      Tap <span className="font-semibold text-[var(--text-primary)]">Share</span> below, then select <span className="font-semibold text-[var(--text-primary)]">Add to Home Screen</span>.
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={handleInstall}
                    className="w-full btn-primary"
                  >
                    <Smartphone className="w-4 h-4 shrink-0" />
                    {installLabel}
                  </button>
                )}
                <button 
                  onClick={handleDismiss}
                  className="w-full btn-ghost"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Banner
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[9999] w-[320px] bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-glow-sm)] p-4 pr-10 flex flex-col"
        >
          <button 
            onClick={handleDismiss}
            aria-label="Close"
            className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 shrink-0 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-red)]/20 to-transparent pointer-events-none" />
               <span className="text-sm font-display font-bold gradient-text tracking-tighter">SC</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight mb-1">SkyCuts on mobile</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-tight">{message}</p>
            </div>
          </div>
          
          {isIosPwaFallback ? (
             <div className="text-xs text-center text-[var(--text-secondary)] p-2 bg-[var(--bg-surface)] rounded border border-[var(--border)] mt-2">
                Tap <b className="text-[var(--text-primary)]">Share</b> → <b className="text-[var(--text-primary)]">Add to Home Screen</b>
             </div>
          ) : (
            <button 
              onClick={handleInstall}
              className="btn-primary w-full py-2 min-h-0 text-[13px]"
            >
              {installLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
