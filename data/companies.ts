/**
 * Companies shown on the homepage "At scale" logo row (see ScaleBand).
 *
 * To add a company:
 *   1. Drop its wordmark SVG (or PNG with a transparent background) into
 *      `public/companies/`. Colour doesn't matter — the logo is rendered as a
 *      theme-aware monochrome mask, so only the shape is used. Solid
 *      backgrounds DO matter: they'd render as a filled rectangle, so the
 *      background must be transparent.
 *   2. Add an entry below. Order here is the order shown on the page.
 *
 * The row is a centred, wrapping flex line, so it looks intentional with two
 * logos and scales to twenty without layout changes.
 *
 * Tip: vectorlogo.zone "ar21" SVGs all share a 120x60 box with consistent
 * padding, which keeps wordmarks optically balanced without per-logo tweaks.
 * For logos from other sources, use `className` to nudge the size.
 */
export interface Company {
  name: string;
  /** Path under /public, e.g. "/companies/datadog.svg" */
  logo: string;
  /** Company website, opened in a new tab. Omit to render non-clickable. */
  href?: string;
  /** Optional per-logo size override (Tailwind classes) for optical balance. */
  className?: string;
}

export const companies: Company[] = [];
