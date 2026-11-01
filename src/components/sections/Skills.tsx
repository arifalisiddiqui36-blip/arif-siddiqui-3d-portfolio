"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cloud, Code2, Server, Workflow } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { allSkills, levelMeta, skillCategories, type SkillCategory } from "@/data/skills";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.16, 1, 0.3, 1] as const;

const categoryIcon: Record<SkillCategory["id"], typeof Cloud> = {
  cloud: Cloud,
  devops: Workflow,
  programming: Code2,
  infrastructure: Server,
};

const categoryColor: Record<SkillCategory["id"], string> = {
  cloud: "#38BDF8",
  devops: "#8B5CF6",
  programming: "#C4B5FD",
  infrastructure: "#7DD3FC",
};

function LevelMeter({ rank, color }: { rank: number; color: string }) {
  return (
    <span className="flex gap-1" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="h-1.5 w-5 rounded-full transition-colors duration-500"
          style={{ background: n <= rank ? color : "rgba(248,250,252,.1)" }}
        />
      ))}
    </span>
  );
}

/**
 * A sphere of skill names built with real 3D transforms. Points are laid out
 * on a Fibonacci sphere and rotated every frame; depth controls scale, blur
 * and opacity. Pointer position steers the spin; dragging flings it.
 */
function SkillGlobe({
  active,
  hovered,
  setHovered,
}: {
  active: SkillCategory["id"] | null;
  hovered: string | null;
  setHovered: (s: string | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = usePrefersReducedMotion();
  const visible = useInView(wrap, { rootMargin: "100px" });
  const [radius, setRadius] = useState(220);

  const points = useMemo(() => {
    const n = allSkills.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    return allSkills.map((s, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      return { ...s, x: Math.cos(t) * r, y, z: Math.sin(t) * r };
    });
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setRadius(Math.min(e.contentRect.width, e.contentRect.height) * 0.38),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const vel = useRef({ x: 0.0025, y: 0.004 });
  const target = useRef({ x: 0.0025, y: 0.004 });
  const rot = useRef({ x: -0.3, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const paused = useRef(false);
  paused.current = hovered !== null;

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const loop = () => {
      const v = vel.current;
      const t = target.current;
      const speed = reduce ? 0 : paused.current ? 0.15 : 1;
      v.x += (t.x * speed - v.x) * 0.05;
      v.y += (t.y * speed - v.y) * 0.05;
      rot.current.x += v.x;
      rot.current.y += v.y;
      const { x: ax, y: ay } = rot.current;
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);

      points.forEach((p, i) => {
        const el = items.current[i];
        if (!el) return;
        // rotate around Y, then X
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y1 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back → 1 front
        const fit = Math.min(Math.max(radius / 230, 0.66), 1); // smaller chips on small globes
        const scale = (0.78 + depth * 0.38) * fit;
        el.style.transform = `translate3d(${x1 * radius}px, ${y1 * radius}px, ${z2 * radius}px) translate(-50%, -50%) scale(${scale})`;
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.setProperty("--depth", depth.toFixed(3));
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [points, radius, reduce, visible]);

  const onPointerMove = (e: React.PointerEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    if (drag.current) {
      vel.current.y = (e.clientX - drag.current.x) * 0.0016;
      vel.current.x = -(e.clientY - drag.current.y) * 0.0016;
      drag.current = { x: e.clientX, y: e.clientY };
      return;
    }
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    target.current = { x: -ny * 0.012, y: nx * 0.014 };
  };

  return (
    <div
      ref={wrap}
      className="relative aspect-square w-full touch-pan-y select-none [perspective:1600px]"
      onPointerMove={onPointerMove}
      onPointerDown={(e) => (drag.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => {
        drag.current = null;
        target.current = { x: 0.0025, y: 0.004 };
      }}
      data-cursor="Drag"
    >
      {/* Orbit guides */}
      <div aria-hidden className="absolute inset-[8%] rounded-full border border-line" />
      <div aria-hidden className="absolute inset-[8%] rounded-full border border-line [transform:rotateX(72deg)]" />
      <div aria-hidden className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.22),transparent_70%)] blur-2xl" />

      <div className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]">
        {points.map((p, i) => {
          const dim = active !== null && p.category !== active;
          const isHover = hovered === p.name;
          const color = categoryColor[p.category];
          return (
            <button
              key={p.name}
              ref={(el) => {
                items.current[i] = el;
              }}
              type="button"
              tabIndex={-1}
              aria-hidden
              onPointerEnter={() => setHovered(p.name)}
              onPointerLeave={() => setHovered(null)}
              className="absolute left-0 top-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium will-change-transform"
              style={{
                opacity: dim ? 0.12 : `calc(0.3 + var(--depth, 1) * 0.7)`,
                borderColor: isHover ? color : "rgba(248,250,252,.1)",
                background: isHover ? `${color}22` : "rgba(16,16,20,.6)",
                color: isHover ? "#fff" : "#E2E8F0",
                boxShadow: isHover ? `0 0 30px ${color}55` : "none",
                transition: "opacity .5s, border-color .3s, background .3s, box-shadow .3s",
                backdropFilter: "blur(6px)",
              }}
            >
              <span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ background: color }}
              />
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Skills() {
  const [active, setActive] = useState<SkillCategory["id"] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredSkill = allSkills.find((s) => s.name === hovered);

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-28 md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line to-transparent"
      />
      <div className="container-x">
        <SectionHeader
          id="skills-title"
          title={["The stack I", "work with"]}
          intro="Each skill shows how far I've taken it — from tools I'm learning to ones I've shipped projects with. Pick a domain to focus the globe."
        />

        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="grid gap-3">
              {skillCategories.map((cat) => {
                const Icon = categoryIcon[cat.id];
                const isActive = active === cat.id;
                const color = categoryColor[cat.id];
                return (
                  <div key={cat.id} className="glass glow-border overflow-hidden rounded-[22px]">
                    <button
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={`skills-${cat.id}`}
                      onClick={() => setActive(isActive ? null : cat.id)}
                      className="flex w-full items-center gap-4 p-5 text-left"
                    >
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-line"
                        style={{ color, background: isActive ? `${color}1a` : "transparent" }}
                      >
                        <Icon size={20} aria-hidden />
                      </span>
                      <span className="flex-1">
                        <span className="display block text-xl font-semibold">{cat.title}</span>
                        <span className="block text-sm text-mist">{cat.blurb}</span>
                      </span>
                      <span className="text-sm tabular-nums text-dim">{cat.skills.length}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.ul
                          id={`skills-${cat.id}`}
                          aria-label={`${cat.title} skills`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="overflow-hidden px-5"
                        >
                          {cat.skills.map((s) => (
                            <li
                              key={s.name}
                              onPointerEnter={() => setHovered(s.name)}
                              onPointerLeave={() => setHovered(null)}
                              className="flex items-center justify-between gap-4 border-t border-line py-3 first:mt-0 last:mb-4"
                            >
                              <span>
                                <span className="block">{s.name}</span>
                                {s.note && <span className="block text-xs text-dim">{s.note}</span>}
                              </span>
                              <span className="flex items-center gap-3">
                                <span className="text-xs text-mist">{levelMeta[s.level].label}</span>
                                <LevelMeter rank={levelMeta[s.level].rank} color={color} />
                              </span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-dim">
              {Object.values(levelMeta).map((l) => (
                <span key={l.label} className="flex items-center gap-2">
                  <LevelMeter rank={l.rank} color="#A1A1B5" /> {l.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative order-1 lg:order-2 lg:col-span-7">
            <SkillGlobe active={active} hovered={hovered} setHovered={setHovered} />
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center" aria-live="polite">
              <AnimatePresence mode="wait">
                {hoveredSkill && (
                  <motion.div
                    key={hoveredSkill.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="glass flex items-center gap-3 rounded-full px-4 py-2 text-sm"
                  >
                    <span className="font-medium">{hoveredSkill.name}</span>
                    <span className="text-mist">{levelMeta[hoveredSkill.level].label}</span>
                    <LevelMeter
                      rank={levelMeta[hoveredSkill.level].rank}
                      color={categoryColor[hoveredSkill.category]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
