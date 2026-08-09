import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Icosahedron, Torus, Box, MeshWobbleMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';

// ─── Central core — distorted icosahedron ──────────────────────────────────
function Core() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.18;
      ref.current.rotation.y = clock.getElapsedTime() * 0.28;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <Icosahedron ref={ref} args={[1, 1]}>
        <MeshDistortMaterial
          color="#6366f1"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.92}
        />
      </Icosahedron>
    </Float>
  );
}

// ─── Orbiting torus ring ───────────────────────────────────────────────────
function OrbitingTorus({ radius, speed, rotX, rotZ, color, thickness }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * speed;
    }
  });
  return (
    <group ref={ref}>
      <Torus
        args={[radius, thickness, 16, 80]}
        rotation={[rotX, 0, rotZ]}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.05}
          metalness={1}
          transparent
          opacity={0.55}
          wireframe={false}
        />
      </Torus>
    </group>
  );
}

// ─── Small floating shard boxes ────────────────────────────────────────────
function Shard({ position, color, scale, speedX, speedY }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.x = t * speedX;
      ref.current.rotation.y = t * speedY;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.2}>
      <Box ref={ref} args={[scale, scale, scale]} position={position}>
        <MeshWobbleMaterial
          color={color}
          factor={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.7}
        />
      </Box>
    </Float>
  );
}

// ─── Wireframe outer shell ─────────────────────────────────────────────────
function WireShell() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * -0.1;
      ref.current.rotation.y = clock.getElapsedTime() * 0.14;
    }
  });
  return (
    <Icosahedron ref={ref} args={[2.2, 1]}>
      <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.12} />
    </Icosahedron>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────
function Scene({ isLight, isMobile }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={isLight ? 0.8 : 0.25} />
      <pointLight position={[4, 3, 4]}   intensity={isLight ? 2 : 3}   color="#6366f1" />
      <pointLight position={[-4, -2, -3]} intensity={isLight ? 1.5 : 2} color="#a78bfa" />
      <pointLight position={[0, 4, 0]}   intensity={isLight ? 1 : 1.5} color="#22d3ee" />

      {/* Core */}
      <Core />

      {/* Wireframe outer shell */}
      <WireShell />

      {/* Orbiting torus rings */}
      {!isMobile && (
        <>
          <OrbitingTorus radius={1.9} thickness={0.025} speed={0.5}  rotX={Math.PI / 3} rotZ={0}            color="#818cf8" />
          <OrbitingTorus radius={2.1} thickness={0.018} speed={-0.35} rotX={Math.PI / 6} rotZ={Math.PI / 4} color="#22d3ee" />
          <OrbitingTorus radius={1.7} thickness={0.02}  speed={0.6}  rotX={0}           rotZ={Math.PI / 3}  color="#c084fc" />
        </>
      )}

      {/* Floating shards */}
      {!isMobile && (
        <>
          <Shard position={[ 2.4,  0.8, 0.5]} color="#818cf8" scale={0.16} speedX={0.6} speedY={0.9} />
          <Shard position={[-2.2,  1.0, 0.3]} color="#22d3ee" scale={0.13} speedX={0.8} speedY={0.5} />
          <Shard position={[ 1.6, -1.6, 0.2]} color="#c084fc" scale={0.18} speedX={0.5} speedY={0.7} />
          <Shard position={[-1.8, -1.4, 0.6]} color="#6366f1" scale={0.12} speedX={1.0} speedY={0.4} />
          <Shard position={[ 0.4,  2.4, 0.4]} color="#34d399" scale={0.11} speedX={0.7} speedY={0.8} />
          <Shard position={[-0.3, -2.6, 0.2]} color="#818cf8" scale={0.14} speedX={0.4} speedY={1.1} />
        </>
      )}
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────
export default function Processing3DPlaceholder({ label, subLabel }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isMobile = window.innerWidth < 768;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        aspectRatio: '16/9',
        position: 'relative',
        overflow: 'hidden',
        background: isLight
          ? 'radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.08) 0%, rgba(248,250,252,0.9) 70%)'
          : 'radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.18) 0%, rgba(5,5,8,0.95) 70%)',
        transition: 'background 0.5s ease',
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, isMobile ? 7 : 5.5], fov: 52 }}
        gl={{ antialias: !isMobile, alpha: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene isLight={isLight} isMobile={isMobile} />
      </Canvas>

      {/* Text overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        paddingBottom: isMobile ? 20 : 28, gap: 4,
        pointerEvents: 'none',
      }}>
        <p style={{
          fontSize: isMobile ? 11 : 13, fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: isLight ? 'rgba(30,30,46,0.7)' : 'rgba(240,240,248,0.6)',
          fontFamily: 'var(--font-display)',
          textShadow: isLight ? 'none' : '0 0 20px rgba(99,102,241,0.4)',
        }}>
          {label || 'Deliverable Processing'}
        </p>
        {subLabel && (
          <p style={{
            fontSize: isMobile ? 10 : 11, color: isLight ? 'rgba(74,74,110,0.6)' : 'rgba(136,136,170,0.7)',
            letterSpacing: '0.03em',
          }}>
            {subLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
