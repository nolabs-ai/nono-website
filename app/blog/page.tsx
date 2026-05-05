import { getAllPosts, getAllTags } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { TagBadge } from "@/components/blog/TagBadge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GradientButton } from "@/components/ui/GradientButton";
import { DOCS_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI agent security blog — notes from the runtime",
  description:
    "Technical writing on AI agent security, OS-level sandboxing, runtime safety, and the engineering behind nono.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "AI agent security blog — notes from the runtime",
    description:
      "Technical writing on AI agent security, OS-level sandboxing, runtime safety, and the engineering behind nono.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const [featured, ...rest] = posts;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-muted mb-4">
              Blog
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-mono font-bold uppercase tracking-tight mb-4 max-w-3xl">
              Notes from the runtime
            </h1>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Technical writing on AI agent security, OS-level sandboxing,
              runtime safety, and the engineering behind nono.
            </p>
          </div>
        </section>

        <div className="h-px bg-border mx-6 max-w-6xl lg:mx-auto" />

        {/* Content */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} linked={true} />
                ))}
              </div>
            )}

            {posts.length === 0 ? (
              <p className="text-muted text-center py-20 font-mono text-sm">
                No posts yet.
              </p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {featured && <BlogCard post={featured} featured />}
                {rest.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-mono font-bold uppercase tracking-tight mb-4">
              Get started with nono
            </h2>
            <p className="text-sm text-muted mb-8">
              Runtime safety infrastructure that works on macOS, Linux,
              Windows, and in CI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GradientButton href={DOCS_URL} external>
                Read the Docs
              </GradientButton>
              <GradientButton
                variant="outline"
                href="https://github.com/always-further/nono"
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
