import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Text } from "@react-three/drei";
import * as THREE from "three";
import type { RiskHeatmapData } from "@/lib/kidney-simulation";

interface KidneyVisualizationProps {
  efficiency: number;
  stressIndex: number;
  animated?: boolean;
  riskHeatmap?: RiskHeatmapData;
  size?: "sm" | "md" | "lg";
}

function getHealthColor(value: number): THREE.Color {
  if (value >= 75) return new THREE.Color(0.18, 0.72, 0.45); // green
  if (value >= 50) return new THREE.Color(0.92, 0.65, 0.15); // amber
  return new THREE.Color(0.85, 0.25, 0.25); // red
}

function KidneyModel({ efficiency, stressIndex, riskHeatmap }: {
  efficiency: number;
  stressIndex: number;
  riskHeatmap?: RiskHeatmapData;
}) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const mainColor = useMemo(() => getHealthColor(efficiency), [efficiency]);
  const distortSpeed = useMemo(() => 0.5 + (stressIndex / 100) * 2, [stressIndex]);
  const distortStrength = useMemo(() => 0.05 + (stressIndex / 100) * 0.15, [stressIndex]);

  const cortexColor = useMemo(() => 
    riskHeatmap ? getHealthColor(riskHeatmap.cortex) : mainColor, 
    [riskHeatmap, mainColor]
  );
  const medullaColor = useMemo(() => 
    riskHeatmap ? getHealthColor(riskHeatmap.medulla) : mainColor.clone().multiplyScalar(0.7), 
    [riskHeatmap, mainColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Breathing / heartbeat animation
    const scale = 1 + Math.sin(t * 1.5) * 0.02;
    if (leftRef.current) {
      leftRef.current.scale.setScalar(scale);
      leftRef.current.rotation.z = Math.sin(t * 0.3) * 0.02;
    }
    if (rightRef.current) {
      rightRef.current.scale.setScalar(scale);
      rightRef.current.rotation.z = -Math.sin(t * 0.3) * 0.02;
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 1.5) * 0.04;
    }
  });

  return (
    <group>
      {/* Ambient glow */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color={mainColor} transparent opacity={0.08} />
      </mesh>

      {/* Left Kidney (outer cortex) */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh ref={leftRef} position={[-0.85, 0, 0]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <MeshDistortMaterial
            color={cortexColor}
            roughness={0.3}
            metalness={0.1}
            distort={distortStrength}
            speed={distortSpeed}
            transparent
            opacity={0.7 + efficiency * 0.003}
          />
        </mesh>
      </Float>

      {/* Left kidney inner medulla */}
      <mesh position={[-0.85, 0, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={medullaColor}
          roughness={0.4}
          metalness={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Right Kidney (outer cortex) */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh ref={rightRef} position={[0.85, 0, 0]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <MeshDistortMaterial
            color={cortexColor}
            roughness={0.3}
            metalness={0.1}
            distort={distortStrength}
            speed={distortSpeed}
            transparent
            opacity={0.7 + efficiency * 0.003}
          />
        </mesh>
      </Float>

      {/* Right kidney inner medulla */}
      <mesh position={[0.85, 0, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={medullaColor}
          roughness={0.4}
          metalness={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Ureters */}
      <mesh position={[-0.5, -1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
        <meshStandardMaterial color={mainColor} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0.5, -1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
        <meshStandardMaterial color={mainColor} transparent opacity={0.4} />
      </mesh>

      {/* Aorta (top) */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color={new THREE.Color(0.8, 0.2, 0.2)} transparent opacity={0.5} />
      </mesh>

      {/* Renal arteries */}
      <mesh position={[-0.4, 0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
        <meshStandardMaterial color={new THREE.Color(0.8, 0.2, 0.2)} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0.4, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
        <meshStandardMaterial color={new THREE.Color(0.8, 0.2, 0.2)} transparent opacity={0.4} />
      </mesh>

      {/* Bladder */}
      <Sphere args={[0.25, 16, 16]} position={[0, -1.5, 0]}>
        <meshStandardMaterial color={mainColor} transparent opacity={0.2} />
      </Sphere>

      {/* Particle flow effect */}
      <FlowParticles color={mainColor} efficiency={efficiency} />
    </group>
  );
}

function FlowParticles({ color, efficiency }: { color: THREE.Color; efficiency: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = Math.max(20, Math.round(efficiency * 0.6));
  
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) - 0.005;
      pos.setY(i, y < -1.5 ? 1.5 : y);
      pos.setX(i, pos.getX(i) + Math.sin(t + i) * 0.001);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function KidneyVisualization({
  efficiency,
  stressIndex,
  animated = true,
  riskHeatmap,
  size = "md",
}: KidneyVisualizationProps) {
  const dims = size === "sm" ? "w-40 h-48" : size === "lg" ? "w-72 h-80" : "w-56 h-64";
  
  return (
    <div className={`relative ${dims}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={0.8} />
        <pointLight position={[-3, -2, 3]} intensity={0.4} color="#80d4c0" />
        <Suspense fallback={null}>
          <KidneyModel
            efficiency={efficiency}
            stressIndex={stressIndex}
            riskHeatmap={riskHeatmap}
          />
        </Suspense>
        {animated && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.8}
            maxPolarAngle={Math.PI * 0.7}
            minPolarAngle={Math.PI * 0.3}
          />
        )}
      </Canvas>
      {/* Overlay efficiency */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <span className="text-2xl font-bold font-mono text-foreground drop-shadow-sm">
          {efficiency}%
        </span>
        <span className="text-[10px] text-muted-foreground">Efficiency</span>
      </div>
    </div>
  );
}
