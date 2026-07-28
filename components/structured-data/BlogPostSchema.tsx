import type { BlogPost } from "@/types/blog";

interface BlogPostSchemaProps {
  post: BlogPost;
}

export default function BlogPostSchema({ post }: BlogPostSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Always Further",
      url: "https://nolabs.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://nono.sh/logo.png",
      },
    },
    image: post.image
      ? `https://nono.sh${post.image}`
      : "https://nono.sh/logo.png",
    url: `https://nono.sh/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://nono.sh/blog/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
