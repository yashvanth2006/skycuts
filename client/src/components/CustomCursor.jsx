import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer') ||
        target.style.cursor === 'pointer';
      
      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      {/* Outer ring cursor */}
      <motion.div
        ref={cursorRef}
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? '#2F74D0' : 'rgba(255, 255, 255, 0.3)',
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
        }}
      >
        {/* Inner dot */}
        <motion.div
          animate={{
            scale: isClicking ? 0.5 : 1,
            backgroundColor: isHovering ? '#2F74D0' : '#ffffff',
          }}
          transition={{
            duration: 0.15,
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
          }}
        />
      </motion.div>

      {/* Trailing effect */}
      <motion.div
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
        }}
        transition={{
          type: 'spring',
          stiffness: 80,
          damping: 20,
          mass: 0.3,
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47,116,208,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />

      {/* Click ripple effect */}
      {isClicking && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            top: mousePosition.y - 20,
            left: mousePosition.x - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid #F5A623',
            pointerEvents: 'none',
            zIndex: 9997,
          }}
        />
      )}
    </>
  );
}
