"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

/**
 * A two-part cursor: a precise dot plus a trailing ring that grows over
 * interactive elements and shows a label for anything with [data-cursor].
 * Disabled on touch devices and when reduced motion is requested.
 */
export default function Cursor() {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const enabled = fine && !reduce;

  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [state, setState] = useState<"idle" | "hover" | "label" | "down">("idle");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-custom-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setVisible(true);
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (ring.current)
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setLabel(labelled.dataset.cursor ?? "");
        setState("label");
        return;
      }
      const interactive = t?.closest("a, button, input, textarea, select, label, [role='button']");
      setLabel("");
      setState(interactive ? "hover" : "idle");
    };
    const down = () => setState((s) => (s === "label" ? s : "down"));
    const up = () => setState((s) => (s === "down" ? "hover" : s));
    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringSize =
    state === "label" ? 84 : state === "hover" ? 52 : state === "down" ? 26 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={ring}
        className="absolute left-0 top-0"
        style={{ opacity: visible ? 1 : 0, transition: "opacity .3s" }}
      >
        <div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[11px] font-medium text-void"
          style={{
            width: ringSize,
            height: ringSize,
            borderColor: state === "label" ? "transparent" : "rgb(248 250 252 / 0.45)",
            background:
              state === "label"
                ? "linear-gradient(135deg, #c4b5fd, #7dd3fc)"
                : state === "hover"
                  ? "rgb(139 92 246 / 0.12)"
                  : "transparent",
            transition:
              "width .45s cubic-bezier(.16,1,.3,1), height .45s cubic-bezier(.16,1,.3,1), background .3s, border-color .3s",
          }}
        >
          {state === "label" ? label : null}
        </div>
      </div>
      <div
        ref={dot}
        className="absolute left-0 top-0"
        style={{ opacity: visible && state !== "label" ? 1 : 0, transition: "opacity .2s" }}
      >
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-snow" />
      </div>
    </div>
  );
}
