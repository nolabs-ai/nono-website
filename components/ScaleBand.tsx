import { Layers, Box, KeyRound, FileCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Pillar {
  icon: LucideIcon;
  title: string;
  description: string;
}

const pillars: Pillar[] = [
  {
    icon: Layers,
    title: "Composable policy",
    description:
      "Scalable JSON profiles that compose across teams and version-control alongside your code.",
  },
  {
    icon: Box,
    title: "Tool-specific sandboxing",
    description:
      "A sandbox tuned to each agent and tool — least privilege by default, not one blunt boundary.",
  },
  {
    icon: KeyRound,
    title: "Credential protection",
    description:
      "Secrets are injected at the boundary and never exposed to the agent. Zeroised on exit.",
  },
  {
    icon: FileCheck,
    title: "Fully auditable",
    description:
      "Every action lands in a cryptographic, tamper-evident audit trail you can verify.",
  },
];

export default function ScaleBand() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-muted mb-5">
          At scale
        </span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 max-w-3xl mx-auto leading-snug">
          Engineers at some of the world&rsquo;s largest tech companies run nono
          in production.
        </h2>
        <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          It scales from a single laptop to fleets of agents without changing the
          model — the same composable policy, per-tool sandboxing, credential
          protection, and fully auditable execution.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mt-10 grid sm:grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="bg-background px-5 py-6 flex flex-col gap-3"
          >
            <pillar.icon className="w-5 h-5 text-muted" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold tracking-tight">
              {pillar.title}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
