import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isVercelPreview = process.env.VERCEL_ENV === "preview";
const vercelLiveSources = isVercelPreview
  ? ["https://vercel.live", "https://*.vercel.live"]
  : [];

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://eu.i.posthog.com https://eu-assets.i.posthog.com ${vercelLiveSources.join(" ")}`.trim(),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self'",
      `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://eu.i.posthog.com https://eu-assets.i.posthog.com ${vercelLiveSources.join(" ")}`.trim(),
      `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com ${vercelLiveSources.join(" ")}`.trim(),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
];

const docsSecurityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    // Mintlify docs CSP reference:
    // https://www.mintlify.com/docs/deploy/csp-configuration
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://eu.i.posthog.com https://eu-assets.i.posthog.com ${vercelLiveSources.join(" ")}`.trim(),
      "style-src 'self' 'unsafe-inline' https://d4tuoctqmanu0.cloudfront.net https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://mintcdn.com https://*.mintcdn.com https://d3gk2c5xim1je2.cloudfront.net https://cdn.jsdelivr.net https://mintlify.s3.us-west-1.amazonaws.com",
      "font-src 'self' https://cdn.jsdelivr.net https://d4tuoctqmanu0.cloudfront.net https://fonts.googleapis.com",
      `connect-src 'self' https://www.google-analytics.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://api.mintlifytrieve.com https://*.mintlify.dev https://*.mintlify.com https://d1ctpt7j8wusba.cloudfront.net https://mintcdn.com https://*.mintcdn.com https://leaves.mintlify.com ${vercelLiveSources.join(" ")}`.trim(),
      `frame-src 'self' https://*.mintlify.dev ${vercelLiveSources.join(" ")}`.trim(),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
];

const docsHostMatch = [{ type: "host" as const, value: "docs.nono.sh" }];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/blog/*": ["./content/blog/**/*.mdx", "./public/nono-square.svg"],
  },
  async headers() {
    return [
      {
        source: "/docs",
        headers: docsSecurityHeaders,
      },
      {
        source: "/docs/:path*",
        headers: docsSecurityHeaders,
      },
      {
        source: "/:path((?!docs(?:/|$)).*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/docs",
        has: docsHostMatch,
        destination: "https://nono.sh/docs",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        has: docsHostMatch,
        destination: "https://nono.sh/docs/:path*",
        permanent: true,
      },
      {
        source: "/",
        has: docsHostMatch,
        destination: "https://nono.sh/docs",
        permanent: true,
      },
      {
        source: "/:path*",
        has: docsHostMatch,
        destination: "https://nono.sh/docs/:path*",
        permanent: true,
      },
      {
        source: "/linux-sandbox",
        destination: "/os-sandbox",
        permanent: true,
      },
      {
        source: "/book",
        destination: "https://calendar.app.google/hPpdjdGoreaTP7cZA",
        permanent: false,
      },
      {
        source:
          "/:path((?!docs(?:/|$)|blog(?:/|$)|os-sandbox(?:/|$)|python-sandbox(?:/|$)|node-sandbox(?:/|$)|go-sandbox(?:/|$)|undo(?:/|$)|audit-trail(?:/|$)|provenance(?:/|$)|runtime-supervisor(?:/|$)|network-filtering(?:/|$)|credential-injection(?:/|$)|ghost-sessions(?:/|$)|python-sdk(?:/|$)|typescript-sdk(?:/|$)|go-sdk(?:/|$)|cli(?:/|$)|registry(?:/|$)|guides(?:/|$)|academy(?:/|$)|mintlify-assets(?:/|$)|_next(?:/|$)|api(?:/|$)|opengraph-image$|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|.*\\.[^/]+$).+)",
        destination: "/docs/:path",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/docs/sitemap.xml",
        destination: "https://alwaysfurther.mintlify.dev/docs/sitemap.xml",
      },
      {
        source: "/docs",
        destination: "https://alwaysfurther.mintlify.dev/docs",
      },
      {
        source: "/docs/:match*",
        destination: "https://alwaysfurther.mintlify.dev/docs/:match*",
      },
      {
        source: "/mintlify-assets/:match*",
        destination: "https://alwaysfurther.mintlify.dev/mintlify-assets/:match*",
      },
    ];
  },
};

export default nextConfig;
