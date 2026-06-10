"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { TextScramble } from "@/components/hero/TextScramble";

const steps = [
  {
    number: "01",
    title: "Install",
    code: "brew install nono",
  },
  {
    number: "02",
    title: "Configure",
    code: "nono profile show claude-code > my-profile.json",
  },
  {
    number: "03",
    title: "Run",
    code: "nono run --profile claude-code -- claude",
  },
  {
    number: "04",
    title: "Review",
    code: "nono audit list\nnono rollback show <session-id> --diff",
  },
];

export default function DeveloperWorkflow() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <AnimatedBackground variant="subtle" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <SectionHeader
          badge="Workflow"
          title="Four commands to secure your agent"
          subtitle="From install to audit in under a minute."
        />

        <div className="grid sm:grid-cols-2 gap-4">
          {steps.map((step) => (
            <GlassCard key={step.number} className="p-6 relative overflow-hidden">
              <div
                className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%)",
                  filter: "blur(20px)",
                }}
              />

              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-2xl font-bold font-mono tracking-tighter text-foreground/30"
                  style={{
                    textShadow: "0 0 25px rgba(255,255,255,0.06)",
                  }}
                >
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold tracking-tight">
                  <TextScramble text={step.title} />
                </h3>
              </div>

              {/* Terminal-style code block — NO scramble */}
              <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-[rgba(255,255,255,0.02)]">
                  <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.08)]" />
                  <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.08)]" />
                  <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.08)]" />
                </div>
                <pre className="bg-[rgba(0,0,0,0.3)] px-4 py-3 overflow-x-auto">
                  <code className="text-xs font-mono text-code-text leading-relaxed whitespace-pre">
                    <span className="text-foreground/30">$</span>{" "}
                    {step.code}
                  </code>
                </pre>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
