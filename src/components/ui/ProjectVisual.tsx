"use client";

import type { Project } from "@/data/projects";

/**
 * Lightweight animated illustrations, one per project type. Pure SVG + CSS
 * so four of them on a page cost almost nothing. Layers use translateZ via
 * the parent tilt card for depth.
 */
export default function ProjectVisual({ kind }: { kind: Project["visual"] }) {
  switch (kind) {
    case "vault":
      return <Vault />;
    case "cleanse":
      return <Cleanse />;
    case "party":
      return <Party />;
    case "network":
      return <Network />;
  }
}

const defs = (
  <defs>
    <linearGradient id="pv-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#8B5CF6" />
      <stop offset="1" stopColor="#38BDF8" />
    </linearGradient>
    <radialGradient id="pv-glow">
      <stop offset="0" stopColor="#8B5CF6" stopOpacity=".45" />
      <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/* Encrypted vault: a lock core inside rotating cipher rings, with a byte grid. */
function Vault() {
  const bytes = Array.from({ length: 48 }, (_, i) =>
    ((i * 2654435761) >>> 0).toString(16).slice(-2).padStart(2, "0").toUpperCase(),
  );
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      {defs}
      <g opacity=".22" fontFamily="var(--font-mono)" fontSize="11" fill="#A1A1B5">
        {bytes.map((b, i) => (
          <text key={i} x={18 + (i % 12) * 32} y={26 + Math.floor(i / 12) * 64}>
            {b}
          </text>
        ))}
      </g>
      <circle cx="200" cy="130" r="110" fill="url(#pv-glow)" />
      <g className="origin-center animate-[spin_24s_linear_infinite]" style={{ transformOrigin: "200px 130px" }}>
        <circle cx="200" cy="130" r="84" fill="none" stroke="url(#pv-grad)" strokeWidth="1" strokeDasharray="2 8" />
      </g>
      <g className="animate-[spin_16s_linear_infinite_reverse]" style={{ transformOrigin: "200px 130px" }}>
        <circle cx="200" cy="130" r="64" fill="none" stroke="#38BDF8" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="40 14 6 14" />
      </g>
      <rect x="172" y="122" width="56" height="44" rx="10" fill="#101014" stroke="url(#pv-grad)" strokeWidth="1.5" />
      <path d="M184 122v-12a16 16 0 0 1 32 0v12" fill="none" stroke="url(#pv-grad)" strokeWidth="1.5" />
      <circle cx="200" cy="141" r="5" fill="#F8FAFC" />
      <rect x="198.5" y="144" width="3" height="10" rx="1.5" fill="#F8FAFC" />
      <text x="200" y="230" textAnchor="middle" fontSize="11" fill="#A1A1B5" fontFamily="var(--font-mono)">
        AES-256 · EC2 · Nginx
      </text>
    </svg>
  );
}

/* Deduplication: many incoming blocks, duplicates fade out, unique ones stack. */
function Cleanse() {
  const rows = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      {defs}
      <circle cx="300" cy="130" r="100" fill="url(#pv-glow)" />
      {rows.map((r) =>
        [0, 1, 2].map((c) => {
          const dup = (r + c) % 2 === 0 && c > 0;
          return (
            <rect
              key={`${r}-${c}`}
              x={40 + c * 46}
              y={38 + r * 38}
              width="36"
              height="26"
              rx="6"
              fill={dup ? "transparent" : "#17171d"}
              stroke={dup ? "#6B6B80" : "#8B5CF6"}
              strokeDasharray={dup ? "3 4" : undefined}
              opacity={dup ? 0.6 : 1}
            >
              {dup && (
                <animate attributeName="opacity" values=".6;.1;.6" dur="3s" begin={`${r * 0.3}s`} repeatCount="indefinite" />
              )}
            </rect>
          );
        }),
      )}
      <path d="M190 130h40" stroke="url(#pv-grad)" strokeWidth="1.5" />
      <path d="M224 124l8 6-8 6" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="262" y={70 + i * 32} width="80" height="24" rx="6" fill="#101014" stroke="url(#pv-grad)">
          <animate attributeName="opacity" values="0;1" dur=".6s" begin={`${0.3 + i * 0.2}s`} fill="freeze" />
        </rect>
      ))}
      <text x="302" y="225" textAnchor="middle" fontSize="11" fill="#A1A1B5" fontFamily="var(--font-mono)">
        unique records
      </text>
    </svg>
  );
}

/* Party app: host node connected to guests, with pulses travelling outward. */
function Party() {
  const guests = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x: 200 + Math.cos(a) * 92, y: 130 + Math.sin(a) * 92 };
  });
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      {defs}
      <circle cx="200" cy="130" r="120" fill="url(#pv-glow)" />
      {guests.map((g, i) => (
        <g key={i}>
          <line x1="200" y1="130" x2={g.x} y2={g.y} stroke="#8B5CF6" strokeOpacity=".35" />
          <circle r="2.5" fill="#38BDF8">
            <animateMotion dur={`${2 + (i % 3) * 0.6}s`} repeatCount="indefinite" path={`M200 130 L${g.x} ${g.y}`} />
          </circle>
          <circle cx={g.x} cy={g.y} r="13" fill="#101014" stroke="#38BDF8" strokeOpacity=".7" />
          <circle cx={g.x} cy={g.y - 3} r="3.5" fill="#A1A1B5" />
          <path d={`M${g.x - 6} ${g.y + 7}a6 5 0 0 1 12 0`} fill="#A1A1B5" />
        </g>
      ))}
      <circle cx="200" cy="130" r="28" fill="#101014" stroke="url(#pv-grad)" strokeWidth="1.5" />
      <circle cx="200" cy="130" r="28" fill="none" stroke="#8B5CF6">
        <animate attributeName="r" values="28;54" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".8;0" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <text x="200" y="134" textAnchor="middle" fontSize="11" fill="#F8FAFC" fontFamily="var(--font-mono)">
        host
      </text>
    </svg>
  );
}

/* Hospital network: core router, distribution switches, VLAN-coloured segments. */
function Network() {
  const vlans = [
    { x: 70, label: "VLAN 10", c: "#8B5CF6" },
    { x: 160, label: "VLAN 20", c: "#38BDF8" },
    { x: 250, label: "VLAN 30", c: "#C4B5FD" },
    { x: 340, label: "VLAN 40", c: "#7DD3FC" },
  ];
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      {defs}
      <circle cx="200" cy="60" r="90" fill="url(#pv-glow)" />
      {vlans.map((v, i) => (
        <g key={v.label}>
          <path d={`M200 62 C200 110 ${v.x} 90 ${v.x} 130`} fill="none" stroke={v.c} strokeOpacity=".5" />
          <circle r="2.5" fill={v.c}>
            <animateMotion dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite" path={`M200 62 C200 110 ${v.x} 90 ${v.x} 130`} />
          </circle>
          <rect x={v.x - 26} y="130" width="52" height="20" rx="5" fill="#101014" stroke={v.c} />
          {[0, 1, 2].map((h) => (
            <g key={h}>
              <line x1={v.x} y1="150" x2={v.x - 18 + h * 18} y2="186" stroke={v.c} strokeOpacity=".3" />
              <rect x={v.x - 24 + h * 18} y="186" width="12" height="10" rx="2" fill={v.c} fillOpacity=".25" stroke={v.c} strokeOpacity=".6" />
            </g>
          ))}
          <text x={v.x} y="218" textAnchor="middle" fontSize="10" fill="#A1A1B5" fontFamily="var(--font-mono)">
            {v.label}
          </text>
        </g>
      ))}
      <rect x="168" y="40" width="64" height="24" rx="6" fill="#101014" stroke="url(#pv-grad)" strokeWidth="1.5" />
      <text x="200" y="56" textAnchor="middle" fontSize="10" fill="#F8FAFC" fontFamily="var(--font-mono)">
        OSPF core
      </text>
    </svg>
  );
}
