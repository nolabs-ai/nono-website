"use client";

import { TextScramble } from "@/components/hero/TextScramble";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-12 px-6">
      <div className="max-w-4xl mx-auto w-full text-center">
        <h1 className="sr-only">
          Ephemeral micro sandboxes for AI agents, with zero setup and zero latency.
        </h1>
        <div
          aria-hidden="true"
          className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 text-foreground font-mono leading-none"
        >
          <TextScramble text="nono" delay={200} scrambleDuration={1000} glitch />
        </div>
        <p
          aria-hidden="true"
          className="text-xl md:text-2xl font-semibold tracking-tight text-foreground max-w-2xl mx-auto leading-snug"
        >
          Ephemeral micro sandboxes for AI agents, with zero setup and zero latency.
        </p>
      </div>
    </section>
  );
}
