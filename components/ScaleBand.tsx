import { ArrowRight } from "lucide-react";

export default function ScaleBand() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto border border-border px-8 py-14 text-center">
        <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-muted mb-5">
          At scale
        </span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 max-w-2xl mx-auto leading-snug">
          Want to operationalise and run at scale, or within your team?
        </h2>
        <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          Engineers at some of the largest tech companies in the world use nono as
          part of their workflows — and to run AI agents in production.
        </p>
        <a
          href="https://alwaysfurther.ai/design-partners"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm font-mono text-foreground hover:text-muted-strong transition-colors"
        >
          Talk to us about running at scale
          <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
}
