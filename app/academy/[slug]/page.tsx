import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import { getAllLessonSlugs, getLessonBySlug } from "@/lib/academy";
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
  return getAllLessonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const lesson = getLessonBySlug(slug);
    return {
      title: lesson.title,
      description: lesson.description,
      alternates: { canonical: `/academy/${slug}` },
      openGraph: {
        title: lesson.title,
        description: lesson.description,
        type: "article",
        publishedTime: lesson.date,
        images: [{ url: "/logo.png" }],
      },
    };
  } catch {
    return { title: "Lesson Not Found" };
  }
}

export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;

  let lesson;
  try {
    lesson = getLessonBySlug(slug);
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source: lesson.content,
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
        { name: "Academy", href: "/academy" },
        { name: lesson.title, href: `/academy/${slug}` },
      ]} />
      <main className="pt-24 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-6">
            <Link
              href="/academy"
              className="hover:text-foreground transition-colors"
            >
              Academy
            </Link>
            <span>/</span>
            <span className="text-muted/60 truncate">{lesson.title}</span>
          </div>

          <header className="border-b border-border pb-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted border border-border px-1.5 py-0.5">
                {lesson.difficulty}
              </span>
              {lesson.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/academy/tags/${encodeURIComponent(tag.toLowerCase())}`}
                  className="text-xs font-mono text-muted hover:text-foreground transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-tight mb-4 leading-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-4">
              {lesson.description}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-muted">
              <span>{lesson.duration}</span>
              <span>by {lesson.author}</span>
            </div>
          </header>

          <article>{content}</article>
        </div>
      </main>
      <Footer />
    </>
  );
}
