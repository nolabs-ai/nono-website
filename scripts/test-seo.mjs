#!/usr/bin/env node

/**
 * SEO smoke test — runs against `next build` output (.next/server/app/*.html).
 * Usage: npm run build && node scripts/test-seo.mjs
 *
 * Tests enforce the SEO requirements documented in CLAUDE.md.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const BUILD_DIR = join(ROOT, '.next/server/app');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function readPage(pagePath, { required = false } = {}) {
  const filePath = join(BUILD_DIR, pagePath);
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf-8');
  }
  // Next.js 15 may output page.html instead of page/index.html
  const alt = filePath.replace(/\/index\.html$/, '.html');
  if (alt !== filePath && existsSync(alt)) {
    return readFileSync(alt, 'utf-8');
  }
  if (required) {
    assert(false, `${pagePath}: build output not found`);
  } else {
    console.error(`  SKIP: ${filePath} not found (run 'npm run build' first)`);
  }
  return null;
}

function testPage(name, pagePath, checks, options) {
  console.log(`\n${name} (${pagePath})`);
  const html = readPage(pagePath, options);
  if (!html) return;
  checks(html);
}

// ── Shared assertions ──

function assertBaseSEO(html, pageName) {
  assert(html.includes('rel="canonical"'), `${pageName}: missing canonical URL`);
  assert(html.includes('name="description"'), `${pageName}: missing meta description`);
}

function assertOG(html, pageName) {
  assert(html.includes('og:title'), `${pageName}: missing OG title`);
  assert(html.includes('og:description'), `${pageName}: missing OG description`);
  assert(html.includes('og:type'), `${pageName}: missing OG type`);
}

function assertArticleOG(html, pageName) {
  assertOG(html, pageName);
  assert(
    html.includes('article:published_time') || html.includes('publishedTime'),
    `${pageName}: missing article publishedTime`,
  );
}

function assertBreadcrumb(html, pageName) {
  assert(html.includes('"@type":"BreadcrumbList"'), `${pageName}: missing BreadcrumbList schema`);
}

function assertBlogPostSchema(html, pageName) {
  assert(html.includes('"@type":"Article"'), `${pageName}: missing Article schema`);
}

// ── Homepage ──

testPage('Homepage', 'index.html', (html) => {
  assertBaseSEO(html, 'Homepage');
  assert(html.includes('application/ld+json'), 'Homepage: missing JSON-LD structured data');
  assert(html.includes('"@type":"Organization"'), 'Homepage: missing Organization schema');
  assert(html.includes('"@type":"WebSite"'), 'Homepage: missing WebSite schema');
  assert(html.includes('"@type":"SoftwareApplication"'), 'Homepage: missing SoftwareApplication schema');
  assert(html.includes('name="keywords"'), 'Homepage: missing keywords meta');
  assertOG(html, 'Homepage');
  assert(html.includes('twitter:card'), 'Homepage: missing Twitter card');
}, { required: true });

// ── Infrastructure pages ──

const infraPages = [
  { name: 'Linux/MacOS Sandbox', path: 'os-sandbox/index.html' },
  { name: 'Undo & Rollback', path: 'undo/index.html' },
  { name: 'Audit Trail', path: 'audit-trail/index.html' },
  { name: 'Provenance', path: 'provenance/index.html' },
  { name: 'Runtime Supervisor', path: 'runtime-supervisor/index.html' },
];

for (const page of infraPages) {
  testPage(page.name, page.path, (html) => {
    assertBaseSEO(html, page.name);
    assertOG(html, page.name);
  }, { required: true });
}

// ── SDK pages ──

const sdkPages = [
  { name: 'Python SDK', path: 'python-sdk/index.html' },
  { name: 'TypeScript SDK', path: 'typescript-sdk/index.html' },
];

for (const page of sdkPages) {
  testPage(page.name, page.path, (html) => {
    assertBaseSEO(html, page.name);
    assertOG(html, page.name);
  }, { required: true });
}

// ── Talk resources page ──

testPage('OSS Talk Resources', 'oss/index.html', (html) => {
  assertBaseSEO(html, 'OSS Talk Resources');
  assertOG(html, 'OSS Talk Resources');
}, { required: true });

// ── Blog index ──

testPage('Blog Index', 'blog/index.html', (html) => {
  assertBaseSEO(html, 'Blog Index');
  assertOG(html, 'Blog Index');
}, { required: true });

// ── Blog posts (dynamic) ──

const blogBuildDir = join(BUILD_DIR, 'blog');
if (existsSync(blogBuildDir)) {
  const entries = readdirSync(blogBuildDir, { withFileTypes: true });
  const blogSlugs = [
    ...entries.filter((d) => d.isDirectory() && d.name !== 'tags').map((d) => d.name),
    ...entries.filter((d) => d.isFile() && d.name.endsWith('.html') && d.name !== 'index.html')
      .map((d) => d.name.replace('.html', '')),
  ];
  const uniqueBlogSlugs = [...new Set(blogSlugs)];

  for (const slug of uniqueBlogSlugs) {
    testPage(`Blog: ${slug}`, `blog/${slug}/index.html`, (html) => {
      assertBaseSEO(html, `Blog: ${slug}`);
      assertArticleOG(html, `Blog: ${slug}`);
      assertBlogPostSchema(html, `Blog: ${slug}`);
      assertBreadcrumb(html, `Blog: ${slug}`);
    });
  }
}

// ── Guides index ──

testPage('Guides Index', 'guides/index.html', (html) => {
  assertBaseSEO(html, 'Guides Index');
  assertOG(html, 'Guides Index');
}, { required: true });

// ── Guide pages (dynamic) ──

const guidesBuildDir = join(BUILD_DIR, 'guides');
if (existsSync(guidesBuildDir)) {
  const gEntries = readdirSync(guidesBuildDir, { withFileTypes: true });
  const guideSlugs = [
    ...gEntries.filter((d) => d.isDirectory()).map((d) => d.name),
    ...gEntries.filter((d) => d.isFile() && d.name.endsWith('.html') && d.name !== 'index.html')
      .map((d) => d.name.replace('.html', '')),
  ];
  const uniqueGuideSlugs = [...new Set(guideSlugs)];

  for (const slug of uniqueGuideSlugs) {
    testPage(`Guide: ${slug}`, `guides/${slug}/index.html`, (html) => {
      assertBaseSEO(html, `Guide: ${slug}`);
      assertOG(html, `Guide: ${slug}`);
      assertBreadcrumb(html, `Guide: ${slug}`);
    });
  }
}

// ── Academy index ──

testPage('Academy Index', 'academy/index.html', (html) => {
  assertBaseSEO(html, 'Academy Index');
  assertOG(html, 'Academy Index');
}, { required: true });

// ── Academy lessons (dynamic) ──

const academyBuildDir = join(BUILD_DIR, 'academy');
if (existsSync(academyBuildDir)) {
  const aEntries = readdirSync(academyBuildDir, { withFileTypes: true });
  const lessonSlugs = [
    ...aEntries.filter((d) => d.isDirectory() && d.name !== 'tags').map((d) => d.name),
    ...aEntries.filter((d) => d.isFile() && d.name.endsWith('.html') && d.name !== 'index.html')
      .map((d) => d.name.replace('.html', '')),
  ];
  const uniqueLessonSlugs = [...new Set(lessonSlugs)];

  for (const slug of uniqueLessonSlugs) {
    testPage(`Academy: ${slug}`, `academy/${slug}/index.html`, (html) => {
      assertBaseSEO(html, `Academy: ${slug}`);
      assertOG(html, `Academy: ${slug}`);
      assertBreadcrumb(html, `Academy: ${slug}`);
    });
  }
}

// ── Sitemap & robots.txt ──

console.log('\nSitemap');
const sitemapMeta = join(BUILD_DIR, 'sitemap.xml.meta');
const sitemapRoute = join(BUILD_DIR, 'sitemap.xml/route.js');
if (existsSync(sitemapMeta) || existsSync(sitemapRoute)) {
  passed++;
  console.log('  OK: sitemap.xml exists');
} else {
  failed++;
  console.error('  FAIL: sitemap.xml not found in build output');
}

console.log('\nrobots.txt');
const robotsMeta = join(BUILD_DIR, 'robots.txt.meta');
const robotsRoute = join(BUILD_DIR, 'robots.txt/route.js');
if (existsSync(robotsMeta) || existsSync(robotsRoute)) {
  passed++;
  console.log('  OK: robots.txt exists');
} else {
  failed++;
  console.error('  FAIL: robots.txt not found in build output');
}

// ── Content frontmatter validation ──

function validateFrontmatter(dir, type, requiredFields) {
  const contentDir = join(ROOT, 'content', dir);
  if (!existsSync(contentDir)) return;

  console.log(`\n${type} frontmatter`);
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

  for (const file of files) {
    const raw = readFileSync(join(contentDir, file), 'utf-8');
    const { data } = matter(raw);

    for (const field of requiredFields) {
      assert(
        data[field] !== undefined && data[field] !== '',
        `${type}/${file}: missing required frontmatter field "${field}"`,
      );
    }

    if (data.description) {
      const len = data.description.length;
      if (len < 50 || len > 200) {
        console.warn(`  WARN: ${type}/${file}: description is ${len} chars (aim for 120-160)`);
      }
    }
  }
}

validateFrontmatter('blog', 'Blog', ['title', 'date', 'description', 'author', 'tags']);
validateFrontmatter('guides', 'Guides', ['title', 'date', 'description']);
validateFrontmatter('academy', 'Academy', ['title', 'date', 'description', 'author', 'tags', 'difficulty', 'duration']);

// ── Summary ──

console.log(`\n${'─'.repeat(40)}`);
console.log(`SEO tests: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
