import { InfraPageLayout } from "@/components/infrastructure/InfraPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, KeyRound, Workflow } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Runtime Supervisor - Dynamic Permission Expansion",
  description:
    "Dynamic permission expansion via seccomp-notify on Linux. Approve, deny, or inject credentials at runtime without restarting the agent.",
  alternates: { canonical: "/runtime-supervisor" },
  openGraph: {
    title: "Runtime Supervisor - Dynamic Permission Expansion",
    description:
      "Dynamic permission expansion via seccomp-notify on Linux. Approve, deny, or inject credentials at runtime without restarting the agent.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

const relatedPages = [
  {
    href: "/os-sandbox",
    label: "OS Sandbox",
    description: "Kernel-level filesystem isolation",
  },
  {
    href: "/undo",
    label: "Undo & Rollback",
    description: "Atomic filesystem snapshots",
  },
  {
    href: "/guides/runtime-governance-ai",
    label: "Guide: Runtime Governance",
    description: "Policy, audit, and compliance",
  },
];

const supervisorCode = `# Enable supervised mode with capability expansion
$ nono run --supervised --allow ~/projects/myapp -- claude

# Combine with credential injection via reverse proxy
$ nono run --supervised \\
    --allow ~/projects/myapp \\
    --credential openai \\
    --credential anthropic \\
    -- claude

# Or inject credentials as environment variables
$ nono run --supervised \\
    --allow ~/projects/myapp \\
    --env-credential openai_api_key,anthropic_api_key \\
    -- claude`;

const ipcCode = `# Agent requests access to a new file
# nono intercepts via seccomp-notify on openat/openat2

[nono] Agent requests: FILE_WRITE ~/projects/other/config.yaml

  Approve? [y/N/always] y

[nono] Expanding sandbox to include:
  ~/projects/other/config.yaml (write)
  Session-scoped. Will not persist after session ends.

# seccomp-notify passes the file descriptor directly
# via SCM_RIGHTS - no retry logic needed in the agent.`;

export default function RuntimeSupervisorPage() {
  return (
    <InfraPageLayout
      title="Dynamic Permission Expansion"
      tagline="Runtime Supervisor"
      description="Approve, deny, or inject credentials at runtime. On Linux, seccomp-notify intercepts system calls and enables transparent file descriptor passing so agents access new resources without retry logic."
      relatedPages={relatedPages}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Beyond static sandboxes
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              A static sandbox defines permissions upfront: the agent can access
              these files, these network hosts, these commands. But real-world
              agent workflows are dynamic. An agent might discover it needs to
              read a configuration file in a sibling project, or access a new API
              endpoint it was not originally granted.
            </p>
            <p>
              The runtime supervisor sits between the agent and the kernel
              sandbox, intercepting requests that would otherwise be denied. It
              presents the request to the human operator (via terminal prompt,
              webhook, or API) and, if approved, dynamically expands the sandbox
              scope for that session. The expansion is session-scoped and does
              not persist after the agent exits.
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Shield size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            seccomp-notify on Linux
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            On Linux, nono uses seccomp-notify to intercept system calls that
            would violate the sandbox. The supervisor receives the intercepted
            syscall, prompts for approval, and if granted, passes the file
            descriptor directly to the agent process. The agent does not need
            retry logic &mdash; the syscall completes transparently.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue" hoverable>
          <KeyRound
            size={20}
            className="text-accent-blue mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Credential Injection
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Secrets are loaded from the system keystore (macOS Keychain, Linux
            Secret Service) and injected via a reverse proxy
            (<code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">--credential</code>)
            or as environment variables
            (<code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">--env-credential</code>).
            The reverse proxy approach ensures the agent never sees raw API tokens.
          </p>
        </GlassCard>

        <InfraCodeBlock
          code={supervisorCode}
          language="bash"
          filename="terminal"
        />
        <InfraCodeBlock code={ipcCode} language="bash" filename="terminal" />

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            Supervisor Capabilities
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Workflow,
                title: "File Expansion",
                desc: "Dynamically grant access to new files and directories. Pattern-based rules constrain what the supervisor can approve.",
              },
              {
                icon: Workflow,
                title: "Network Expansion",
                desc: "Approve connections to new hosts at runtime. Denied by default, approved per-session with optional domain pattern matching.",
              },
              {
                icon: Workflow,
                title: "Command Approval",
                desc: "Approve execution of commands not in the original allow-list. Session-scoped approval with full audit trail logging.",
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
