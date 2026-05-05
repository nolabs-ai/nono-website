"use client";

import { Shield, RotateCcw, FileCheck, Fingerprint, Eye } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Shield,
    title: "Kernel Isolation",
    description: "Landlock and Seatbelt enforce irrevocable allow-lists at the kernel level on Linux, macOS, and Windows.",
    href: "/os-sandbox",
  },
  {
    icon: RotateCcw,
    title: "Undo & Rollback",
    description: "Content-addressed snapshots capture filesystem state before every session.",
    href: "/undo",
  },
  {
    icon: FileCheck,
    title: "Audit Trail",
    description: "Merkle-tree-committed session logs with cryptographic integrity verification.",
    href: "/audit-trail",
  },
  {
    icon: Fingerprint,
    title: "Supply Chain Provenance",
    description: "Sigstore-backed signing ensures instruction files were authored by trusted identities.",
    href: "/provenance",
  },
  {
    icon: Eye,
    title: "Runtime Supervisor",
    description: "Dynamic permission expansion with approval workflows.",
    href: "/runtime-supervisor",
  },
];

export default function Pillars() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          badge="Infrastructure"
          title="Five layers of runtime safety"
          subtitle="Each layer builds on the previous, creating defense in depth for AI agent execution."
        />

        <div className="border border-border divide-y divide-border">
          {pillars.map((pillar, i) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="flex items-center gap-6 px-6 py-5 hover:bg-surface transition-colors group"
            >
              <span className="text-xs font-mono text-muted w-6 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <pillar.icon
                className="w-4 h-4 text-muted shrink-0"
                strokeWidth={1.5}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-mono font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted mt-0.5 hidden sm:block">
                  {pillar.description}
                </p>
              </div>
              <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
