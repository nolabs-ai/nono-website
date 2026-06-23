import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GradientButton } from "@/components/ui/GradientButton";
import { DOCS_URL } from "@/lib/site";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SdkPageLayoutProps {
  language: string;
  packageName: string;
  installCommand: string;
  registryUrl: string;
  registryName: string;
  children: React.ReactNode;
}

export function SdkPageLayout({
  language,
  packageName,
  installCommand,
  registryUrl,
  registryName,
  children,
}: SdkPageLayoutProps) {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-muted mb-4">
              {language} SDK
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-mono font-bold uppercase tracking-tight mb-4 max-w-3xl">
              Runtime Safety for {language} AI Agents
            </h1>
            <p className="text-sm text-muted leading-relaxed max-w-2xl mb-6">
              Enforce kernel-level isolation, network filtering, and atomic
              rollbacks from {language} with{" "}
              <code className="px-1.5 py-0.5 bg-code-bg border border-code-border font-mono text-xs text-code-text">
                {packageName}
              </code>
              .
            </p>

            <div className="flex items-center gap-4">
              <div className="inline-flex items-center px-4 py-2.5 border border-terminal-border bg-terminal-bg">
                <code className="font-mono text-sm text-terminal-text">
                  {installCommand}
                </code>
              </div>
              <a
                href={registryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-muted hover:text-foreground transition-colors whitespace-nowrap"
              >
                {registryName} &rarr;
              </a>
            </div>
          </div>
        </section>

        <div className="h-px bg-border mx-6 max-w-6xl lg:mx-auto" />

        {/* Content */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">{children}</div>
        </section>

        {/* Related */}
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-foreground mb-6">
              Related
            </h2>
            <div className="border border-border divide-y divide-border">
              {[
                {
                  href: "/os-sandbox",
                  label: "OS Sandbox",
                  desc: "How kernel isolation works under the hood",
                  external: false,
                },
                {
                  href: DOCS_URL,
                  label: "API Reference",
                  desc: "Full SDK documentation",
                  external: true,
                },
                {
                  href: "/guides/safe-ai-agent-execution",
                  label: "Getting Started Guide",
                  desc: "End-to-end walkthrough",
                  external: false,
                },
              ].map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors group"
                  >
                    <div>
                      <h3 className="text-sm font-mono font-medium text-foreground">{item.label}</h3>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors group"
                  >
                    <div>
                      <h3 className="text-sm font-mono font-medium text-foreground">{item.label}</h3>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-mono font-bold uppercase tracking-tight mb-4">
              Ship safer agents today
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GradientButton href={DOCS_URL} external>Read the Docs</GradientButton>
              <GradientButton
                variant="outline"
                href="https://github.com/nolabs-ai/nono"
                external
              >
                View on GitHub
              </GradientButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
