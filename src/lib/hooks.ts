"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeMQ(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

/** SSR-safe media query hook. Returns `fallback` on the server. */
export function useMediaQuery(query: string, fallback = false) {
  return useSyncExternalStore(
    subscribeMQ(query),
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)", false);

/** True on devices with a precise pointer (mouse / trackpad). */
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)", false);

export const useIsMobile = () => useMediaQuery("(max-width: 767px)", false);

/** Rough GPU budget: lower particle counts / DPR on small or low-core devices. */
export function usePerformanceTier(): "low" | "high" {
  const [tier, setTier] = useState<"low" | "high">("high");
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const small = window.matchMedia("(max-width: 767px)").matches;
    setTier(cores <= 4 || small ? "low" : "high");
  }, []);
  return tier;
}

/** Becomes true once the element has been near the viewport (for lazy 3D). */
export function useInView<T extends Element>(
  ref: React.RefObject<T | null>,
  { rootMargin = "200px", once = false }: { rootMargin?: string; once?: boolean } = {},
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}
