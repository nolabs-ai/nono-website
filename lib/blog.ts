import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost, BlogPostWithContent } from "@/types/blog";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(BLOG_DIR, filename);
      const source = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(source);
      const rt = readingTime(content);

      return {
        slug,
        title: data.title as string,
        seoTitle: data.seoTitle as string | undefined,
        date: data.date as string,
        description: data.description as string,
        author: data.author as string,
        authorRole: data.authorRole as string | undefined,
        tags: (data.tags as string[]) ?? [],
        image: data.image as string | undefined,
        readingTime: rt.text,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPostWithContent {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const rt = readingTime(content);

  return {
    slug,
    title: data.title as string,
    seoTitle: data.seoTitle as string | undefined,
    date: data.date as string,
    description: data.description as string,
    author: data.author as string,
    authorRole: data.authorRole as string | undefined,
    tags: (data.tags as string[]) ?? [],
    image: data.image as string | undefined,
    readingTime: rt.text,
    content: source,
  };
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set(posts.flatMap((p) => p.tags));
  return Array.from(tagSet).sort();
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((p) =>
    p.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()),
  );
}

export function getRelatedPosts(
  currentSlug: string,
  tags: string[],
  limit = 3,
): BlogPost[] {
  const all = getAllPosts().filter((p) => p.slug !== currentSlug);

  const scored = all.map((post) => ({
    post,
    score: post.tags.filter((t) => tags.includes(t)).length,
  }));

  return scored
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime(),
    )
    .slice(0, limit)
    .map((s) => s.post);
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
