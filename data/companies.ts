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

export const companies: Company[] = [
  {
    name: "Datadog",
    logo: "/companies/datadog.svg",
    href: "https://www.datadoghq.com",
  },
  {
    name: "Okta",
    logo: "/companies/okta.svg",
    href: "https://www.okta.com",
  },
  // Full-bleed 7:1 wordmark (no padding), so it gets a wider box than the
  // padded ar21-style logos to sit at a similar optical weight.
  {
    name: "JPMorganChase",
    logo: "/companies/jpmc.svg",
    href: "https://www.jpmorganchase.com",
    className: "w-44",
  },
  // Full-bleed stacked lockup (glyph over wordmark); slightly shorter box so
  // it doesn't tower over the padded single-line wordmarks.
  {
    name: "ControlPlane",
    logo: "/companies/controlplane.png",
    href: "https://control-plane.io",
    className: "h-12",
  },
];
