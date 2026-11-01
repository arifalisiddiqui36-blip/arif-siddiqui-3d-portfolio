"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIntro } from "@/components/providers/IntroProvider";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/data/site";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Intro sequence. The counter tracks real readiness (fonts + page load)
 * with a minimum duration so the transition never flashes. Reduced-motion
 * users skip straight to the page.
 */
export default function Loader() {
  const { done, finish } = useIntro();
  const { lenis } = useSmoothScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    lenis?.stop();
    if (done) lenis?.start();
  }, [lenis, done]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finish();
      return;
    }

    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);

    const start = performance.now();
    const MIN = 1500;
    const MAX = 4500; // never hold the visitor longer than this
    let shown = 0;
    let finished = false;

    // Time-based (not frame-based) so a busy GPU warming up the 3D scene
    // can't stall the counter.
    const id = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const eased = 1 - Math.pow(1 - Math.min(elapsed / MIN, 1), 3);
      // Hold at 90% until the page has actually loaded.
      const cap = loaded || elapsed > MAX ? 1 : 0.9;
      shown = Math.max(shown, Math.min(eased, cap));
      setProgress(shown);
      if (shown >= 1 && !finished) {
        finished = true;
        window.clearInterval(id);
        window.setTimeout(finish, 200);
      }
    }, 30);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("load", onLoad);
    };
  }, [finish]);

  const pct = Math.round(progress * 100);
  const letters = site.name.split("");

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          aria-label={`Loading ${pct}%`}
          className="fixed inset-0 z-[80] flex flex-col justify-between bg-void px-5 py-6 md:px-10 md:py-8"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="flex items-center justify-between text-sm text-mist">
            <span>{site.roles[0]}</span>
            <span>{site.location}</span>
          </div>

          <div className="overflow-hidden">
            <h2 className="display flex flex-wrap text-[13vw] font-semibold leading-[0.85] md:text-[9vw]">
              {letters.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-105%" }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.04 * i }}
                  className="inline-block"
                  style={{ fontStretch: "80%" }}
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              ))}
            </h2>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="h-px flex-1 bg-line">
              <div
                className="h-px bg-gradient-to-r from-violet to-sky"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="display w-[3.5ch] text-right text-5xl font-light tabular-nums md:text-7xl">
              {pct}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
