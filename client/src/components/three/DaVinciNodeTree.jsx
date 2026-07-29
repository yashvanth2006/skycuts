import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- Individual glowing node sphere ---
function Node({ position, color, pulseOffset, radius = 0.08 }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + pulseOffset;
    const pulse = 0.7 + 0.3 * Math.sin(t * 1.8);
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = pulse * 1.2;
      meshRef.current.scale.setScalar(0.85 + 0.15 * pulse);
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + 0.08 * pulse;
      glowRef.current.scale.setScalar(1.5 + 0.4 * pulse);
    }
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 3, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

// --- Wireframe connection line between two nodes ---
function ConnectionLine({ start, end, color, opacity = 0.35, curveOffset }) {
  const lineRef = useRef();
  const geometry = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    mid.x += curveOffset[0];
    mid.y += curveOffset[1];
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    const points = curve.getPoints(24);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      const t = clock.getElapsedTime();
      lineRef.current.material.opacity = opacity * (0.45 + 0.55 * Math.sin(t * 0.9 + start[0]));
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

// --- Color Grading Wheel Ring ---
function GradingWheelRing({ radius, tubeRadius, rotX, rotZ, color, speed, opacity = 0.25 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * speed;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[rotX, 0, rotZ]}>
        <torusGeometry args={[radius, tubeRadius, 12, 80]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.9} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

// --- Subtle grid floor ---
function GridFloor() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.06 + 0.02 * Math.sin(clock.getElapsedTime() * 0.5);
    }
  });
  const gridPositions = useMemo(() => {
    const lines = [];
    const size = 6;
    const step = 0.7;
    for (let x = -size; x <= size; x += step) {
      lines.push(x, -size, 0, x, size, 0);
    }
    for (let y = -size; y <= size; y += step) {
      lines.push(-size, y, 0, size, y, 0);
    }
    return new Float32Array(lines);
  }, []);
  return (
    <lineSegments ref={ref} rotation={[Math.PI / 2.2, 0, 0]} position={[0, -1.8, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[gridPositions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#2F74D0" transparent opacity={0.08} />
    </lineSegments>
  );
}

// --- Full Node Graph Scene ---
function NodeGraphScene() {
  const groupRef = useRef();

  const nodes = useMemo(() => [
    { pos: [0, 0, 0],        color: "#F5A623", pulse: 0,   r: 0.13 },
    { pos: [-2.2, 0.6, -0.3], color: "#2F74D0", pulse: 1.1, r: 0.09 },
    { pos: [2.1, 0.4, 0.2],   color: "#2F74D0", pulse: 2.2, r: 0.09 },
    { pos: [0.1, 1.8, -0.4],  color: "#2F74D0", pulse: 0.7, r: 0.09 },
    { pos: [-0.2, -1.7, 0.1], color: "#2F74D0", pulse: 3.1, r: 0.09 },
    { pos: [-3.4, 1.8, -0.6], color: "#4A9EFF", pulse: 1.5, r: 0.065 },
    { pos: [-3.2, -0.6, 0.3], color: "#4A9EFF", pulse: 2.8, r: 0.065 },
    { pos: [3.2, 1.6, -0.2],  color: "#4A9EFF", pulse: 0.3, r: 0.065 },
    { pos: [3.0, -1.0, 0.4],  color: "#4A9EFF", pulse: 1.9, r: 0.065 },
    { pos: [0.8, 2.8, -0.5],  color: "#F5A623", pulse: 2.4, r: 0.06 },
    { pos: [-0.9, 2.6, 0.2],  color: "#4A9EFF", pulse: 0.9, r: 0.055 },
    { pos: [1.2, -2.5, 0.3],  color: "#4A9EFF", pulse: 3.5, r: 0.055 },
    { pos: [-1.4, -2.3, -0.3],color: "#F5A623", pulse: 1.2, r: 0.06 },
    { pos: [-4.2, 0.2, 0.5],  color: "#1a4a7a", pulse: 2.0, r: 0.045 },
    { pos: [4.0, 0.0, -0.4],  color: "#1a4a7a", pulse: 0.6, r: 0.045 },
    { pos: [1.8, -1.4, -0.5], color: "#4A9EFF", pulse: 1.7, r: 0.055 },
    { pos: [-1.6, 1.4, 0.4],  color: "#4A9EFF", pulse: 3.0, r: 0.055 },
  ], []);

  const connections = useMemo(() => [
    { a: 0, b: 1,  co: [-0.2, 0.3],  isAmber: false },
    { a: 0, b: 2,  co: [0.2, 0.3],   isAmber: false },
    { a: 0, b: 3,  co: [0.1, 0.4],   isAmber: true  },
    { a: 0, b: 4,  co: [-0.1, -0.4], isAmber: false },
    { a: 1, b: 5,  co: [-0.3, 0.2],  isAmber: false },
    { a: 1, b: 6,  co: [-0.2, -0.2], isAmber: false },
    { a: 1, b: 16, co: [0.1, 0.2],   isAmber: false },
    { a: 2, b: 7,  co: [0.3, 0.2],   isAmber: false },
    { a: 2, b: 8,  co: [0.2, -0.2],  isAmber: false },
    { a: 2, b: 15, co: [-0.1, -0.2], isAmber: false },
    { a: 3, b: 9,  co: [0.2, 0.3],   isAmber: true  },
    { a: 3, b: 10, co: [-0.2, 0.3],  isAmber: false },
    { a: 4, b: 11, co: [0.2, -0.3],  isAmber: false },
    { a: 4, b: 12, co: [-0.2, -0.3], isAmber: true  },
    { a: 5, b: 13, co: [-0.2, 0.2],  isAmber: false },
    { a: 7, b: 14, co: [0.2, 0.2],   isAmber: false },
    { a: 9, b: 10, co: [-0.1, 0.2],  isAmber: false },
    { a: 11,b: 15, co: [0.1, -0.2],  isAmber: false },
    { a: 6, b: 12, co: [-0.1, -0.3], isAmber: false },
  ], []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.07;
      groupRef.current.rotation.y = t;
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {connections.map(({ a, b, co, isAmber }, i) => (
        <ConnectionLine
          key={i}
          start={nodes[a].pos}
          end={nodes[b].pos}
          curveOffset={co}
          color={isAmber ? "#F5A623" : "#2F74D0"}
          opacity={isAmber ? 0.5 : 0.28}
        />
      ))}
      {nodes.map((n, i) => (
        <Node key={i} position={n.pos} color={n.color} pulseOffset={n.pulse} radius={n.r} />
      ))}
    </group>
  );
}

// --- Main export ---
export default function DaVinciNodeTree() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 5]}  intensity={2.5} color="#2F74D0" />
      <pointLight position={[-4, 3, 2]} intensity={1.5} color="#F5A623" />
      <pointLight position={[4, -3, 2]} intensity={1.2} color="#4A9EFF" />
      <pointLight position={[0, 5, 0]}  intensity={0.8} color="#ffffff" />

      <GradingWheelRing radius={4.8} tubeRadius={0.008} rotX={Math.PI / 2.5} rotZ={0}            color="#2F74D0" speed={0.04}  opacity={0.18} />
      <GradingWheelRing radius={5.5} tubeRadius={0.006} rotX={Math.PI / 3}   rotZ={Math.PI / 5} color="#F5A623" speed={-0.03} opacity={0.12} />
      <GradingWheelRing radius={6.2} tubeRadius={0.005} rotX={Math.PI / 4}   rotZ={Math.PI / 3} color="#2F74D0" speed={0.025} opacity={0.08} />

      <NodeGraphScene />
      <GridFloor />
    </Canvas>
  );
}
