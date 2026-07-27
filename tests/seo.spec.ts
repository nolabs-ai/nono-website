import { expect, test, type Page } from "@playwright/test";

const BASE = "http://127.0.0.1:3000";

async function getMeta(page: Page, attr: string, value: string) {
  return page.getAttribute(`meta[${attr}="${value}"]`, "content");
}

test("sitemap.xml is accessible and contains nono URLs", async ({ page }) => {
  const response = await page.goto(`${BASE}/sitemap.xml`);
  expect(response?.status()).toBe(200);

  const body = await page.content();
  expect(body).toContain("<loc>");
  expect(body).toContain("https://nono.sh");
});

test("robots.txt is accessible and references the sitemap", async ({ page }) => {
  const response = await page.goto(`${BASE}/robots.txt`);
  expect(response?.status()).toBe(200);

  const body = await page.textContent("body");
  expect(body).toContain("Sitemap: https://nono.sh/sitemap.xml");
});

test.describe("Homepage SEO", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("has canonical URL", async ({ page }) => {
    const canonical = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canonical).toBeTruthy();
    expect(canonical).toBe("https://nono.sh");
  });

  test("has Organization, WebSite, and SoftwareApplication JSON-LD", async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const schemas = scripts.map((script) => JSON.parse(script));

    expect(schemas.some((schema) => schema["@type"] === "Organization")).toBe(true);
    expect(schemas.some((schema) => schema["@type"] === "WebSite")).toBe(true);
    expect(schemas.some((schema) => schema["@type"] === "SoftwareApplication")).toBe(true);
  });

  test("has core OG and Twitter metadata", async ({ page }) => {
    expect(await getMeta(page, "property", "og:title")).toBeTruthy();
    expect(await getMeta(page, "property", "og:description")).toBeTruthy();
    expect(await getMeta(page, "name", "twitter:card")).toBe("summary_large_image");
  });
});

test.describe("Blog SEO", () => {
  test("blog index has canonical and metadata", async ({ page }) => {
    await page.goto(`${BASE}/blog`);

    const canonical = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canonical).toContain("/blog");

    const description = await getMeta(page, "name", "description");
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);

    expect(await getMeta(page, "property", "og:title")).toBeTruthy();
    expect(await getMeta(page, "name", "twitter:card")).toBe("summary_large_image");
  });

  test("blog post has schema and canonical", async ({ page }) => {
    await page.goto(`${BASE}/blog`);
    const postLinkSelector = 'main a[href^="/blog/"]:not([href="/blog"]):not([href*="/tags/"])';
    await page.waitForSelector(postLinkSelector, { timeout: 10000 }).catch(() => null);

    const firstLink = await page.getAttribute(postLinkSelector, "href");
    test.skip(!firstLink, "No blog post links found on blog index.");

    await page.goto(`${BASE}${firstLink}`);

    const canonical = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canonical).toContain("/blog/");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const schemas = scripts.map((script) => JSON.parse(script));

    expect(schemas.some((schema) => schema["@type"] === "Article")).toBe(true);
    expect(schemas.some((schema) => schema["@type"] === "BreadcrumbList")).toBe(true);
  });
});

test("default OG image endpoint returns an image", async ({ page }) => {
  const response = await page.goto(`${BASE}/opengraph-image`);
  expect(response?.status()).toBe(200);
  expect(response?.headers()["content-type"]).toContain("image/");
});
