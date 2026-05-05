import { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { getAllGuides } from "@/lib/guides";
import { getAllLessons, getAllAcademyTags } from "@/lib/academy";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const tags = getAllTags();
  const guides = getAllGuides();
  const lessons = getAllLessons();
  const academyTags = getAllAcademyTags();

  const infraPages = [
    "os-sandbox",
    "undo",
    "audit-trail",
    "provenance",
    "runtime-supervisor",
    "network-filtering",
    "credential-injection",
    "ghost-sessions",
  ];

  const sandboxPages = ["python-sandbox", "node-sandbox", "go-sandbox"];

  const sdkPages = ["python-sdk", "typescript-sdk", "go-sdk", "cli"];

  return [
    {
      url: "https://nono.sh",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...infraPages.map((page) => ({
      url: `https://nono.sh/${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...sandboxPages.map((page) => ({
      url: `https://nono.sh/${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...sdkPages.map((page) => ({
      url: `https://nono.sh/${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: "https://nono.sh/registry",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://nono.sh/guides",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...guides.map((guide) => ({
      url: `https://nono.sh/guides/${guide.slug}`,
      lastModified: new Date(guide.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: "https://nono.sh/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `https://nono.sh/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: `https://nono.sh/blog/tags/${encodeURIComponent(tag.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    {
      url: "https://nono.sh/academy",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...lessons.map((lesson) => ({
      url: `https://nono.sh/academy/${lesson.slug}`,
      lastModified: new Date(lesson.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...academyTags.map((tag) => ({
      url: `https://nono.sh/academy/tags/${encodeURIComponent(tag.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
