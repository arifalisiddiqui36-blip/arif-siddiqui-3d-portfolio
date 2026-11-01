"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Award, Briefcase, GraduationCap, Sparkles } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { timeline, timelineGroups, type TimelineKind } from "@/data/timeline";
import { usePrefersReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.16, 1, 0.3, 1] as const;

const kindMeta: Record<TimelineKind, { icon: typeof Award; label: string; color: string }> = {
  education: { icon: GraduationCap, label: "Education", color: "#8B5CF6" },
  experience: { icon: Briefcase, label: "Internship", color: "#38BDF8" },
  certification: { icon: Award, label: "Certification", color: "#C4B5FD" },
  learning: { icon: Sparkles, label: "Learning", color: "#7DD3FC" },
};

const isDev = process.env.NODE_ENV === "development";

export default function Journey() {
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  // The glowing rail fills in as you scroll through the timeline.
  useEffect(() => {
    if (reduce || !list.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list.current, start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, [reduce]);

  const missing = timelineGroups.filter((g) => !timeline.some((t) => t.kind === g.kind));

  return (
    <section id="journey" aria-labelledby="journey-title" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader
          id="journey-title"
          title={["Experience &", "learning path"]}
          intro="Where I'm studying, what I've built along the way, and the certifications and internships I add as they happen."
        />

        <ol ref={list} className="relative mx-auto max-w-4xl">
          {/* Rail */}
          <div aria-hidden className="absolute bottom-0 left-[19px] top-0 w-px bg-line md:left-1/2" />
          <div
            ref={line}
            aria-hidden
            className="absolute bottom-0 left-[19px] top-0 w-px origin-top bg-gradient-to-b from-violet via-sky to-violet shadow-[0_0_12px_rgba(139,92,246,.8)] md:left-1/2"
            style={reduce ? undefined : { transform: "scaleY(0)" }}
          />

          {timeline.map((item, i) => {
            const meta = kindMeta[item.kind];
            const Icon = meta.icon;
            const right = i % 2 === 1;
            return (
              <li key={`${item.title}-${i}`} className="relative pb-12 pl-14 last:pb-0 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                <span
                  aria-hidden
                  className="absolute left-0 top-1 grid h-10 w-10 place-items-center rounded-full border border-line bg-charcoal md:left-1/2 md:-translate-x-1/2"
                  style={{ color: meta.color, boxShadow: `0 0 0 6px #050505, 0 0 24px ${meta.color}40` }}
                >
                  <Icon size={17} />
                </span>

                <motion.div
                  initial={{ opacity: 0, x: right ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 1, ease: EASE }}
                  className={`glass glow-border rounded-[24px] p-6 ${right ? "md:col-start-2" : "md:col-start-1 md:text-right"}`}
                >
                  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${right ? "" : "md:justify-end"}`}>
                    <span style={{ color: meta.color }}>{meta.label}</span>
                    <span className="text-dim">{item.period}</span>
                  </div>
                  <h3 className="display mt-2 text-2xl font-semibold leading-tight">{item.title}</h3>
                  <p className="mt-1 text-sm text-mist">{item.org}</p>
                  <p className="mt-4 text-mist">{item.description}</p>
                  {item.tags && (
                    <ul className={`mt-5 flex flex-wrap gap-2 ${right ? "" : "md:justify-end"}`}>
                      {item.tags.map((t) => (
                        <li key={t} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-snow/75">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-1.5 text-sm text-sky hover:underline"
                    >
                      Verify credential <ArrowUpRight size={14} aria-hidden />
                    </a>
                  )}
                </motion.div>
              </li>
            );
          })}
        </ol>

        {/* Shown only in `npm run dev`, never on the live site. */}
        {isDev && missing.length > 0 && (
          <div className="mx-auto mt-14 max-w-4xl rounded-2xl border border-dashed border-sky/40 p-5 text-sm text-mist">
            Dev note — no {missing.map((m) => m.label.toLowerCase()).join(" or ")} yet. Add real
            entries in <code className="text-sky">src/data/timeline.ts</code> (templates are at the
            bottom of the file). This note is hidden in production.
          </div>
        )}
      </div>
    </section>
  );
}
