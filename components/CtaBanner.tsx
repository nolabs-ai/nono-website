"use client";

import { GradientButton } from "@/components/ui/GradientButton";
import { DOCS_URL } from "@/lib/site";
import { ArrowRight } from "lucide-react";

interface CtaButton {
  label: string;
  href: string;
  external?: boolean;
}

interface CtaBannerProps {
  title?: string;
  description?: string;
  primary?: CtaButton;
  secondary?: CtaButton;
}

export default function CtaBanner({
  title = "Run your first agent in seconds",
  description = "Install nono, pull a signed profile, and launch your agent in a least-privilege sandbox. No daemon, no container, no VM. Open source under Apache-2.0.",
  primary = {
    label: "Get Started",
    href: `${DOCS_URL}/cli/getting_started/installation`,
    external: true,
  },
  secondary = {
    label: "Read the Docs",
    href: DOCS_URL,
    external: true,
  },
}: CtaBannerProps = {}) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto border border-border">
        <div className="py-16 px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-mono font-bold uppercase tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-muted max-w-xl mx-auto mb-8 text-sm leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <GradientButton
              href={primary.href}
              external={primary.external}
              size="lg"
            >
              {primary.label} <ArrowRight size={14} />
            </GradientButton>
            <GradientButton
              href={secondary.href}
              external={secondary.external}
              variant="outline"
              size="lg"
            >
              {secondary.label}
            </GradientButton>
          </div>
        </div>
      </div>
    </section>
  );
}
