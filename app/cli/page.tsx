import { InfraPageLayout } from "@/components/infrastructure/InfraPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Lock,
  Shield,
  Undo2,
  ScrollText,
  Network,
  Eye,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI - Sandbox Any Process with One Command",
  description:
    "The nono CLI wraps any process with kernel-enforced sandboxing, network filtering, credential injection, and atomic rollback. Install via Homebrew or cargo.",
  alternates: { canonical: "/cli" },
  openGraph: {
    title: "CLI - Sandbox Any Process with One Command",
    description:
      "The nono CLI wraps any process with kernel-enforced sandboxing, network filtering, credential injection, and atomic rollback. Install via Homebrew or cargo.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

const basicUsage = `# Sandbox a Python agent with default-deny filesystem
nono run --allow-cwd -- python my_agent.py

# Sandbox Claude Code with the built-in profile
nono run --profile claude-code --allow-cwd -- claude

# Restrict network to specific hosts
nono run --allow-cwd --network-profile minimal -- python my_agent.py

# Inject credentials from keychain (real keys never enter the sandbox)
nono run --allow-cwd --credential openai -- python my_agent.py`;

const profileExample = `{
  "meta": { "name": "my-agent", "version": "1.0.0" },
  "workdir": { "access": "readwrite" },
  "security": { "groups": ["python_runtime"] },
  "filesystem": {
    "read_file": ["/etc/ssl/cert.pem"],
    "write": ["/tmp"]
  },
  "policy": {
    "add_deny_access": [
      "$HOME/.ssh", "$HOME/.aws", "$HOME/.gnupg"
    ]
  },
  "network": {
    "allow_hosts": ["api.openai.com", "api.anthropic.com"],
    "credentials": ["openai", "anthropic"]
  }
}`;

const learnExample = `# Run sandboxed and save denied paths as a profile
nono run --allow-cwd -- python my_agent.py

# Check why a specific path would be blocked
nono why --path ~/.ssh/id_rsa --op read

# Verify an instruction file's signature
nono trust verify GEMINI.md --policy ./trust-policy.json`;

const relatedPages = [
  {
    href: "/os-sandbox",
    label: "OS Sandbox",
    description: "How Landlock and Seatbelt enforcement works under the hood",
  },
  {
    href: "/python-sandbox",
    label: "Python Sandbox",
    description: "Sandboxing Python AI agents with nono",
  },
  {
    href: "/node-sandbox",
    label: "Node.js Sandbox",
    description: "Sandboxing Node.js AI agents with nono",
  },
  {
    href: "/undo",
    label: "Undo & Rollback",
    description: "Atomic filesystem snapshots and session rollback",
  },
];

export default function CliPage() {
  return (
    <InfraPageLayout
      title="Sandbox any process with one command"
      tagline="nono CLI"
      description="The nono CLI wraps any process — AI agents, scripts, build tools — with kernel-enforced filesystem isolation, network filtering, credential injection, and atomic rollback. No code changes required."
      relatedPages={relatedPages}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Install</h2>
          <div className="text-muted leading-relaxed space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 px-4 py-3 border border-terminal-border bg-terminal-bg">
                <div className="text-xs text-terminal-text/50 mb-1">Homebrew</div>
                <code className="font-mono text-sm text-terminal-text">
                  brew install nono
                </code>
              </div>
              <div className="flex-1 px-4 py-3 border border-terminal-border bg-terminal-bg">
                <div className="text-xs text-terminal-text/50 mb-1">Cargo</div>
                <code className="font-mono text-sm text-terminal-text">
                  cargo install nono
                </code>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Lock size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Filesystem Isolation
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Default-deny filesystem access enforced by{" "}
            <a
              href="https://landlock.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              Landlock
            </a>{" "}
            (Linux and
            Windows) and Seatbelt (macOS). Only explicitly allowed paths are accessible.
            Sensitive directories like ~/.ssh and ~/.aws are blocked by default.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue" hoverable>
          <Network
            size={20}
            className="text-accent-blue mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Network Filtering
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Allowlist outbound connections by domain. Built-in profiles for
            common LLM providers. All other network access is blocked &mdash;
            no data exfiltration, no SSRF, no C2 callbacks.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Shield size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Credential Injection
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Real API keys stay in your system keychain. The sandboxed process
            receives phantom tokens that only work with a localhost proxy. Even
            if the process is compromised, there are no real credentials to
            steal.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue" hoverable>
          <Undo2
            size={20}
            className="text-accent-blue mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Atomic Rollback
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Every session is snapshotted before execution. Review what changed,
            then accept or roll back to the pre-session state. No partial
            writes, no corrupted state.
          </p>
        </GlassCard>

        <InfraCodeBlock
          code={basicUsage}
          language="bash"
          filename="basic-usage.sh"
        />

        <InfraCodeBlock
          code={profileExample}
          language="json"
          filename="my-agent-profile.json"
        />

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-4">
            Profiles &amp; Discovery
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              Profiles are JSON files that declare exactly what a process is
              allowed to do. Write them by hand or run a process under{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono run
              </code>
              , which reports every denied path and offers to save them to a
              profile. Built-in profiles are available for Claude Code, Codex,
              and other AI tools.
            </p>
          </div>
        </GlassCard>

        <InfraCodeBlock
          code={learnExample}
          language="bash"
          filename="advanced.sh"
        />

        <GlassCard className="p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            Key Features
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: Lock,
                title: "Kernel enforcement",
                desc: "Restrictions applied via Landlock/Seatbelt cannot be escalated from inside the process.",
              },
              {
                icon: Eye,
                title: "Trust verification",
                desc: "Cryptographically sign instruction files. Tampered files are rejected before the process starts.",
              },
              {
                icon: ScrollText,
                title: "Audit trail",
                desc: "Every action is logged in a tamper-evident, cryptographically chained audit log.",
              },
              {
                icon: Shield,
                title: "Built-in profiles",
                desc: "Pre-configured profiles for Claude Code, Codex, OpenCode, and other AI tools.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <item.icon
                  size={16}
                  className="text-accent mt-0.5 shrink-0"
                  strokeWidth={1.5}
                />
                <div>
                  <h3 className="text-sm font-semibold mb-0.5">{item.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </InfraPageLayout>
  );
}
