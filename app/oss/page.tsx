import Link from "next/link";
import { InfraPageLayout } from "@/components/infrastructure/InfraPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  AlertTriangle,
  ArrowRight,
  FileCheck,
  KeyRound,
  Network,
  ScrollText,
  Shield,
} from "lucide-react";
import type { Metadata } from "next";

const pageDescription =
  "Beyond the Sandbox: capability brokering for AI agents. Commands, feature pages, limits, and project links from the talk. nono is open source.";

export const metadata: Metadata = {
  title: "Beyond the Sandbox - Capability Brokering for AI Agents",
  description: pageDescription,
  alternates: { canonical: "/oss" },
  openGraph: {
    title: "Beyond the Sandbox - Capability Brokering for AI Agents",
    description: pageDescription,
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

const relatedPages = [
  {
    href: "/os-sandbox",
    label: "OS Sandbox",
    description: "Kernel-level isolation with Landlock and Seatbelt",
  },
  {
    href: "/runtime-supervisor",
    label: "Runtime Supervisor",
    description: "Dynamic permission expansion with human approval",
  },
  {
    href: "/guides/safe-ai-agent-execution",
    label: "Guide: Safe AI Agent Execution",
    description: "End-to-end walkthrough",
  },
];

const ideas = [
  {
    title: "Nobody breaches an agent. They borrow it.",
    body: "An agent inherits everything its user can reach: the working copy, the home directory, keys, tokens, and the open network. One prompt injection is enough to spend that authority. The sandbox is the wall; the attack goes around it, through what the agent was handed.",
  },
  {
    title: "Authority belongs to the action, not the agent.",
    body: "Grant each capability to the command that needs it, for as long as it needs it. In the demo, git reaches the SSH key through its own child envelope while the session itself is denied it. Anything unplanned goes to a human.",
  },
  {
    title: "Prevention is a stronger evidence class than detection.",
    body: "A denied request that never left the machine is a different kind of evidence from an alert about one that did. nono records both allowed and denied operations in a tamper-evident log the agent cannot write to.",
  },
];

const quickstartCode = `# Install (Homebrew, or: curl -fsSL https://nono.sh/install.sh | sh)
brew install nono

# See the boundary: run from a project folder, not your home directory
nono run --allow . -- cat ~/.ssh/config
# expect a denial: ~/.ssh is on nono's default deny list

# Run an agent under a signed registry profile
nono search opencode
nono run --profile nolabs-ai/opencode -- opencode

# Make the profile yours
nono profile init opencode --extends nolabs-ai/opencode`;

const layers = [
  {
    icon: KeyRound,
    title: "Capability brokering",
    body: "Access starts from a declared profile, enforced by the kernel before the agent starts. Credentials are injected by nono's proxy, so the agent holds a phantom token. On Linux, the supervisor can grant more at runtime, only with a human approval.",
    links: [
      { href: "/credential-injection", label: "Credential injection" },
      { href: "/runtime-supervisor", label: "Runtime supervisor" },
    ],
  },
  {
    icon: Network,
    title: "Network denial",
    body: "Network access is open by default. Allow the domains a task needs and the child is restricted to nono's proxy. Cloud metadata endpoints and link-local ranges stay denied whatever the profile says.",
    links: [{ href: "/network-filtering", label: "Network filtering" }],
  },
  {
    icon: ScrollText,
    title: "Tamper-evident audit",
    body: "Every run is recorded by default in a Merkle-committed log, written by the supervisor outside the sandbox. Change one event and verification fails. Signing the finished session is opt-in.",
    links: [{ href: "/audit-trail", label: "Audit trail" }],
  },
  {
    icon: FileCheck,
    title: "Provenance",
    body: "Instructions are inputs, not authority. Sign instruction files like AGENTS.md and CLAUDE.md with Sigstore, keyed or keyless. Unsigned or tampered files are denied before the agent starts.",
    links: [{ href: "/provenance", label: "Provenance" }],
  },
];

const limits = [
  "A sandbox bounds what a process can reach. It does not judge whether an allowed action is a good idea.",
  "A credential you grant through the proxy stays out of the sandbox, but the agent can still call the allowed API with it. Environment-variable injection puts the secret in the process environment.",
  "macOS Seatbelt cannot filter by TCP port. Network rules there are coarser than on Linux.",
  "Linux Landlock is strictly allow-list. It cannot carve a deny out of an allowed directory, so nono refuses to start rather than enforce that policy wrongly.",
  "Enforcement depends on the kernel: Linux 5.13+ for basic sandboxing, 6.2+ for full filesystem control, 6.7+ for TCP filtering. Windows runs through WSL2.",
  "nono is pre-1.0. APIs are stabilizing, and profile fields can still change between releases.",
];

const projectLinks = [
  {
    href: "https://github.com/nolabs-ai/nono/tree/main/neps",
    label: "Read and review NEPs",
  },
  {
    href: "https://github.com/nolabs-ai/nono/blob/main/SECURITY.md",
    label: "Report a vulnerability",
  },
  {
    href: "https://github.com/nolabs-ai/nono/blob/main/GOVERNANCE.md",
    label: "Governance and maintainers",
  },
  {
    href: "https://github.com/nolabs-ai/nono/blob/main/CONTRIBUTING.md",
    label: "Contributing guide",
  },
  { href: "https://github.com/nolabs-ai/nono/releases", label: "Releases" },
  { href: "https://discord.gg/pPcjYzGvbS", label: "Discord" },
];

export default function OssTalkPage() {
  return (
    <InfraPageLayout
      title="Beyond the Sandbox"
      tagline="Open source · Apache-2.0 · Talk resources"
      description="Capability brokering for AI agents. The ideas, the four layers, the limits, and how to run it yourself. nono is open source under Apache-2.0."
      relatedPages={relatedPages}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Three ideas from the talk
          </h2>
          <ol className="space-y-6">
            {ideas.map((idea, i) => (
              <li key={idea.title} className="flex gap-4">
                <span className="font-mono text-accent text-lg leading-7 shrink-0">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight mb-1">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {idea.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Try it in five minutes
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            No API key needed until you run an agent. The full walkthrough is
            in the{" "}
            <a href="https://nono.sh/docs/quickstart" className="text-accent">
              quickstart
            </a>
            , and the{" "}
            <Link href="/registry" className="text-accent">
              registry
            </Link>{" "}
            has signed profiles for the popular coding agents.
          </p>
          <InfraCodeBlock
            code={quickstartCode}
            language="bash"
            filename="terminal"
          />
        </GlassCard>

        {layers.map((layer) => (
          <GlassCard key={layer.title} className="p-6" hoverable>
            <layer.icon
              size={20}
              className="text-accent mb-4"
              strokeWidth={1.5}
            />
            <h3 className="text-lg font-semibold mb-2 tracking-tight">
              {layer.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-4">
              {layer.body}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {layer.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1 text-sm font-mono text-accent hover:text-accent-hover"
                >
                  {link.label}
                  <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </GlassCard>
        ))}

        <GlassCard className="md:col-span-2 p-8">
          <Shield size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            The kernel boundary underneath
          </h2>
          <p className="text-muted leading-relaxed">
            Every layer above sits on an irrevocable kernel sandbox: Landlock
            on Linux and WSL2, Seatbelt on macOS. No daemon, no container, no
            root. Child processes inherit the restrictions. The{" "}
            <Link href="/os-sandbox" className="text-accent">
              OS sandbox page
            </Link>{" "}
            covers how each platform enforces it.
          </p>
        </GlassCard>

        <GlassCard className="md:col-span-2 p-8">
          <AlertTriangle
            size={20}
            className="text-accent mb-4"
            strokeWidth={1.5}
          />
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            What nono does not do
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Read this before you trust the rest.
          </p>
          <ul className="text-sm text-muted leading-relaxed space-y-3 list-disc pl-5">
            {limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Check the project, not just the tool
          </h2>
          <div className="text-muted leading-relaxed space-y-4 mb-6">
            <p>
              Design changes that are large or security-consequential go
              through a nono Enhancement Proposal (NEP): new capability types,
              changes to enforcement semantics or the policy model, new
              sandbox backends, and breaking profile or CLI changes.
            </p>
            <p>
              Every NEP carries a mandatory Security Considerations section,
              reviewed against the security model before it can be accepted,
              and proposals are reviewed as public pull requests before any
              implementation starts.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-border divide-y sm:divide-y-0 divide-border">
            {projectLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-6 py-4 border-border sm:border-b hover:bg-surface transition-colors group"
              >
                <span className="text-sm font-mono text-foreground">
                  {link.label}
                </span>
                <ArrowRight
                  size={14}
                  className="text-muted group-hover:text-accent transition-colors shrink-0"
                />
              </a>
            ))}
          </div>
        </GlassCard>
      </div>
    </InfraPageLayout>
  );
}
