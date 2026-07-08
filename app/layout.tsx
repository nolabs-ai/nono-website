import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
import WebSiteSchema from "@/components/structured-data/WebSiteSchema";
import SoftwareApplicationSchema from "@/components/structured-data/SoftwareApplicationSchema";
import OrganizationSchema from "@/components/structured-data/OrganizationSchema";
import { FathomAnalytics } from "@/components/Fathom";

export const metadata: Metadata = {
  metadataBase: new URL("https://nono.sh"),
  title: {
    default: "Sandbox for AI Agents — Kernel-Level Isolation | nono",
    template: "%s | nono",
  },
  description:
    "capability-based, policy-governed runtime for AI agents, with kernel-enforced isolation, network filtering, immutable auditing, and atomic rollbacks for AI agents.",
  keywords: [
    "AI agent sandbox",
    "AI agent security",
    "OS-level isolation",
    "nono sandbox",
    "Claude Code sandbox",
    "AI coding agent security",
    "kernel sandboxing",
    "Seatbelt sandbox",
    "Landlock sandbox",
    "WSL2 sandbox",
    "secure AI agents",
    "network filtering proxy",
    "SSRF protection",
    "AI agent network security",
  ],
  icons: {
    icon: [
      { url: "/nono-square.svg", type: "image/svg+xml" },
    ],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Secure, capability-based runtime for AI agents | nono",
    description:
      "Capability-based agent runtime with fine-grained policies . Brokering access directly within the agent's operating context.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "nono - Capability-based, policy-governed runtime for AI agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sandbox for AI Agents — Kernel-Level Isolation | nono",
    description:
      "Kernel-enforced isolation, network filtering, immutable auditing, and atomic rollbacks for AI agents - built into the nono CLI and native SDKs.",
    site: "@alwaysfurtherAI",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
        <SoftwareApplicationSchema />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t)})()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable} ${inter.className} antialiased`}
      >
        <FathomAnalytics />
        {children}
      </body>
    </html>
  );
}
