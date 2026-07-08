import { expect, test } from "@playwright/test";

test("strips all query params from the address bar after tracking", async ({
  page,
}) => {
  await page.goto("/?utm_source=test&utm_medium=cpc&utm_campaign=launch", {
    waitUntil: "networkidle",
  });

  await expect
    .poll(() => page.url(), { timeout: 5000 })
    .not.toContain("utm_source=test");

  await expect
    .poll(() => page.url(), { timeout: 5000 })
    .not.toContain("utm_medium=cpc");

  await expect
    .poll(() => page.url(), { timeout: 5000 })
    .not.toContain("utm_campaign=launch");
});

test("leaves the URL unchanged when no query params are present", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const url = new URL(page.url());
  expect(url.search).toBe("");
});
