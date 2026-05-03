import Image from "next/image";
import Link from "next/link";
import { Github, BookOpen, Scale } from "lucide-react";
import { DOCS_URL, REGISTRY_URL } from "@/lib/site";

const DiscordIcon = ({ size = 18 }: { size?: number }) => (
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

interface FooterColumn {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

const columns: FooterColumn[] = [
  {
    title: "Sandboxes",
    links: [
      { label: "OS Sandbox", href: "/os-sandbox" },
      { label: "Python Sandbox", href: "/python-sandbox" },
      { label: "Node.js Sandbox", href: "/node-sandbox" },
      { label: "Go Sandbox", href: "/go-sandbox" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "Kernel Isolation", href: "/os-sandbox" },
      { label: "Undo & Rollback", href: "/undo" },
      { label: "Audit Trail", href: "/audit-trail" },
      { label: "Provenance", href: "/provenance" },
      { label: "Runtime Supervisor", href: "/runtime-supervisor" },
      { label: "Network Filtering", href: "/network-filtering" },
      { label: "Credential Injection", href: "/credential-injection" },
      { label: "Ghost Sessions", href: "/ghost-sessions" },
    ],
  },
  {
    title: "SDKs",
    links: [
      { label: "CLI", href: "/cli" },
      { label: "Python", href: "/python-sdk" },
      { label: "TypeScript", href: "/typescript-sdk" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Docs", href: DOCS_URL, external: true },
      { label: "Registry", href: REGISTRY_URL, external: true },
      {
        label: "GitHub",
        href: "https://github.com/always-further/nono",
        external: true,
      },
      {
        label: "Discord",
        href: "https://discord.gg/pPcjYzGvbS",
        external: true,
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-foreground mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-muted hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs font-mono text-muted hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
          <div className="flex items-center gap-4">
            <a
              href="https://alwaysfurther.ai?utm_source=nono-sh"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/af-logo.svg"
                alt="Always Further"
                width={120}
                height={24}
              />
            </a>
          </div>

          <div className="flex items-center gap-4 text-muted">
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Docs"
              title="Docs"
            >
              <BookOpen size={16} />
            </a>
            <a
              href="https://github.com/always-further/nono"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
              title="GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href="https://discord.gg/pPcjYzGvbS"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Discord"
              title="Discord"
            >
              <DiscordIcon size={16} />
            </a>
            <a
              href="https://github.com/always-further/nono/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Apache-2.0 License"
              title="Apache-2.0 License"
            >
              <Scale size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
