"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Heading whose lines rise out of a mask when they enter the viewport. */
export function RevealHeading({
  lines,
  as: Tag = "h2",
  className = "",
  id,
}: {
  lines: string[];
  as?: "h2" | "h3";
  className?: string;
  id?: string;
}) {
  const MotionTag = Tag === "h2" ? motion.h2 : motion.h3;
  // The heading itself is observed (the masked lines are clipped, so
  // observing them directly would never fire); lines inherit the variant.
  return (
    <MotionTag
      id={id}
      className={`display font-semibold ${className}`}
      aria-label={lines.join(" ")}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {lines.map((line, i) => (
        <span key={i} aria-hidden className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: "110%" }, shown: { y: "0%" } }}
            transition={{ duration: 1.1, ease: EASE, delay: i * 0.08 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/** A section's heading row: large title on the left, short context on the right. */
export default function SectionHeader({
  title,
  intro,
  id,
}: {
  title: string[];
  intro?: string;
  id?: string;
}) {
  return (
    <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12 md:items-end">
      <RevealHeading
        id={id}
        lines={title}
        className="text-[clamp(2.6rem,6.4vw,5.75rem)] md:col-span-8"
      />
      {intro && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          className="max-w-sm text-[17px] leading-relaxed text-mist md:col-span-4 md:justify-self-end"
        >
          {intro}
        </motion.p>
      )}
    </div>
  );
}
