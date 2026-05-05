import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { getMdxComponents } from "@/lib/mdx-components";
import { PostHeader } from "@/components/blog/PostHeader";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPostSchema from "@/components/structured-data/BlogPostSchema";
import BreadcrumbSchema from "@/components/structured-data/BreadcrumbSchema";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        publishedTime: post.date,
        authors: [post.author],
        tags: post.tags,
        images: post.image
          ? [{ url: post.image }]
          : [
              {
                url: `/blog/${slug}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
        images: post.image ? [post.image] : [`/blog/${slug}/opengraph-image`],
      },
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source: post.content,
    components: getMdxComponents(),
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkUnwrapImages],
        rehypePlugins: [rehypeSlug],
      },
      parseFrontmatter: true,
    },
  });

  const relatedPosts = getRelatedPosts(slug, post.tags);

  return (
    <>
      <Header />
      <BlogPostSchema post={post} />
      <BreadcrumbSchema items={[
        { name: "Blog", href: "/blog" },
        { name: post.title, href: `/blog/${slug}` },
      ]} />
      <main className="pt-24 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <PostHeader post={post} />

          <article className="mt-10">{content}</article>

          <div className="h-px bg-border mt-16 mb-12" />

          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
        </div>
      </main>
      <div className="h-px bg-border" />
      <Footer />
    </>
  );
}
