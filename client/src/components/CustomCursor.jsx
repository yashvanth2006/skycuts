import { useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

// Linear interpolation for smooth following
const lerp = (start, end, factor) => start + (end - start) * factor;

export default function CustomCursor() {
  const { customCursor } = useTheme();
  const cursorRef = useRef(null);
  const outerCursorRef = useRef(null);
  const trailRef = useRef(null);
  
  // Motion values for smooth animation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring-configured motion values for outer cursor (slower, more lag)
  const outerX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.5 });
  const outerY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.5 });
  
  // Even slower for trail effect
  const trailX = useSpring(mouseX, { stiffness: 80, damping: 25, mass: 0.8 });
  const trailY = useSpring(mouseY, { stiffness: 80, damping: 25, mass: 0.8 });
  
  // Scale transform for hover state
  const scale = useTransform(mouseX, [0, 1], [1, 1.5]);
  
  // Refs for tracking state without re-renders
  const stateRef = useRef({
    isHovering: false,
    isClicking: false,
    magnetic: { x: 0, y: 0 },
    currentX: 0,
    currentY: 0,
  });
  
  // Check for touch device
  const isTouchDevice = useRef(
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
  
  // Check for reduced motion preference
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  // Don't render cursor if:
  // - Custom cursor is disabled
  // - Touch device detected
  // - User prefers reduced motion
  if (!customCursor || isTouchDevice.current || prefersReducedMotion.current) {
    return null;
  }
  
  // Update mouse position using requestAnimationFrame for performance
  useEffect(() => {
    let rafId = null;
    
    const updateMousePosition = (e) => {
      rafId = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        stateRef.current.currentX = e.clientX;
        stateRef.current.currentY = e.clientY;
      });
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [mouseX, mouseY]);
  
  // Hover detection with magnetic effect
  const handleMouseOver = useCallback((e) => {
    const target = e.target;
    const isInteractive = 
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]') ||
      target.classList.contains('cursor-pointer') ||
      target.style.cursor === 'pointer' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('[role="slider"]') ||
      target.closest('.interactive');
    
    stateRef.current.isHovering = isInteractive;
    
    // Magnetic effect for buttons and links
    if (isInteractive && (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a'))) {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const magneticStrength = 0.3;
      
      stateRef.current.magnetic = {
        x: (centerX - stateRef.current.currentX) * magneticStrength,
        y: (centerY - stateRef.current.currentY) * magneticStrength,
      };
    } else {
      stateRef.current.magnetic = { x: 0, y: 0 };
    }
  }, []);
  
  const handleMouseOut = useCallback(() => {
    stateRef.current.isHovering = false;
    stateRef.current.magnetic = { x: 0, y: 0 };
  }, []);
  
  const handleMouseDown = useCallback(() => {
    stateRef.current.isClicking = true;
  }, []);
  
  const handleMouseUp = useCallback(() => {
    stateRef.current.isClicking = false;
  }, []);
  
  useEffect(() => {
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseOver, handleMouseOut, handleMouseDown, handleMouseUp]);
  
  // Hide default cursor when custom cursor is active
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  return (
    <>
      {/* Subtle trail effect */}
      <motion.div
        ref={trailRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9998,
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      
      {/* Outer cursor ring */}
      <motion.div
        ref={outerCursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: stateRef.current.isHovering ? 48 : 32,
          height: stateRef.current.isHovering ? 48 : 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(255, 255, 255, 0.4)',
          pointerEvents: 'none',
          zIndex: 9999,
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
          scale: stateRef.current.isClicking ? 0.85 : 1,
          transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease',
          borderColor: stateRef.current.isHovering ? 'rgba(99, 102, 241, 0.8)' : 'rgba(255, 255, 255, 0.4)',
        }}
      />
      
      {/* Inner cursor dot */}
      <motion.div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: stateRef.current.isHovering ? 6 : 4,
          height: stateRef.current.isHovering ? 6 : 4,
          borderRadius: '50%',
          background: stateRef.current.isHovering ? '#6366f1' : '#ffffff',
          pointerEvents: 'none',
          zIndex: 10000,
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          scale: stateRef.current.isClicking ? 0.5 : 1,
          transition: 'background-color 0.2s ease',
        }}
      />
      
      {/* Click ripple effect */}
      {stateRef.current.isClicking && (
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: mouseY.get(),
            left: mouseX.get(),
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            pointerEvents: 'none',
            zIndex: 9997,
            translateX: '-50%',
            translateY: '-50%',
          }}
        />
      )}
    </>
  );
}
