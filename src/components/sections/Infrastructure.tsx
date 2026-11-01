"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Box, Cloud, Database, GitBranch, HardDrive, Network, Server, Workflow } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { infraById, infraNodes, type InfraNodeId } from "@/data/infra";
import { useFinePointer, useInView, useIsMobile } from "@/lib/hooks";

function SceneLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center" role="status">
      <div className="flex items-center gap-3 text-sm text-mist">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet/30 border-t-sky" />
        Provisioning the cloud lab…
      </div>
    </div>
  );
}

const InfraScene = dynamic(() => import("@/components/three/InfraScene"), {
  ssr: false,
  loading: () => <SceneLoading />,
});

const icons: Record<InfraNodeId, typeof Cloud> = {
  vpc: Cloud,
  lb: Network,
  ec2a: Server,
  ec2b: Server,
  s3: HardDrive,
  rds: Database,
  monitor: Activity,
  repo: GitBranch,
  ci: Workflow,
  registry: Box,
};

const groups: { label: string; ids: InfraNodeId[] }[] = [
  { label: "Network", ids: ["vpc", "lb"] },
  { label: "Compute", ids: ["ec2a", "ec2b"] },
  { label: "Data", ids: ["rds", "s3"] },
  { label: "Operations", ids: ["repo", "ci", "registry", "monitor"] },
];

export default function Infrastructure() {
  const [active, setActive] = useState<InfraNodeId | null>(null);
  const [pinned, setPinned] = useState<InfraNodeId | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const near = useInView(stage, { rootMargin: "400px", once: true });
  const visible = useInView(stage, { rootMargin: "0px" });
  const fine = useFinePointer();
  const mobile = useIsMobile();

  const shown = active ?? pinned;
  const node = shown ? infraById[shown] : null;
  const Icon = shown ? icons[shown] : Cloud;

  // Hover in the scene previews; clicking in the list pins.
  const sceneSet = (id: InfraNodeId | null) => {
    setActive(id);
    if (id && !fine) setPinned(id); // taps on touch devices pin directly
  };

  return (
    <section
      id="infrastructure"
      aria-labelledby="infra-title"
      className="relative overflow-hidden py-28 md:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,.08),transparent_60%)]"
      />
      <div className="container-x">
        <SectionHeader
          id="infra-title"
          title={["A cloud you", "can walk around"]}
          intro="A miniature version of the kind of environment I build: a VPC with load-balanced servers, managed storage and a database, deployed by a pipeline. Hover any component to see what it does."
        />
      </div>

      <div className="container-x">
        <div className="glass glow-border relative overflow-hidden rounded-[32px]">
          <div className="relative">
          <div
            ref={stage}
            className="relative h-[38svh] min-h-[290px] w-full md:h-[78svh] md:max-h-[760px]"
            data-cursor={fine ? "Drag" : undefined}
          >
            {near ? (
              <InfraScene
                active={shown}
                setActive={sceneSet}
                running={visible}
                interactive={fine}
                compact={mobile}
              />
            ) : (
              <SceneLoading />
            )}
          </div>

            {/* Info panel: below the scene on phones, floating over it on larger screens */}
            <div className="pointer-events-none relative z-30 px-3 pb-3 md:absolute md:bottom-6 md:left-6 md:w-[360px] md:p-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={shown ?? "intro"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-[22px] p-5"
                  aria-live="polite"
                >
                  {node ? (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-line text-sky">
                          <Icon size={18} aria-hidden />
                        </span>
                        <div>
                          <p className="display text-lg font-semibold leading-tight">{node.name}</p>
                          <p className="font-mono text-xs text-sky">{node.service}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-mist">{node.description}</p>
                    </>
                  ) : (
                    <p className="text-sm leading-relaxed text-mist">
                      {fine
                        ? "Hover a component to inspect it. Drag to rotate the environment."
                        : "Tap a component, or pick one from the list below."}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Accessible component index */}
          <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {groups.map((g) => (
              <div key={g.label} className="bg-charcoal/90 p-4">
                <p className="mb-2 text-xs text-dim">{g.label}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {g.ids.map((id) => {
                    const I = icons[id];
                    const on = shown === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          aria-pressed={pinned === id}
                          onClick={() => setPinned(pinned === id ? null : id)}
                          onPointerEnter={() => fine && setActive(id)}
                          onPointerLeave={() => fine && setActive(null)}
                          onFocus={() => setActive(id)}
                          onBlur={() => setActive(null)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            on
                              ? "border-sky/60 bg-sky/10 text-snow"
                              : "border-line text-mist hover:text-snow"
                          }`}
                        >
                          <I size={13} aria-hidden /> {infraById[id].name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* keep the full node list available to assistive tech */}
      <ul className="sr-only">
        {infraNodes.map((n) => (
          <li key={n.id}>
            {n.name} ({n.service}): {n.description}
          </li>
        ))}
      </ul>
    </section>
  );
}
