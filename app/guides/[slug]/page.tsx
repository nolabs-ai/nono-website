import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import { getAllGuideSlugs, getGuideBySlug } from "@/lib/guides";
import { getMdxComponents } from "@/lib/mdx-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import BreadcrumbSchema from "@/components/structured-data/BreadcrumbSchema";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const guide = getGuideBySlug(slug);
    return {
      title: guide.title,
      description: guide.description,
      alternates: { canonical: `/guides/${slug}` },
      openGraph: {
        title: guide.title,
        description: guide.description,
        type: "article",
        publishedTime: guide.date,
        images: [{ url: "/logo.png" }],
      },
    };
  } catch {
    return { title: "Guide Not Found" };
  }
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;

  let guide;
  try {
    guide = getGuideBySlug(slug);
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source: guide.content,
    components: getMdxComponents(),
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkUnwrapImages],
        rehypePlugins: [rehypeSlug],
      },
      parseFrontmatter: true,
    },
  });

  return (
    <>
      <Header />
      <BreadcrumbSchema items={[
        { name: "Guides", href: "/guides" },
        { name: guide.title, href: `/guides/${slug}` },
      ]} />
      <main className="pt-24 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-6">
            <Link
              href="/guides"
              className="hover:text-foreground transition-colors"
            >
              Guides
            </Link>
            <span>/</span>
            <span className="text-muted/60 truncate">{guide.title}</span>
          </div>

          <header className="border-b border-border pb-8 mb-8">
            <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-tight mb-4 leading-tight">
              {guide.title}
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-4">
              {guide.description}
            </p>
            <span className="text-xs font-mono text-muted">
              {guide.readingTime}
            </span>
          </header>

          <article>{content}</article>
        </div>
      </main>
      <Footer />
    </>
  );
}
