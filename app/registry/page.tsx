import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegistryGallery from "@/components/RegistryGallery";
import CtaBanner from "@/components/CtaBanner";
import { REGISTRY_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registry — Signed Profiles for AI Agents",
  description:
    "Browse the nono Registry — signed, scanned, and verified profiles, packs, and policies for sandboxing AI agents. Install with one command, publish your own.",
  alternates: { canonical: "/registry" },
  openGraph: {
    title: "Registry — Signed Profiles for AI Agents",
    description:
      "Browse the nono Registry — signed, scanned, and verified profiles, packs, and policies for sandboxing AI agents.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

export default function RegistryPage() {
  return (
    <>
      <Header />
      <main>
        <RegistryGallery />
        <CtaBanner
          title="Find a pack. Or publish your own."
          description="Signed, scanned, and verified packs for sandboxing AI agents — install with one command, or publish from your own GitHub repo."
          primary={{
            label: "Browse Registry",
            href: REGISTRY_URL,
            external: true,
          }}
          secondary={{
            label: "Publish a Pack",
            href: `${REGISTRY_URL}/publish`,
            external: true,
          }}
        />
      </main>
      <Footer />
    </>
  );
}
