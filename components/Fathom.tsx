"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as Fathom from "fathom-client";

function FathomTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_FATHOM_ID;
    if (!id) return;
    Fathom.load(id, { auto: false });
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (process.env.NEXT_PUBLIC_FATHOM_ID) {
      Fathom.trackPageview({ url: window.location.href });
    }

    if (!url.search) return;

    const strip = () => window.history.replaceState({}, "", url.pathname + url.hash);

    // If window.fathom is set, the CDN has already loaded and trackPageview
    // above ran synchronously — safe to strip immediately.
    const w = window as Window & { fathom?: unknown };
    if (w.fathom) {
      strip();
      return;
    }

    // Initial page load: fathom-client inserted a <script id="fathom-script">
    // with onload = flushQueue. Our listener fires after flushQueue, so after
    // Fathom has processed the queued trackPageview and read the UTMs.
    const script = document.getElementById("fathom-script");
    if (!script) {
      // Fathom disabled or script not yet in DOM — strip immediately.
      strip();
      return;
    }

    const timeout = setTimeout(strip, 3000);
    script.addEventListener("load", strip, { once: true });
    script.addEventListener("error", strip, { once: true });
    return () => {
      clearTimeout(timeout);
      script.removeEventListener("load", strip);
      script.removeEventListener("error", strip);
    };
  }, [pathname, searchParams]);

  return null;
}

export function FathomAnalytics() {
  return (
    <Suspense fallback={null}>
      <FathomTracker />
    </Suspense>
  );
}
