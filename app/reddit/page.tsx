import type { Metadata } from "next";
import RedditLanding from "@/components/reddit/RedditLanding";

export const metadata: Metadata = {
  title: "Sandbox Any AI Coding Agent in 3 Steps",
  description:
    "Install nono, search the registry for your agent, and run it inside a kernel-enforced sandbox. Zero setup, zero latency — try the live registry search.",
  alternates: { canonical: "/reddit" },
  openGraph: {
    title: "Sandbox Any AI Coding Agent in 3 Steps | nono",
    description:
      "Install nono, find your agent in the registry, and run it sandboxed. Zero setup, zero latency — with a live, interactive registry search.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

export default function RedditPage() {
  return <RedditLanding />;
}
