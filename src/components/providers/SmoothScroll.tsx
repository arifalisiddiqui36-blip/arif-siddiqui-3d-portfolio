"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollCtx = {
  /** Smooth-scroll to a selector like "#projects" (falls back to native). */
  scrollTo: (target: string) => void;
  lenis: Lenis | null;
};

const Ctx = createContext<ScrollCtx>({
  scrollTo: (t) => document.querySelector(t)?.scrollIntoView({ behavior: "smooth" }),
  lenis: null,
});

export const useSmoothScroll = () => useContext(Ctx);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = instance;
    setLenis(instance);

    // Keep GSAP ScrollTrigger in lockstep with Lenis.
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const scrollTo = useCallback((target: string) => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: 0, duration: 1.6 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Move focus for keyboard and screen-reader users.
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }, []);

  return <Ctx.Provider value={{ scrollTo, lenis }}>{children}</Ctx.Provider>;
}
