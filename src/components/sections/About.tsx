"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cloud, GraduationCap, MapPin, Workflow } from "lucide-react";
import CountUp from "@/components/ui/CountUp";
import { RevealHeading } from "@/components/ui/SectionHeader";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { allSkills, skillCategories } from "@/data/skills";
import { usePrefersReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.16, 1, 0.3, 1] as const;

const statement =
  "I like the part of software most people never see — the servers, networks and pipelines that keep an application running. Right now I'm learning to automate that layer end to end: infrastructure as code, containers, and deployments that ship on every commit.";

/** Words brighten one by one as the paragraph scrolls through the viewport. */
function ScrollLitText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".word",
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <p
      ref={ref}
      className="display text-[clamp(1.6rem,3.3vw,3rem)] font-medium leading-[1.12]"
      style={{ letterSpacing: "-0.025em", fontStretch: "92%" }}
    >
      {text.split(" ").map((w, i) => (
        <span key={i} className="word inline">
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

function PuneClock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time || "—"}</span>;
}

/** Spotlight that follows the pointer inside a card. */
function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !ref.current) return;
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, ease: EASE, delay }}
      className={`glass glow-border group relative overflow-hidden rounded-[28px] p-6 md:p-7 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(139,92,246,.14), transparent 60%)",
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export default function About() {
  // Rough progress through the 2-year programme (Aug 2025 → Jun 2027).
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = new Date("2025-08-01").getTime();
    const end = new Date(`${site.education.graduation}-06-30`).getTime();
    setProgress(Math.min(Math.max((Date.now() - start) / (end - start), 0), 1));
  }, []);

  return (
    <section id="about" aria-labelledby="about-title" className="relative py-28 md:py-40">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <RevealHeading
              id="about-title"
              lines={["Hi, I'm Arif."]}
              className="text-[clamp(2.4rem,4.6vw,4rem)]"
            />
            <p className="mt-6 max-w-xs text-mist">
              MCA student in {site.education.specialization}, based in {site.location}.
            </p>
          </div>
          <div className="md:col-span-8">
            <ScrollLitText text={statement} />
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:mt-28 md:grid-cols-6 md:grid-rows-[auto_auto]">
          {/* Education */}
          <Card className="md:col-span-4">
            <div className="flex items-start justify-between gap-6">
              <div>
                <GraduationCap className="mb-6 text-violet-soft" size={22} aria-hidden />
                <h3 className="display text-2xl font-semibold md:text-[1.9rem]">
                  {site.education.degree}
                </h3>
                <p className="mt-2 text-mist">
                  Specialisation in {site.education.specialization} · {site.education.college}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="display text-5xl font-light tabular-nums md:text-6xl">
                  {site.education.graduation}
                </p>
                <p className="text-sm text-dim">Expected graduation</p>
              </div>
            </div>
            <div className="mt-8">
              <div className="mb-2 flex justify-between text-sm text-dim">
                <span>Programme progress</span>
                <span className="tabular-nums">{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet to-sky"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}
                />
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="md:col-span-2" delay={0.08}>
            <MapPin className="mb-6 text-sky" size={22} aria-hidden />
            <p className="display text-2xl font-semibold">{site.location}</p>
            <p className="mt-2 text-mist">
              Local time <PuneClock /> IST
            </p>
            <p className="mt-6 text-sm text-dim">Open to internships and entry-level cloud roles.</p>
          </Card>

          {/* Focus areas */}
          <Card className="md:col-span-3" delay={0.12}>
            <Cloud className="mb-6 text-sky" size={22} aria-hidden />
            <h3 className="display text-xl font-semibold">Cloud computing</h3>
            <p className="mt-2 text-mist">
              Running real workloads on AWS — EC2, S3, IAM and VPC networking — and learning
              how to keep them secure, observable and affordable.
            </p>
          </Card>
          <Card className="md:col-span-3" delay={0.16}>
            <Workflow className="mb-6 text-violet-soft" size={22} aria-hidden />
            <h3 className="display text-xl font-semibold">DevOps & automation</h3>
            <p className="mt-2 text-mist">
              Replacing manual steps with code: Docker images, Jenkins pipelines, Ansible
              playbooks and Terraform modules that rebuild the same environment every time.
            </p>
          </Card>
        </div>

        {/* Stats */}
        <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { n: projects.length, label: "Featured projects" },
            { n: allSkills.length, label: "Technologies in use or study" },
            { n: skillCategories.length, label: "Skill domains" },
            { n: allSkills.filter((s) => s.level !== "learning").length, label: "Used in my own projects" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.06 }}
              className="flex flex-col-reverse rounded-[24px] border border-line p-6"
            >
              <dt className="mt-2 text-sm text-mist">{s.label}</dt>
              <dd className="display text-5xl font-light tabular-nums md:text-6xl">
                <CountUp to={s.n} />
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
