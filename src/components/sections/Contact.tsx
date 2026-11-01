"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, LoaderCircle, Mail, Send } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import { RevealHeading } from "@/components/ui/SectionHeader";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { site } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "mailto" }
  | { kind: "error"; message: string };

function Field({
  label,
  id,
  textarea,
  ...props
}: {
  label: string;
  id: string;
  textarea?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const cls =
    "peer w-full rounded-2xl border border-line bg-void/40 px-4 pb-3 pt-7 text-snow outline-none transition-colors placeholder:text-transparent focus:border-violet/70 focus:bg-void/60";
  return (
    <div className="relative">
      {textarea ? (
        <textarea id={id} name={id} rows={5} placeholder={label} className={`${cls} resize-none`} {...props} />
      ) : (
        <input id={id} name={id} placeholder={label} className={cls} {...props} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2.5 text-xs text-mist transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-[15px] peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-violet-soft"
      >
        {label}
      </label>
    </div>
  );
}

export default function Contact() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset();
        setStatus({ kind: "sent" });
        return;
      }
      if (json.fallback) {
        // No email service configured: hand off to the visitor's mail app.
        const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
        const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
        window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
        setStatus({ kind: "mailto" });
        return;
      }
      setStatus({ kind: "error", message: json.error ?? "The message didn't send. Try again." });
    } catch {
      setStatus({ kind: "error", message: "You appear to be offline. Check your connection and try again." });
    }
  };

  // Only links that are filled in site.ts are shown.
  const socials: { href: string; label: string; Icon: typeof GithubIcon }[] = [
    { href: site.linkedin as string, label: "LinkedIn", Icon: LinkedinIcon },
    { href: site.github as string, label: "GitHub", Icon: GithubIcon },
  ].filter((s) => s.href);

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden pb-16 pt-28 md:pt-40">
      {/* Animated background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[20%] h-[80vmax] w-[80vmax] -translate-x-1/2 animate-drift rounded-full bg-[conic-gradient(from_180deg,rgba(139,92,246,.22),rgba(56,189,248,.14),rgba(139,92,246,.05),rgba(139,92,246,.22))] blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-[50%] bg-[linear-gradient(to_right,rgba(248,250,252,.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,250,252,.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_top,black,transparent)] [transform:perspective(600px)_rotateX(55deg)] origin-bottom" />
      </div>

      <div className="container-x relative">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <RevealHeading
              id="contact-title"
              lines={["Have an Interesting", "Project in Mind?"]}
              className="text-[clamp(2.6rem,6vw,5.5rem)]"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE, delay: 0.2 }}
              className="mt-6 max-w-md text-xl text-mist"
            >
              Let&apos;s build something extraordinary together.
            </motion.p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <div className="relative">
                <div aria-hidden className="absolute -inset-3 animate-pulse-glow rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,.55),transparent)] blur-lg" />
                <MagneticButton href={`mailto:${site.email}`} className="relative">
                  <Mail size={16} /> Email me
                </MagneticButton>
              </div>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-3 text-sm text-mist transition-colors hover:text-snow"
                aria-label={`Copy email address ${site.email}`}
              >
                {copied ? <Check size={15} className="text-sky" /> : <Copy size={15} />}
                <span>{copied ? "Copied" : site.email}</span>
              </button>
            </div>

            {socials.length > 0 && (
              <ul className="mt-10 grid gap-2 sm:max-w-sm">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-2xl border border-line px-5 py-4 transition-colors hover:border-snow/30"
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} /> {label}
                      </span>
                      <ArrowUpRight size={16} className="text-mist transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1, ease: EASE }}
            className="lg:col-span-6"
          >
            <form onSubmit={onSubmit} className="glass glow-border rounded-[30px] p-6 md:p-8" noValidate={false}>
              <h3 className="display text-2xl font-semibold">Send a message</h3>
              <p className="mt-1 text-sm text-mist">It goes straight to my inbox.</p>
              <div className="mt-6 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="name" label="Your name" required autoComplete="name" maxLength={120} />
                  <Field id="email" label="Email address" type="email" required autoComplete="email" maxLength={200} />
                </div>
                <Field id="message" label="What are you working on?" textarea required minLength={10} maxLength={5000} />
                {/* Honeypot */}
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <MagneticButton type="submit" disabled={status.kind === "sending"}>
                  {status.kind === "sending" ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" /> Sending
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send message
                    </>
                  )}
                </MagneticButton>
                <AnimatePresence mode="wait">
                  {status.kind !== "idle" && status.kind !== "sending" && (
                    <motion.p
                      key={status.kind}
                      role={status.kind === "error" ? "alert" : "status"}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm ${status.kind === "error" ? "text-rose-300" : "text-sky"}`}
                    >
                      {status.kind === "sent" && "Message sent. I'll get back to you soon."}
                      {status.kind === "mailto" && "Your mail app opened with the message ready to send."}
                      {status.kind === "error" && status.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        </div>

        <footer className="mt-28 flex flex-col gap-6 border-t border-line pt-8 text-sm text-dim md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} · {site.location}
          </p>
          <p>Built with Next.js, Three.js and GSAP.</p>
        </footer>
      </div>
    </section>
  );
}
