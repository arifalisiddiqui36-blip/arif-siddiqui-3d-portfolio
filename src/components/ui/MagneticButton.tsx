"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

type Variant = "primary" | "ghost";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  external?: boolean;
  strength?: number;
  "aria-label"?: string;
};

const base =
  "relative inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-medium leading-none tracking-tight transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-snow text-void hover:bg-white shadow-[0_0_0_1px_rgba(255,255,255,.2),0_12px_40px_-10px_rgba(139,92,246,.7)]",
  ghost: "glass glow-border text-snow hover:text-white",
};

/**
 * A button/link that leans toward the pointer. The label moves a little
 * further than the shell, which gives the "magnetic" depth.
 */
export default function MagneticButton({
    children,
    variant = "primary",
    href,
    onClick,
    type = "button",
    disabled,
    className = "",
    external,
    strength = 0.35,
  ...rest
}: Props) {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const active = fine && !reduce;

  const shellRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const lx = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const ly = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (!active || !shellRef.current) return;
    const r = shellRef.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    lx.set(dx * strength * 0.35);
    ly.set(dy * strength * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
    lx.set(0);
    ly.set(0);
  };

  const inner = (
    <motion.span style={{ x: lx, y: ly }} className="relative z-10 inline-flex items-center gap-2.5">
      {children}
    </motion.span>
  );

  const cls = `${base} ${variants[variant]} ${className}`;

  return (
    <motion.div
      ref={shellRef}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="inline-block"
    >
      {href ? (
        <a
          href={href}
          onClick={onClick}
          className={cls}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...rest}
        >
          {inner}
        </a>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} className={cls} {...rest}>
          {inner}
        </button>
      )}
    </motion.div>
  );
}
