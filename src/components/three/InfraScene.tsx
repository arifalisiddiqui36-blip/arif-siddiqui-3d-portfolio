"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { infraById, type InfraNodeId } from "@/data/infra";

const VIOLET = "#8B5CF6";
const SKY = "#38BDF8";
const BODY = "#16161d";

type Pos = [number, number, number];

/* Layout (x, z on the platform). */
const P: Record<InfraNodeId, Pos> = {
  repo: [-5, 0, -2.6],
  ci: [-5, 0, 0],
  registry: [-5, 0, 2.6],
  lb: [0.4, 0, -2.3],
  ec2a: [1.4, 0, 0.6],
  ec2b: [3.9, 0, 0.6],
  rds: [2.65, 0, 2.9],
  s3: [7.2, 0, 1.8],
  monitor: [7.2, 0, -1.9],
  vpc: [2.15, 0, 0],
};

const LINKS: [InfraNodeId, InfraNodeId, string][] = [
  ["repo", "ci", VIOLET],
  ["ci", "registry", VIOLET],
  ["registry", "ec2a", VIOLET],
  ["registry", "ec2b", VIOLET],
  ["lb", "ec2a", SKY],
  ["lb", "ec2b", SKY],
  ["ec2a", "rds", SKY],
  ["ec2b", "rds", SKY],
  ["ec2a", "s3", SKY],
  ["ec2b", "s3", SKY],
  ["ec2a", "monitor", "#C4B5FD"],
  ["ec2b", "monitor", "#C4B5FD"],
];

type NodeProps = {
  id: InfraNodeId;
  active: InfraNodeId | null;
  setActive: (id: InfraNodeId | null) => void;
  children: React.ReactNode;
  labelY?: number;
};

/** Wraps any component: handles hover, lift, glow and the floating name tag. */
function Node({ id, active, setActive, children, labelY = 1.6 }: NodeProps) {
  const g = useRef<THREE.Group>(null);
  const isActive = active === id;

  useFrame((_, d) => {
    if (!g.current) return;
    const ty = isActive ? 0.25 : 0;
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, ty, 6, d);
    const s = THREE.MathUtils.damp(g.current.scale.x, isActive ? 1.08 : 1, 6, d);
    g.current.scale.setScalar(s);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setActive(id);
  };

  return (
    <group position={[P[id][0], 0, P[id][2]]}>
      <group
        ref={g}
        onPointerOver={over}
        onPointerOut={(e) => {
          e.stopPropagation();
          setActive(null);
        }}
        onClick={over}
      >
        {children}
      </group>
      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.95, 1.0, 48]} />
        <meshBasicMaterial color={isActive ? SKY : VIOLET} transparent opacity={isActive ? 0.9 : 0.18} />
      </mesh>
      {/* Always mounted (toggling Html roots mid-render upsets React 19); fades in when active. */}
      <Html position={[0, labelY + 0.3, 0]} center distanceFactor={9} zIndexRange={[20, 0]}>
        <div
          className="pointer-events-none whitespace-nowrap rounded-full border border-white/15 bg-[#101014]/85 px-3 py-1.5 text-[13px] font-medium text-white shadow-[0_0_30px_rgba(56,189,248,.35)] backdrop-blur transition-all duration-300"
          style={{ opacity: isActive ? 1 : 0, transform: `translateY(${isActive ? 0 : 6}px)` }}
        >
          {infraById[id].name}
        </div>
      </Html>
    </group>
  );
}

/* ───────── Component models ───────── */

function Server({ active }: { active: boolean }) {
  const leds = useRef<THREE.MeshBasicMaterial[]>([]);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame((s) => {
    leds.current.forEach((m, i) => {
      if (!m) return;
      const on = Math.sin(s.clock.elapsedTime * (3 + i) + seed + i * 2) > 0.2;
      m.color.set(on ? (i % 2 ? SKY : "#4ADE80") : "#1f2937");
    });
  });
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.28 + i * 0.42, 0]}>
          <RoundedBox args={[1.25, 0.36, 0.95]} radius={0.05} smoothness={2}>
            <meshStandardMaterial
              color={BODY}
              metalness={0.6}
              roughness={0.35}
              emissive={VIOLET}
              emissiveIntensity={active ? 0.28 : 0.06}
            />
          </RoundedBox>
          {[0, 1, 2].map((j) => (
            <mesh key={j} position={[-0.42 + j * 0.13, 0, 0.48]}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
              <meshBasicMaterial
                ref={(m) => {
                  if (m) leds.current[i * 3 + j] = m;
                }}
              />
            </mesh>
          ))}
          <mesh position={[0.3, 0, 0.481]}>
            <planeGeometry args={[0.5, 0.05]} />
            <meshBasicMaterial color={SKY} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LoadBalancer({ active }: { active: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ring.current) ring.current.rotation.z += d * 0.8;
  });
  return (
    <group>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.75, 0.85, 0.5, 6]} />
        <meshStandardMaterial color={BODY} metalness={0.7} roughness={0.3} emissive={SKY} emissiveIntensity={active ? 0.35 : 0.08} />
      </mesh>
      <mesh ref={ring} position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.025, 8, 6]} />
        <meshBasicMaterial color={SKY} />
      </mesh>
      {/* Incoming traffic beam */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
        <meshBasicMaterial color={SKY} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function Database({ active }: { active: boolean }) {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.22 + i * 0.4, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.32, 40]} />
          <meshStandardMaterial
            color={BODY}
            metalness={0.55}
            roughness={0.3}
            emissive={VIOLET}
            emissiveIntensity={active ? 0.4 : 0.1}
          />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={`r${i}`} position={[0, 0.39 + i * 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.56, 0.62, 40]} />
          <meshBasicMaterial color={VIOLET} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Bucket({ active }: { active: boolean }) {
  const items = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (items.current) items.current.position.y = 1.15 + Math.sin(s.clock.elapsedTime * 1.5) * 0.08;
  });
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.72, 0.52, 1, 40, 1, true]} />
        <meshStandardMaterial color={BODY} metalness={0.6} roughness={0.3} side={THREE.DoubleSide} emissive={SKY} emissiveIntensity={active ? 0.35 : 0.08} />
      </mesh>
      <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.66, 0.72, 40]} />
        <meshBasicMaterial color={SKY} />
      </mesh>
      <group ref={items}>
        {[-0.22, 0, 0.22].map((x, i) => (
          <mesh key={i} position={[x, i * 0.06, 0]} rotation={[0.3, i, 0.2]}>
            <boxGeometry args={[0.16, 0.2, 0.03]} />
            <meshBasicMaterial color={i === 1 ? "#F8FAFC" : SKY} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Monitor({ active }: { active: boolean }) {
  const bars = useRef<THREE.Mesh[]>([]);
  useFrame((s) => {
    bars.current.forEach((b, i) => {
      if (!b) return;
      const h = 0.25 + (Math.sin(s.clock.elapsedTime * 1.6 + i * 1.3) * 0.5 + 0.5) * 0.6;
      b.scale.y = h;
      b.position.y = 0.55 + h / 2;
    });
  });
  return (
    <group rotation={[0, -0.5, 0]}>
      <RoundedBox args={[1.5, 1.1, 0.12]} radius={0.05} position={[0, 0.95, 0]}>
        <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.4} emissive={VIOLET} emissiveIntensity={active ? 0.3 : 0.06} />
      </RoundedBox>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) bars.current[i] = m;
          }}
          position={[-0.5 + i * 0.25, 0.8, 0.07]}
        >
          <boxGeometry args={[0.14, 1, 0.02]} />
          <meshBasicMaterial color={i === 3 ? "#F472B6" : "#C4B5FD"} />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color={BODY} />
      </mesh>
    </group>
  );
}

function Repo({ active }: { active: boolean }) {
  const pts: Pos[] = [
    [0, 0.4, 0],
    [0, 0.9, 0],
    [0, 1.4, 0],
    [0.45, 1.15, 0],
  ];
  return (
    <group>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshBasicMaterial color={VIOLET} />
      </mesh>
      <mesh position={[0.22, 1.02, 0]} rotation={[0, 0, -1]}>
        <cylinderGeometry args={[0.03, 0.03, 0.55, 8]} />
        <meshBasicMaterial color={VIOLET} />
      </mesh>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color={i === 3 ? SKY : "#F8FAFC"} emissive={i === 3 ? SKY : VIOLET} emissiveIntensity={active ? 0.9 : 0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.2, 32]} />
        <meshStandardMaterial color={BODY} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Builder({ active }: { active: boolean }) {
  const gear = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (gear.current) gear.current.rotation.y += d * (active ? 2.2 : 0.8);
  });
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.2, 32]} />
        <meshStandardMaterial color={BODY} metalness={0.6} roughness={0.35} />
      </mesh>
      <group ref={gear} position={[0, 0.85, 0]}>
        <mesh>
          <torusGeometry args={[0.38, 0.1, 12, 32]} />
          <meshStandardMaterial color={BODY} metalness={0.8} roughness={0.25} emissive={VIOLET} emissiveIntensity={active ? 0.6 : 0.2} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]} position={[Math.cos((i / 8) * Math.PI * 2) * 0.52, Math.sin((i / 8) * Math.PI * 2) * 0.52, 0]}>
            <boxGeometry args={[0.14, 0.12, 0.16]} />
            <meshStandardMaterial color={BODY} metalness={0.8} roughness={0.25} emissive={VIOLET} emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Container({ active }: { active: boolean }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 0.6, 0.6)), []);
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.2, 32]} />
        <meshStandardMaterial color={BODY} metalness={0.6} roughness={0.35} />
      </mesh>
      {[0, 1].map((i) => (
        <group key={i} position={[i * 0.12 - 0.06, 0.55 + i * 0.62, i * -0.05]}>
          <mesh>
            <boxGeometry args={[0.9, 0.6, 0.6]} />
            <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.4} emissive={SKY} emissiveIntensity={active ? 0.3 : 0.06} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color={i ? SKY : VIOLET} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

/* ───────── Connections with travelling packets ───────── */
function Links({ active }: { active: InfraNodeId | null }) {
  const curves = useMemo(
    () =>
      LINKS.map(([a, b, color]) => {
        const A = new THREE.Vector3(P[a][0], 0.35, P[a][2]);
        const B = new THREE.Vector3(P[b][0], 0.35, P[b][2]);
        const mid = A.clone().lerp(B, 0.5);
        mid.y += 0.6 + A.distanceTo(B) * 0.08;
        return { a, b, color, curve: new THREE.QuadraticBezierCurve3(A, mid, B) };
      }),
    [],
  );

  const tubes = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c.curve, 40, 0.012, 6, false)),
    [curves],
  );

  const PER = 3;
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArr = useMemo(() => {
    const c = new THREE.Color();
    const arr = new Float32Array(curves.length * PER * 3);
    curves.forEach((cv, i) => {
      c.set(cv.color);
      for (let k = 0; k < PER; k++) c.toArray(arr, (i * PER + k) * 3);
    });
    return arr;
  }, [curves]);

  useFrame((s) => {
    if (!inst.current) return;
    const t = s.clock.elapsedTime;
    curves.forEach((cv, i) => {
      const hot = active && (cv.a === active || cv.b === active);
      for (let k = 0; k < PER; k++) {
        const u = (t * (hot ? 0.5 : 0.22) + k / PER + i * 0.13) % 1;
        cv.curve.getPoint(u, dummy.position);
        dummy.scale.setScalar(hot ? 1.5 : 1);
        dummy.updateMatrix();
        inst.current!.setMatrixAt(i * PER + k, dummy.matrix);
      }
    });
    inst.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {tubes.map((geo, i) => {
        const cv = curves[i];
        const hot = active !== null && (cv.a === active || cv.b === active);
        return (
          <mesh key={i} geometry={geo}>
            <meshBasicMaterial
              color={cv.color}
              transparent
              opacity={active === null ? 0.35 : hot ? 0.95 : 0.08}
            />
          </mesh>
        );
      })}
      <instancedMesh ref={inst} args={[undefined, undefined, curves.length * PER]}>
        <sphereGeometry args={[0.05, 10, 10]}>
          <instancedBufferAttribute attach="attributes-color" args={[colorArr, 3]} />
        </sphereGeometry>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ───────── VPC boundary & platform ───────── */
function Platform({
  active,
  setActive,
}: {
  active: InfraNodeId | null;
  setActive: (id: InfraNodeId | null) => void;
}) {
  const vpcEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(7.6, 2.6, 7.6)),
    [],
  );
  const vpcActive = active === "vpc";
  return (
    <group>
      {/* Base slab */}
      <mesh position={[1.1, -0.12, 0]} receiveShadow>
        <boxGeometry args={[16, 0.2, 9.4]} />
        <meshStandardMaterial color="#0c0c11" metalness={0.4} roughness={0.8} />
      </mesh>
      <gridHelper args={[16, 32, "#26263a", "#17171f"]} position={[1.1, 0.0, 0]} scale={[1, 1, 9.4 / 16]} />

      {/* VPC volume */}
      <group position={[P.vpc[0], 1.3, P.vpc[2]]}>
        <lineSegments geometry={vpcEdges}>
          <lineBasicMaterial color={vpcActive ? SKY : VIOLET} transparent opacity={vpcActive ? 0.9 : 0.35} />
        </lineSegments>
        <mesh>
          <boxGeometry args={[7.6, 2.6, 7.6]} />
          <meshBasicMaterial color={VIOLET} transparent opacity={vpcActive ? 0.06 : 0.02} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      </group>
      {/* Subnet floors — hovering the floor selects the VPC */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[P.vpc[0], 0.015, -2.3]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setActive("vpc");
        }}
        onPointerOut={() => setActive(null)}
      >
        <planeGeometry args={[7.4, 2.6]} />
        <meshBasicMaterial color={SKY} transparent opacity={vpcActive ? 0.12 : 0.04} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[P.vpc[0], 0.015, 1.6]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setActive("vpc");
        }}
        onPointerOut={() => setActive(null)}
      >
        <planeGeometry args={[7.4, 4.8]} />
        <meshBasicMaterial color={VIOLET} transparent opacity={vpcActive ? 0.12 : 0.04} />
      </mesh>
      <Html position={[P.vpc[0] - 3.6, 2.75, -3.75]} distanceFactor={11} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap text-[12px] text-violet-300/80">VPC · 10.0.0.0/16</div>
      </Html>
      <Html position={[-5.4, 0.05, 4.1]} distanceFactor={11} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap text-[12px] text-sky-300/80">CI/CD pipeline</div>
      </Html>
    </group>
  );
}

function Scene({
  active,
  setActive,
  interactive,
}: {
  active: InfraNodeId | null;
  setActive: (id: InfraNodeId | null) => void;
  interactive: boolean;
}) {
  const nodeProps = { active, setActive };
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 18, 34]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 6]} intensity={1.2} />
      <pointLight position={[-4, 4, -2]} intensity={30} color={VIOLET} distance={14} />
      <pointLight position={[6, 3, 3]} intensity={24} color={SKY} distance={14} />

      <Platform {...nodeProps} />
      <Links active={active} />

      <Node id="repo" {...nodeProps} labelY={1.7}><Repo active={active === "repo"} /></Node>
      <Node id="ci" {...nodeProps} labelY={1.6}><Builder active={active === "ci"} /></Node>
      <Node id="registry" {...nodeProps} labelY={1.8}><Container active={active === "registry"} /></Node>
      <Node id="lb" {...nodeProps} labelY={1.0}><LoadBalancer active={active === "lb"} /></Node>
      <Node id="ec2a" {...nodeProps}><Server active={active === "ec2a"} /></Node>
      <Node id="ec2b" {...nodeProps}><Server active={active === "ec2b"} /></Node>
      <Node id="rds" {...nodeProps} labelY={1.3}><Database active={active === "rds"} /></Node>
      <Node id="s3" {...nodeProps} labelY={1.5}><Bucket active={active === "s3"} /></Node>
      <Node id="monitor" {...nodeProps} labelY={1.7}><Monitor active={active === "monitor"} /></Node>

      <OrbitControls
        enabled={interactive}
        enableZoom={false}
        enablePan={false}
        target={[1.1, 0, 0]}
        minPolarAngle={0.5}
        maxPolarAngle={1.2}
        minAzimuthAngle={-0.9}
        maxAzimuthAngle={0.9}
        rotateSpeed={0.5}
        enableDamping
        autoRotate={false}
      />
    </>
  );
}

export default function InfraScene({
  active,
  setActive,
  running,
  interactive,
  compact,
}: {
  active: InfraNodeId | null;
  setActive: (id: InfraNodeId | null) => void;
  running: boolean;
  interactive: boolean;
  compact: boolean;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    document.body.style.cursor = active ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [active]);

  return (
    <Canvas
      camera={{ position: compact ? [1.1, 13, 9.5] : [1.1, 9.5, 12.5], fov: compact ? 50 : 38 }}
      dpr={[1, 1.6]}
      frameloop={running ? "always" : "never"}
      onCreated={() => setReady(true)}
      onPointerMissed={() => setActive(null)}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 1s" }}
      aria-hidden
    >
      <Scene active={active} setActive={setActive} interactive={interactive} />
    </Canvas>
  );
}
