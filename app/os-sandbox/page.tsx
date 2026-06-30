import { InfraPageLayout } from "@/components/infrastructure/InfraPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import { DOCS_URL } from "@/lib/site";
import { Lock, Layers } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OS Sandbox - Kernel-Level Isolation for AI Agents",
  description:
    "How nono uses Landlock, Seatbelt, and WSL2 to create irrevocable, kernel-enforced sandboxes for AI agents on Linux, macOS, and Windows.",
  alternates: { canonical: "/os-sandbox" },
  openGraph: {
    title: "OS Sandbox - Kernel-Level Isolation for AI Agents",
    description:
      "How nono uses Landlock, Seatbelt, and WSL2 to create irrevocable, kernel-enforced sandboxes for AI agents on Linux, macOS, and Windows.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

const relatedPages = [
  {
    href: "/runtime-supervisor",
    label: "Runtime Supervisor",
    description: "Dynamic permission expansion via IPC",
  },
  {
    href: "/audit-trail",
    label: "Audit Trail",
    description: "Cryptographic session logging",
  },
  {
    href: "/guides/safe-ai-agent-execution",
    label: "Guide: Safe AI Agent Execution",
    description: "End-to-end walkthrough",
  },
];

const quickStartCode = `# Install
brew install nono

# Sandbox Claude Code — kernel-enforced filesystem isolation
nono run --profile claude-code --allow-cwd -- claude

# Sandbox any process with default-deny filesystem
nono run --allow-cwd -- python my_agent.py

# Add network filtering — only LLM API endpoints allowed
nono run --allow-cwd --network-profile minimal -- python my_agent.py

# Inject credentials from keychain (real keys never enter the sandbox)
nono run --allow-cwd --credential openai -- python my_agent.py`;

const policyCode = `{
  "meta": {
    "name": "claude-code",
    "version": "1.0.0",
    "description": "Anthropic Claude Code CLI agent"
  },
  "security": {
    "groups": ["node_runtime", "python_runtime", "rust_runtime"]
  },
  "filesystem": {
    "allow": ["$HOME/.claude"],
    "read_file": ["$HOME/.gitconfig"]
  },
  "network": { "block": false },
  "workdir": { "access": "readwrite" },
  "undo": {
    "exclude_patterns": ["node_modules", ".next", "target"]
  },
  "interactive": true
}`;

const bannerCode = `$ nono run --allow-cwd --allow-domain llmapi -- agent

  ▄█▄   nono v0.7.0
 ▀▄^▄▀  - Halo Nono!

Capabilities:
  Filesystem:
    /Users/user/.claude [read+write] (dir)
    /Users/user/.local/share/claude [read] (dir)
    /Users/user/.claude.json [read+write] (file)
    /Users/user/.gitconfig [read] (file)
    /Users/user/dev/myproject [read+write] (dir)
    + 45 system/group paths (use -v to show)
  Network:
    outbound: proxy (localhost:0)

Supervised mode: child sandboxed, parent manages network proxy.

Applying Kernel sandbox protections.`;

const profileOverrideCode = `{
  "meta": {
    "name": "no-docker",
    "version": "1.0.0"
  },
  "extends": "claude-code",
  "policy": {
    "add_deny_access": ["/var/run/docker.sock"],
    "add_deny_commands": [
      "docker", "docker-compose", "podman", "kubectl"
    ]
  },
  "filesystem": {
    "allow": ["$HOME/.docker"]
  },
  "network": {
    "allow_domain": ["registry.hub.docker.com"],
    "credentials": ["openai", "anthropic"]
  }
}`;

export default function OsSandboxPage() {
  return (
    <InfraPageLayout
      title="Kernel-Level Isolation for AI Agents"
      tagline="Runtime Isolation"
      description="nono uses Landlock (Linux and Windows/WSL2) and Seatbelt (macOS) to create irrevocable, kernel-enforced allow-lists. No root, no containers, no overhead."
      relatedPages={relatedPages}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main explanation */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Why kernel-level sandboxing
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              AI coding agents run as your user, with access to everything you
              have: SSH keys, cloud credentials, source code across every
              project. Traditional sandboxing approaches like Docker or VMs
              introduce significant overhead &mdash; a daemon, image management,
              networking configuration, and volume mounts just to let an agent
              edit a file.
            </p>
            <p>
              nono takes a different approach. On Linux, it uses{" "}
              <strong className="text-foreground">Landlock LSM</strong> to
              restrict filesystem access at the kernel level. On macOS, it uses{" "}
              <strong className="text-foreground">Seatbelt</strong> (the same
              sandbox framework behind every App Store application). Both
              mechanisms are irrevocable once applied &mdash; the sandbox cannot
              be loosened, only tightened.
            </p>
            <p>
              This means zero runtime overhead after sandbox initialization, no
              root privileges required, and automatic inheritance by all child
              processes. The AI agent and every subprocess it spawns are
              structurally unable to access anything outside the allow-list.
            </p>
          </div>
        </GlassCard>

        {/* Threat model */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            What agents can actually reach
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              When a coding agent runs as your user, it inherits your full
              filesystem access. That includes your{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.ssh
              </code>{" "}
              directory, cloud credential files like{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.aws/credentials
              </code>{" "}
              and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.config/gcloud
              </code>
              , any{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                .env
              </code>{" "}
              files sitting in project roots, and every source repository you
              have checked out locally.
            </p>
            <p>
              A compromised dependency, a prompt injection in a document the
              agent reads, or simply a poorly scoped task can turn an otherwise
              well-intentioned agent into an exfiltration path. The agent
              doesn&apos;t need to be malicious. It just needs to be running
              with access it shouldn&apos;t have.
            </p>
            <p>
              This is the threat nono addresses at the structural level. The
              allow-list isn&apos;t a filter that inspects what the agent tries
              to do. It&apos;s a kernel rule that makes operations outside the
              allow-list physically impossible to execute. The difference
              matters: filters can be bypassed through obfuscation, encoding, or
              unexpected syscall sequences. Kernel enforcement cannot.
            </p>
          </div>
        </GlassCard>

        {/* Getting started */}
        <InfraCodeBlock
          code={quickStartCode}
          language="bash"
          filename="getting-started.sh"
          className="md:col-span-2"
        />

        {/* Linux: Landlock LSM */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Linux: Landlock LSM
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              <a
                href="https://landlock.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover transition-colors"
              >
                Landlock
              </a>{" "}
              is a Linux Security Module introduced in kernel 5.13.
              Unlike AppArmor or SELinux, which require root privileges and
              system-wide policy configuration, Landlock can be applied by any
              unprivileged process to restrict its own capabilities. This makes
              it a natural fit for sandboxing agent processes without touching
              system configuration.
            </p>
            <p>
              The core model is a ruleset of allowed operations on specific
              paths. Rules are applied per-thread and inherited by all children.
              Once applied, the ruleset cannot be loosened, only tightened
              further. This irrevocability is by design: the kernel provides no
              mechanism to expand access after the sandbox is active.
            </p>
            <p>
              nono targets Landlock ABI v5, which covers filesystem read, write,
              execute, and directory operations. On kernels that don&apos;t
              support the target ABI, nono degrades gracefully, applying the
              highest supported ABI version and logging a warning. This means
              agents still run in environments with older kernels, with
              progressively weaker but still meaningful restrictions.
            </p>
            <p>
              The practical implication: when nono calls{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ruleset.restrict_self()
              </code>
              , the agent process and every subprocess it spawns are bound by
              the filesystem allow-list at the kernel level. There is no way
              for a subprocess to escape into the parent&apos;s broader access
              scope.
            </p>
          </div>
        </GlassCard>

        {/* macOS: Seatbelt */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            macOS: Seatbelt
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              On macOS, nono uses Seatbelt, the same sandboxing framework Apple
              uses to isolate every App Store application. Seatbelt has been
              part of macOS since 10.5 and is the platform&apos;s authoritative
              process-level isolation mechanism.
            </p>
            <p>
              Seatbelt profiles are written in a Scheme-like policy language.
              When nono initialises on macOS, it generates a Seatbelt profile
              from the JSON allow-list configuration and applies it to the
              current process using{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                sandbox_init
              </code>
              . Like Landlock, the profile is irrevocable once applied.
            </p>
            <p>
              The generated profile allows read and write access to the declared
              paths, blocks access to everything else, and respects any network
              proxy configuration in the profile. The result is behaviourally
              equivalent to the Linux implementation: the agent can only reach
              what the profile explicitly permits.
            </p>
          </div>
        </GlassCard>

        {/* Windows: WSL2 */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Windows: WSL2
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              On Windows, nono runs inside WSL2 and applies Landlock enforcement
              to the Linux kernel that powers it. WSL2 runs a real Linux kernel
              (currently 6.6), so Landlock&apos;s filesystem isolation works
              natively. Your Windows filesystem is accessible via{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                /mnt/c
              </code>{" "}
              and subject to the same kernel-enforced allow-lists as any Linux
              path.
            </p>
            <p>
              nono detects WSL2 at runtime using kernel-controlled indicators
              (not environment variables, which can be spoofed) and
              automatically adjusts its feature set. Most features work
              identically to native Linux. A small number of advanced features
              are unavailable due to WSL2 kernel limitations:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>
                <strong className="text-foreground">Capability elevation</strong>{" "}
                via seccomp notify is disabled (WSL2 kernel bug). nono warns and
                continues without it.
              </li>
              <li>
                <strong className="text-foreground">Credential proxy enforcement</strong>{" "}
                defaults to fail-secure. Profiles can opt in via the{" "}
                <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                  wsl2_proxy_policy
                </code>{" "}
                field when credential injection is needed without full network
                lockdown.
              </li>
              <li>
                <strong className="text-foreground">Per-port network rules</strong>{" "}
                require Landlock ABI v4+, which will be available when the WSL2
                kernel upgrades.
              </li>
            </ul>
            <p>
              Overall feature parity is 84%. Filesystem isolation, network
              allowlists, profiles, undo, and audit trail all work. The
              limitations are clearly surfaced via{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono setup --check-only
              </code>{" "}
              which reports the WSL2 feature matrix.
            </p>
          </div>
        </GlassCard>

        {/* Composable policy */}
        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Layers size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Composable JSON Profiles
          </h3>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Define exactly what an agent can access with declarative JSON
            profiles. Built-in security groups cover language runtimes, cache
            directories, and editor integrations. Profiles are
            version-controlled alongside your code.
          </p>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            See profile reference &rarr;
          </a>
        </GlassCard>

        {/* Live output */}
        <InfraCodeBlock
          code={bannerCode}
          language="bash"
          filename="terminal"
          className="md:col-span-1"
        />

        {/* Code examples */}
        <InfraCodeBlock
          code={policyCode}
          language="json"
          filename="profiles/claude-code.json"
          className="md:col-span-1"
        />
        <InfraCodeBlock
          code={profileOverrideCode}
          language="json"
          filename="profiles/no-docker.json"
          className="md:col-span-1"
        />

        {/* Security groups and profile composition */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Security groups and profile composition
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              Profiles are built from two layers: security groups, which are
              maintained by nono and cover common runtime requirements, and
              explicit path declarations for project-specific access.
            </p>
            <p>
              Security groups like{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                node_runtime
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                python_runtime
              </code>
              , and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                rust_runtime
              </code>{" "}
              grant read access to the paths those toolchains actually need:
              binary directories, cache paths, package manager directories, and
              editor integration files. Using groups means profiles stay concise
              and are maintained as toolchain layouts change, rather than
              requiring manual path auditing for every new project.
            </p>
            <p>
              Explicit path declarations cover the project directory, any
              additional config files the agent needs, and any paths that fall
              outside the standard groups. The{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                $HOME
              </code>{" "}
              and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                $CWD
              </code>{" "}
              variables are expanded at runtime, making profiles portable across
              machines and team members.
            </p>
            <p>
              Profiles are version-controlled alongside the code they protect.
              That means sandbox policy gets the same review process as
              everything else: diffs in pull requests, history in git, and the
              ability to tighten or audit access over time.
            </p>
          </div>
        </GlassCard>

        {/* Comparison: kernel sandboxing vs alternatives */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Kernel sandboxing vs the alternatives
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              The choice of isolation mechanism involves real tradeoffs. Here is
              how kernel-level sandboxing compares to the approaches most teams
              reach for first.
            </p>
            <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
              Containers (Docker, Podman)
            </h3>
            <p>
              Containers are designed for service isolation, not single-process
              sandboxing. Running an agent in a container requires a daemon, an
              image, volume mount configuration, and typically a rebuild cycle
              when the agent needs access to a new path. Startup adds latency
              that matters in interactive coding sessions. Volume mounts are
              coarse: giving the container access to a project directory usually
              means giving it access to more than intended.
            </p>
            <p>
              Containers also provide weaker isolation than their reputation
              suggests. A misconfigured volume mount, a privileged flag, or a
              container escape vulnerability can expose the host. They are
              useful for many things, but the overhead-to-isolation ratio is
              poor for sandboxing a single process.
            </p>
            <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
              Virtual machines
            </h3>
            <p>
              VMs provide strong isolation but at significant cost: boot time,
              memory overhead, and the operational burden of managing images.
              For interactive agent workflows, the round-trip to a VM for every
              file operation is impractical. VMs solve a different problem to
              what nono addresses.
            </p>
            <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
              Application-level sandboxes and policy filters
            </h3>
            <p>
              Some agent frameworks implement their own access controls in
              userspace, intercepting filesystem calls before they reach the OS.
              These approaches have a fundamental limitation: they are enforced
              by the same process they are meant to constrain. A bug in the
              agent, a crafted input, or an unexpected code path can bypass an
              application-level policy in ways that kernel enforcement cannot be
              bypassed.
            </p>
            <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
              Kernel-level sandboxing
            </h3>
            <p>
              nono&apos;s approach has a different tradeoff profile.
              Initialisation takes a few milliseconds. After that, enforcement
              is zero-overhead because it happens in the kernel, not in a
              monitoring process. There is no daemon, no image, no volume
              configuration. The agent runs as a normal process. The sandbox is
              simply a set of kernel rules that say which paths the process is
              allowed to touch.
            </p>
            <p>
              The limitation worth being honest about: kernel sandboxing
              controls filesystem and network access but does not provide the
              memory isolation of a VM. For the threat model of a coding agent
              with excessive filesystem access, it is the right tool. For
              complete process isolation between mutually untrusted workloads, a
              VM remains appropriate.
            </p>
          </div>
        </GlassCard>

        {/* Key properties */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            Key Properties
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: "Irrevocable",
                desc: "Once applied, the sandbox cannot be loosened. Only tightened.",
              },
              {
                icon: Lock,
                title: "Unprivileged",
                desc: "No root, no capabilities, no suid binaries required.",
              },
              {
                icon: Lock,
                title: "Inherited",
                desc: "Child processes automatically inherit the sandbox restrictions.",
              },
              {
                icon: Lock,
                title: "Zero Overhead",
                desc: "Kernel-level enforcement. No runtime performance cost after init.",
              },
            ].map((item) => (
              <div key={item.title}>
                <item.icon
                  size={16}
                  className="text-accent mb-2"
                  strokeWidth={1.5}
                />
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </InfraPageLayout>
  );
}
