export interface BlogPost {
  slug: string;
  title: string;
  seoTitle?: string;
  date: string;
  description: string;
  author: string;
  authorRole?: string;
  tags: string[];
  image?: string;
  readingTime: string;
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}
