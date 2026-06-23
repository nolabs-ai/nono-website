import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RelatedInfraPages } from "./RelatedInfraPages";
import { GradientButton } from "@/components/ui/GradientButton";
import { DOCS_URL } from "@/lib/site";

interface RelatedPage {
  href: string;
  label: string;
  description: string;
}

interface InfraPageLayoutProps {
  title: string;
  tagline: string;
  description: string;
  children: React.ReactNode;
  relatedPages: RelatedPage[];
}

export function InfraPageLayout({
  title,
  tagline,
  description,
  children,
  relatedPages,
}: InfraPageLayoutProps) {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-muted mb-4">
              {tagline}
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-mono font-bold uppercase tracking-tight mb-4 max-w-3xl">
              {title}
            </h1>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </section>

        <div className="h-px bg-border mx-6 max-w-6xl lg:mx-auto" />

        {/* Content */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">{children}</div>
        </section>

        {/* Related pages */}
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <RelatedInfraPages pages={relatedPages} />
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-mono font-bold uppercase tracking-tight mb-4">
              Get started with nono
            </h2>
            <p className="text-sm text-muted mb-8">
              Runtime safety infrastructure that works on macOS, Linux, Windows, and in CI.
            </p>
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
