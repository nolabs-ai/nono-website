"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Github,
  ChevronDown,
  Lock,
  Undo2,
  ScrollText,
  Fingerprint,
  Shield,
  Code,
  FileCode,
  Globe,
  KeyRound,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DOCS_URL, REGISTRY_URL } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

interface DropdownItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
  external?: boolean;
  bold?: boolean;
}

const sandboxDropdown: DropdownItem[] = [
  {
    href: "/os-sandbox",
    label: "OS Sandbox",
    description: "Kernel isolation for Linux, macOS & Windows",
    icon: Lock,
  },
  {
    href: "/python-sandbox",
    label: "Python Sandbox",
    description: "Isolate Python AI agents",
    icon: Code,
  },
  {
    href: "/node-sandbox",
    label: "Node.js Sandbox",
    description: "Isolate Node.js AI agents",
    icon: FileCode,
  },
  {
    href: "/go-sandbox",
    label: "Go Sandbox",
    description: "Isolate Go AI agents",
    icon: Code,
  },
];

const featuresDropdown: DropdownItem[] = [
  {
    href: "/os-sandbox",
    label: "Kernel Isolation",
    description: "Irrevocable allow-lists at the OS level",
    icon: Lock,
  },
  {
    href: "/undo",
    label: "Undo & Rollback",
    description: "Atomic filesystem snapshots",
    icon: Undo2,
  },
  {
    href: "/audit-trail",
    label: "Audit Trail",
    description: "Cryptographic audit log",
    icon: ScrollText,
  },
  {
    href: "/provenance",
    label: "Provenance",
    description: "Sigstore supply chain integrity",
    icon: Fingerprint,
  },
  {
    href: "/runtime-supervisor",
    label: "Runtime Supervisor",
    description: "Dynamic permission supervisor",
    icon: Shield,
  },
  {
    href: "/network-filtering",
    label: "Network Filtering",
    description: "Domain-level access control",
    icon: Globe,
  },
  {
    href: "/credential-injection",
    label: "Credential Injection",
    description: "Proxy-based secret management",
    icon: KeyRound,
  },
  {
    href: "/ghost-sessions",
    label: "Ghost Sessions",
    description: "Detachable session lifecycle",
    icon: Terminal,
  },
];

const navItems: NavItem[] = [
  { label: "Sandboxes", dropdown: sandboxDropdown },
  { label: "Features", dropdown: featuresDropdown },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: DOCS_URL, external: true },
  { label: "Registry", href: REGISTRY_URL, external: true, bold: true },
];

function DropdownMenu({ items }: { items: DropdownItem[] }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
      <div className="border border-border bg-background p-1 min-w-[260px]">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-3 px-3 py-2 hover:bg-surface transition-colors"
          >
            <item.icon
              size={14}
              className="text-muted mt-0.5 shrink-0"
              strokeWidth={1.5}
            />
            <div>
              <div className="text-xs font-mono font-medium text-foreground">
                {item.label}
              </div>
              <div className="text-xs text-muted">{item.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.href) return pathname === item.href;
    if (item.dropdown)
      return item.dropdown.some((d) => pathname === d.href);
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono font-bold text-lg text-foreground tracking-tight"
        >
          nono
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) =>
            item.dropdown ? (
              <div key={item.label} className="relative group">
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                    isActive(item)
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    size={12}
                    className="transition-transform group-hover:rotate-180"
                  />
                </button>
                <DropdownMenu items={item.dropdown} />
              </div>
            ) : item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                  item.bold
                    ? "font-bold text-foreground hover:text-muted-strong"
                    : isActive(item)
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                  item.bold
                    ? "font-bold text-foreground hover:text-muted-strong"
                    : isActive(item)
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        {/* Right actions */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://discord.gg/pPcjYzGvbS"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted hover:text-foreground transition-colors"
            aria-label="Discord"
          >
            <DiscordIcon size={16} />
          </a>
          <a
            href="https://github.com/always-further/nono"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-border text-foreground hover:bg-surface transition-colors"
          >
            <Github size={14} />
            GitHub
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-b border-border">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      setMobileExpanded(
                        mobileExpanded === item.label ? null : item.label,
                      )
                    }
                    className="flex items-center justify-between w-full py-2 text-xs font-mono uppercase tracking-wider text-muted hover:text-foreground transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className="pl-4 pb-2 flex flex-col gap-1">
                      {item.dropdown.map((d) => (
                        <Link
                          key={d.href}
                          href={d.href}
                          className="py-2 text-xs font-mono text-muted hover:text-foreground transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                    item.bold
                      ? "font-bold text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={`py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                    item.bold
                      ? "font-bold text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="flex items-center gap-4 pt-4 border-t border-border mt-2">
              <a
                href="https://discord.gg/pPcjYzGvbS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
              >
                <DiscordIcon size={18} />
              </a>
              <a
                href="https://github.com/always-further/nono"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors flex items-center gap-2 text-xs font-mono"
              >
                <Github size={16} />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
