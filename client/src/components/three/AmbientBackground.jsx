import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ─── Distorted Glowing Sphere ───────────────────────────────────────────────
function AmbientSphere({ position, color, speed, distort, radius }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * speed * 0.3;
      meshRef.current.rotation.y = clock.getElapsedTime() * speed * 0.5;
    }
  });

  return (
    <Sphere ref={meshRef} args={[radius, 64, 64]} position={position}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={distort}
        speed={1.5}
        roughness={0.15}
        metalness={0.8}
        transparent
        opacity={0.25}
      />
    </Sphere>
  );
}

// ─── Floating Particles ──────────────────────────────────────────────────────
function Particles({ count = 120 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.04;
      mesh.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6366f1"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function AmbientBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none'
    }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[4, 4, 4]} intensity={1.5} color="#6366f1" />
        <pointLight position={[-4, -2, -4]} intensity={1} color="#a78bfa" />

        <AmbientSphere
          position={[-3.5, 1.5, -2]}
          color="#6366f1"
          speed={0.4}
          distort={0.55}
          radius={2.2}
        />
        <AmbientSphere
          position={[3.8, -1.8, -3]}
          color="#a78bfa"
          speed={0.3}
          distort={0.45}
          radius={1.6}
        />
        <AmbientSphere
          position={[0.5, 3, -4]}
          color="#22d3ee"
          speed={0.5}
          distort={0.6}
          radius={1}
        />

        <Particles count={150} />
        <Stars radius={60} depth={30} count={800} factor={3} fade speed={0.5} />
      </Canvas>
    </div>
  );
}
