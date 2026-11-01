"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Check, X } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ProjectVisual from "@/components/ui/ProjectVisual";
import MagneticButton from "@/components/ui/MagneticButton";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { projects, type Project } from "@/data/projects";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.16, 1, 0.3, 1] as const;

function TiltCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const tilt = fine && !reduce;
  const ref = useRef<HTMLElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-9, 9]), { stiffness: 160, damping: 18 });
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(500px circle at ${glareX} ${glareY}, rgba(255,255,255,.09), transparent 45%)`;

  const onMove = (e: React.PointerEvent) => {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const wide = index === 0 || index === 3;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay: (index % 2) * 0.1 }}
      className={`[perspective:1200px] ${wide ? "md:col-span-7" : "md:col-span-5"}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <motion.div
        style={tilt ? { rotateX: rx, rotateY: ry } : undefined}
        className="glass glow-border group relative flex h-full flex-col overflow-hidden rounded-[30px]"
      >
        {tilt && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: glare }}
          />
        )}

        <button
          type="button"
          onClick={() => onOpen(project)}
          className="relative block aspect-[16/10] w-full overflow-hidden border-b border-line bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,.12),transparent_60%)] text-left"
          data-cursor="View"
          aria-label={`Open case study: ${project.title}`}
        >
          <div
            className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          >
            <ProjectVisual kind={project.visual} />
          </div>
          <span className="absolute left-5 top-5 rounded-full border border-line bg-void/50 px-3 py-1 text-xs text-mist backdrop-blur">
            {project.category}
          </span>
        </button>

        <div className="flex flex-1 flex-col p-6 md:p-8">
          <h3 className="display text-[1.9rem] font-semibold leading-tight md:text-[2.2rem]">
            {project.title}
          </h3>
          <p className="mt-3 max-w-[52ch] text-mist">{project.summary}</p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology stack">
            {project.stack.map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-snow/80">
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <button
              type="button"
              onClick={() => onOpen(project)}
              className="inline-flex items-center gap-2 rounded-full bg-snow px-5 py-2.5 text-sm font-medium text-void transition-transform hover:scale-[1.03]"
            >
              View project <ArrowUpRight size={15} aria-hidden />
            </button>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-snow/40"
              >
                <GithubIcon size={15} /> GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { lenis } = useSmoothScroll();
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lenis?.stop();
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialog.current) {
        // Keep focus inside the dialog.
        const f = dialog.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        );
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
      prev?.focus();
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-void/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.6, ease: EASE }}
        data-lenis-prevent
        className="glass relative max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-[30px] bg-charcoal/90 md:rounded-[30px]"
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-line bg-void/60 backdrop-blur transition-colors hover:border-snow/40"
        >
          <X size={18} />
        </button>
        <div className="aspect-[16/8] border-b border-line bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,.16),transparent_60%)]">
          <ProjectVisual kind={project.visual} />
        </div>
        <div className="p-6 md:p-10">
          <p className="text-sm text-sky">{project.category}</p>
          <h3 id="project-modal-title" className="display mt-2 text-4xl font-semibold md:text-5xl">
            {project.title}
          </h3>
          <p className="mt-5 text-[17px] leading-relaxed text-mist">{project.description}</p>

          <h4 className="mt-8 font-medium">What it does</h4>
          <ul className="mt-3 space-y-2.5">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-mist">
                <Check size={18} className="mt-0.5 shrink-0 text-sky" aria-hidden />
                {h}
              </li>
            ))}
          </ul>

          <h4 className="mt-8 font-medium">Built with</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1 text-sm text-snow/80">
                {t}
              </li>
            ))}
          </ul>

          {(project.github || project.live) && (
            <div className="mt-10 flex flex-wrap gap-3">
              {project.live && (
                <MagneticButton href={project.live} external>
                  Open live site <ArrowUpRight size={16} />
                </MagneticButton>
              )}
              {project.github && (
                <MagneticButton href={project.github} external variant="ghost">
                  <GithubIcon size={16} /> View source
                </MagneticButton>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader
          id="projects-title"
          title={["Selected", "work"]}
          intro="Four projects across cloud deployment, data management, full stack and network design. Open any of them for the details."
        />
        <div className="grid gap-5 md:grid-cols-12">
          {projects.map((p, i) => (
            <TiltCard key={p.id} project={p} index={i} onOpen={setOpen} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && <ProjectModal key={open.id} project={open} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
