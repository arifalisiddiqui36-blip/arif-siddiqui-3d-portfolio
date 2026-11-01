"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import { useIntro } from "@/components/providers/IntroProvider";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { useInView, usePerformanceTier, usePrefersReducedMotion } from "@/lib/hooks";
import { site } from "@/data/site";

gsap.registerPlugin(ScrollTrigger);

/** Static fallback that matches the 3D core — shown while WebGL loads or if it's unavailable. */
function CoreFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="relative h-[46vmin] w-[46vmin]">
        <div className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.35),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#3b2a6b,#0b0912_65%)] shadow-[inset_-20px_-30px_60px_rgba(56,189,248,.25),inset_10px_10px_40px_rgba(139,92,246,.35)]" />
      </div>
    </div>
  );
}

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <CoreFallback />,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const EASE = [0.16, 1, 0.3, 1] as const;

function RoleTicker({ play }: { play: boolean }) {
  const [i, setI] = useState(0);
  const reduce = usePrefersReducedMotion();
  useEffect(() => {
    if (!play || reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % site.roles.length), 2600);
    return () => clearInterval(id);
  }, [play, reduce]);
  return (
    <span className="relative inline-flex h-[1.5em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={site.roles[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="block whitespace-nowrap text-snow"
        >
          {site.roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  const { done } = useIntro();
  const { scrollTo } = useSmoothScroll();
  const tier = usePerformanceTier();
  const reduce = usePrefersReducedMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(section, { rootMargin: "0px" });
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => setWebgl(hasWebGL()), []);

  // Cinematic exit: the core recedes and the name lifts away at different speeds.
  useEffect(() => {
    if (reduce || !section.current) return;
    const ctx = gsap.context(() => {
      const st = { trigger: section.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(stage.current, { scale: 0.72, opacity: 0, yPercent: 12, ease: "none", scrollTrigger: st });
      gsap.to(nameRef.current, { yPercent: -45, ease: "none", scrollTrigger: st });
      gsap.to(copyRef.current, { yPercent: -80, opacity: 0, ease: "none", scrollTrigger: st });
    }, section);
    return () => ctx.revert();
  }, [reduce]);

  const first = "ARIF";
  const last = "SIDDIQUI";

  const letter = (ch: string, i: number, offset: number) => (
    <motion.span
      key={`${ch}-${i}`}
      className="inline-block"
      initial={{ y: "110%", rotateX: -70 }}
      animate={done ? { y: "0%", rotateX: 0 } : {}}
      transition={{ duration: 1.2, ease: EASE, delay: 0.25 + (offset + i) * 0.045 }}
    >
      {ch}
    </motion.span>
  );

  return (
    <section
      id="top"
      ref={section}
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[20%] top-[-10%] h-[70vmax] w-[70vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.18),transparent_60%)] blur-3xl" />
        <div className="absolute -right-[25%] bottom-[-30%] h-[60vmax] w-[60vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgba(56,189,248,.12),transparent_60%)] blur-3xl [animation-delay:-9s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(248,250,252,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,250,252,.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      {/* 3D stage */}
      <div ref={stage} className="absolute inset-x-0 top-[-14%] h-[78%] md:inset-0 md:left-[18%] md:top-[-6%] md:h-auto">
        {webgl === false ? (
          <CoreFallback />
        ) : webgl ? (
          <HeroScene ready={done} tier={tier} reduceMotion={reduce} active={inView} />
        ) : (
          <CoreFallback />
        )}
      </div>

      {/* Mobile scrim keeps the copy legible over the core */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-void via-void/80 to-transparent md:hidden" />

      {/* Copy */}
      <div className="container-x pointer-events-none relative z-10 flex flex-1 flex-col justify-end pb-10 pt-[calc(var(--header-h)+2rem)] md:pb-14">
        <div ref={copyRef} className="pointer-events-auto mb-8 max-w-xl md:mb-12">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={done ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
            className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-mist"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky" />
            </span>
            <RoleTicker play={done} />
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={done ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 1.0 }}
            className="display text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.05]"
            style={{ letterSpacing: "-0.025em" }}
          >
            {site.headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={done ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 1.1 }}
            className="mt-4 max-w-md text-[17px] leading-relaxed text-mist"
          >
            {site.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={done ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 1.2 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <MagneticButton
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#projects");
              }}
            >
              Explore My Work <ArrowDown size={16} />
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#contact");
              }}
            >
              Let&apos;s Connect <ArrowUpRight size={16} />
            </MagneticButton>
          </motion.div>
        </div>

        <h1
          ref={nameRef}
          aria-label={site.name}
          className="display pointer-events-none select-none font-semibold text-snow [perspective:800px]"
        >
          <span aria-hidden className="flex overflow-hidden text-[clamp(4.4rem,min(15vw,22vh),14rem)] leading-[0.82]" style={{ fontStretch: "75%" }}>
            {first.split("").map((c, i) => letter(c, i, 0))}
          </span>
          <span aria-hidden className="flex overflow-hidden pb-[0.04em] text-[clamp(4.4rem,min(15vw,22vh),14rem)] leading-[0.82]" style={{ fontStretch: "75%" }}>
            {last.split("").map((c, i) => letter(c, i, first.length))}
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={done ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.5 }}
          className="pointer-events-auto mt-6 flex items-center justify-between border-t border-line pt-5 text-sm text-mist"
        >
          <span className="flex items-center gap-2">
            <MapPin size={14} aria-hidden /> {site.location}
          </span>
          <button
            type="button"
            onClick={() => scrollTo("#about")}
            className="group flex items-center gap-3 text-mist transition-colors hover:text-snow"
            aria-label="Scroll to About section"
          >
            <span className="hidden sm:inline">Scroll to explore</span>
            <span className="relative flex h-9 w-6 justify-center rounded-full border border-snow/30 pt-2">
              <span className="h-2 w-[3px] animate-scroll-dot rounded-full bg-snow" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
