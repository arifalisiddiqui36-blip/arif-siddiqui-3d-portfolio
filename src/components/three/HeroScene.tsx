"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  coreFragment,
  coreVertex,
  particleFragment,
  particleVertex,
} from "./shaders";

// Raw sRGB values: these shaders write straight to the canvas without a
// colour-space conversion, so we skip THREE.Color's linearisation.
const srgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const VIOLET = srgb("#8B5CF6");
const SKY = srgb("#38BDF8");
const DEEP = srgb("#0a0812");

type SceneProps = { ready: boolean; tier: "low" | "high"; reduceMotion: boolean };

/* ─────────────── The data core ─────────────── */
function Core({ ready, tier, reduceMotion }: SceneProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const pointerTarget = useRef(new THREE.Vector3(0, 0, 1));
  const strengthTarget = useRef(0);

  // Built imperatively so the uniforms we mutate each frame are guaranteed
  // to be the ones bound to the compiled program.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coreVertex,
        fragmentShader: coreFragment,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: 0.26 },
          uPointer: { value: new THREE.Vector3(0, 0, 1) },
          uPointerStrength: { value: 0 },
          uViolet: { value: VIOLET },
          uSky: { value: SKY },
          uDeep: { value: DEEP },
          uIntro: { value: 0 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  const detail = tier === "high" ? 40 : 18;
  const readyAt = useRef<number | null>(null);

  useFrame((state, delta) => {
    const uniforms = material.uniforms;
    const d = Math.min(delta, 0.05);
    const speed = reduceMotion ? 0.15 : 1;
    uniforms.uTime.value += d * speed;
    // Intro is clock-based so it completes on time even at low frame rates.
    const now = state.clock.elapsedTime;
    if (ready && readyAt.current === null) readyAt.current = now;
    const k = readyAt.current === null ? 0 : Math.min((now - readyAt.current) / 1.6, 1);
    const eased = 1 - Math.pow(1 - k, 3);
    uniforms.uIntro.value = 0.08 + eased * 0.92;
    uniforms.uPointer.value.lerp(pointerTarget.current, 0.12).normalize();
    uniforms.uPointerStrength.value = THREE.MathUtils.damp(
      uniforms.uPointerStrength.value,
      strengthTarget.current,
      4,
      d,
    );
    if (group.current) {
      group.current.scale.setScalar(0.55 + eased * 0.45);
      group.current.rotation.y += d * 0.08 * speed;
    }
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!mesh.current) return;
    const local = mesh.current.worldToLocal(e.point.clone()).normalize();
    pointerTarget.current.copy(local);
    strengthTarget.current = -1; // negative = push surface inward
  };

  return (
    <group ref={group} scale={0.55}>
      <mesh
        ref={mesh}
        onPointerMove={onMove}
        onPointerOut={() => (strengthTarget.current = 0)}
      >
        <icosahedronGeometry args={[1.32, detail]} />
        <primitive object={material} attach="material" />
      </mesh>
      <WireShell />
    </group>
  );
}

/* A faceted lattice orbiting the core, like a satellite frame. */
function WireShell() {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.05, 1)),
    [],
  );
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.y -= d * 0.05;
    ref.current.rotation.x += d * 0.02;
  });
  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color="#a78bfa" transparent opacity={0.12} />
    </lineSegments>
  );
}

/* ─────────────── Orbit rings with travelling packets ─────────────── */
function Orbit({
  radius,
  tilt,
  speed,
  color,
}: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: string;
}) {
  const packet = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (packet.current) packet.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    if (trail.current) trail.current.rotation.z = -t;
  });
  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.004, 8, 200]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} />
      </mesh>
      <mesh ref={packet}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#F8FAFC" />
      </mesh>
      {/* Bright arc that follows the packet */}
      <mesh ref={trail} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.012, 8, 64, Math.PI / 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/* ─────────────── Particle field ─────────────── */
function Particles({ count, speedScale }: { count: number; speedScale: number }) {
  const { gl } = useThree();
  const { positions, scales, speeds, mixes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const mixes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // 70% in a flattened disc (an accretion ring), 30% in a loose shell.
      const ring = i < count * 0.7;
      const r = ring ? 2.6 + Math.random() * 2.6 : 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = ring ? Math.PI / 2 + (Math.random() - 0.5) * 0.35 : Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      scales[i] = 0.4 + Math.random() * 1.2;
      speeds[i] = (ring ? 0.05 : 0.015) * (0.6 + Math.random() * 0.8) * (5 / r);
      mixes[i] = Math.random();
    }
    return { positions, scales, speeds, mixes };
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 38 },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          uViolet: { value: VIOLET },
          uSky: { value: SKY },
          uOpacity: { value: 0.9 },
        },
      }),
    [gl],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, d) => {
    material.uniforms.uTime.value += Math.min(d, 0.05) * speedScale;
  });

  return (
    <points rotation={[0.32, 0, -0.18]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aMix" args={[mixes, 1]} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

/* Soft volumetric glow behind the core. */
function Halo() {
  const uniforms = useMemo(() => ({ uViolet: { value: VIOLET }, uSky: { value: SKY } }), []);
  return (
    <mesh position={[0, 0, -1.6]} renderOrder={-1}>
      <planeGeometry args={[12, 12]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`uniform vec3 uViolet; uniform vec3 uSky; varying vec2 vUv;
          void main(){ vec2 p = vUv - 0.5; float d = length(p);
            float g = smoothstep(0.5, 0.0, d); g = pow(g, 2.6);
            vec3 c = mix(uViolet, uSky, smoothstep(-0.3, 0.4, p.x + p.y));
            gl_FragColor = vec4(c * g * 0.55, g); }`}
      />
    </mesh>
  );
}

/* Mouse parallax: the camera drifts opposite to the pointer. */
function CameraRig({ reduceMotion }: { reduceMotion: boolean }) {
  const { camera, size } = useThree();
  useEffect(() => {
    // Pull back on narrow screens so the core still fits.
    const z = size.width < 768 ? 8.2 : 6.4;
    camera.position.z = z;
  }, [camera, size.width]);
  useFrame((state, d) => {
    if (reduceMotion) return;
    const { x, y } = state.pointer;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, x * 0.6, 2.5, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y * 0.4, 2.5, d);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({
  ready,
  tier,
  reduceMotion,
  active,
}: SceneProps & { active: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: tier === "high", alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      aria-hidden
    >
      <Halo />
      <group position={[0, 0, 0]}>
        <Core ready={ready} tier={tier} reduceMotion={reduceMotion} />
        <Orbit radius={2.45} tilt={[0.5, 0, 0.3]} speed={0.45} color="#8B5CF6" />
        <Orbit radius={2.8} tilt={[-0.35, 0.4, -0.5]} speed={-0.3} color="#38BDF8" />
        <Particles count={tier === "high" ? 2600 : 900} speedScale={reduceMotion ? 0.15 : 1} />
      </group>
      <CameraRig reduceMotion={reduceMotion} />
    </Canvas>
  );
}
