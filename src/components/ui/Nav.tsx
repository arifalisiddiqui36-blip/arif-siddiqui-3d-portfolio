"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { useIntro } from "@/components/providers/IntroProvider";
import { site } from "@/data/site";

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Work" },
  { href: "#infrastructure", label: "Cloud lab" },
  { href: "#journey", label: "Journey" },
];

export default function Nav() {
  const { scrollTo, lenis } = useSmoothScroll();
  const { done } = useIntro();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Header background after leaving the hero; hide on scroll down, show on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section in view.
  useEffect(() => {
    const ids = [...navLinks.map((l) => l.href.slice(1)), "contact"];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={done ? { y: hidden && !open ? -90 : 0, opacity: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`transition-[background,border-color,backdrop-filter] duration-500 ${
            scrolled
              ? "border-b border-line bg-void/60 backdrop-blur-xl"
              : "border-b border-transparent"
          }`}
        >
          <nav
            aria-label="Primary"
            className="container-x flex h-[var(--header-h)] items-center justify-between"
          >
            <a
              href="#top"
              onClick={(e) => go(e, "#top")}
              className="group flex items-center gap-3"
              aria-label={`${site.name} — back to top`}
            >
              <span className="display grid h-9 w-9 place-items-center rounded-full border border-line text-sm font-semibold transition-colors group-hover:border-violet/60">
                {site.initials}
              </span>
              <span className="hidden text-sm text-mist sm:block">{site.name}</span>
            </a>

            <ul className="hidden items-center gap-1 rounded-full border border-line bg-charcoal/40 p-1 backdrop-blur-md md:flex">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    aria-current={active === l.href ? "true" : undefined}
                    className="relative block rounded-full px-4 py-2 text-sm text-mist transition-colors hover:text-snow aria-[current]:text-snow"
                  >
                    {active === l.href && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/[0.07]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              onClick={(e) => go(e, "#contact")}
              className="hidden rounded-full bg-snow px-5 py-2.5 text-sm font-medium text-void transition-transform hover:scale-[1.03] md:inline-block"
            >
              Let&apos;s connect
            </a>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-charcoal px-5 pb-10 pt-24 md:hidden"
          >
            <ul className="space-y-1">
              {[...navLinks, { href: "#contact", label: "Contact" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}
                >
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="display block py-2 text-5xl font-medium"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="mt-10 text-sm text-mist">{site.email}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
