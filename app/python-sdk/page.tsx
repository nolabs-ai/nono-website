import { SdkPageLayout } from "@/components/sdk/SdkPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Shield, Search, Undo2, Network, FileCode } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python SDK - Runtime Safety for Python AI Agents",
  description:
    "Kernel-level sandboxing, network filtering, credential injection, and filesystem snapshots for Python AI agents with nono-py.",
  alternates: { canonical: "/python-sdk" },
  openGraph: {
    title: "Python SDK - Runtime Safety for Python AI Agents",
    description:
      "Kernel-level sandboxing, network filtering, credential injection, and filesystem snapshots for Python AI agents with nono-py.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

const sandboxCode = `import nono_py as nono

# Define capabilities — deny by default
caps = nono.CapabilitySet()
caps.allow_path("/project", nono.AccessMode.READ_WRITE)
caps.allow_file("/home/user/.gitconfig", nono.AccessMode.READ)
caps.block_network()

# Apply sandbox (irrevocable — kernel-enforced)
nono.apply(caps)

# Your agent runs sandboxed from here
agent.run()`;

const execCode = `import nono_py as nono

# Run a command in a sandboxed child process
# Parent stays unsandboxed
caps = nono.CapabilitySet()
caps.allow_path("/project", nono.AccessMode.READ_WRITE)

result = nono.sandboxed_exec(
    caps,
    ["python", "untrusted_script.py"],
    cwd="/project",
    timeout_secs=30,
    env=[("API_KEY", "phantom-token-here")]
)

print(result.exit_code)
print(result.stdout.decode())`;

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

proxy = nono.ProxyConfig(
    allowed_hosts=["api.openai.com"],
    routes=[route]
)

handle = nono.start_proxy(proxy)
print(f"Proxy on port {handle.port}")
print(handle.env_vars())       # {"HTTP_PROXY": "..."}
print(handle.credential_env_vars())  # phantom tokens

# Drain audit events after the session
events = handle.drain_audit_events()
handle.shutdown()`;

const snapshotCode = `import nono_py as nono

# Snapshot the working directory before agent execution
exclusions = nono.ExclusionConfig(
    use_gitignore=True,
    exclude_patterns=["node_modules", ".next", "__pycache__"]
)

mgr = nono.SnapshotManager("/project", exclusions)
mgr.create_baseline()

# ... agent runs and modifies files ...

mgr.create_incremental()
diff = mgr.compute_restore_diff()

for change in diff:
    print(f"{change.change_type}: {change.path}")

# Roll back everything the agent changed
mgr.restore_to(snapshot_number=0)`;

const queryCode = `import nono_py as nono

# Dry-run permission checks before applying
caps = nono.CapabilitySet()
caps.allow_path("/project", nono.AccessMode.READ_WRITE)

ctx = nono.QueryContext(caps)

result = ctx.query_path("/etc/passwd", nono.AccessMode.READ)
print(result["status"])  # "denied"
print(result["reason"])  # explains why

net = ctx.query_network("api.openai.com", 443)
print(net["status"])  # "denied" (block_network not set, default)`;

export default function PythonSdkPage() {
  return (
    <SdkPageLayout
      language="Python"
      packageName="nono-py"
      installCommand="pip install nono-py"
      registryUrl="https://pypi.org/project/nono-py/"
      registryName="PyPI"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Secure execution model
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              nono-py provides Python bindings to nono&apos;s core Rust library
              via PyO3. The SDK exposes four key systems: kernel-level process
              sandboxing, a network proxy with credential injection, filesystem
              snapshots with rollback, and a policy engine for composable
              security profiles.
            </p>
            <p>
              Two sandboxing modes are available.{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono.apply(caps)
              </code>{" "}
              applies kernel-level restrictions to the current process &mdash;
              irrevocable, inherited by all child processes.{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono.sandboxed_exec()
              </code>{" "}
              runs a command in a sandboxed child process, leaving the parent
              unsandboxed. Use the first for self-sandboxing agents; use the
              second for orchestrators that need to spawn isolated workloads.
            </p>
            <p>
              Full type stubs are included ({" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                py.typed
              </code>
              ) &mdash; mypy, pyright, and IDE autocompletion work out of the
              box.
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Lock size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Kernel-Level Sandbox
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Apply irrevocable filesystem restrictions via{" "}
            <a
              href="https://landlock.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              Landlock
            </a>{" "}
            (Linux and
            Windows) or Seatbelt (macOS). Define per-path access modes &mdash; read, write,
            read-write. Everything not explicitly allowed is denied at the
            kernel level.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue" hoverable>
          <Network
            size={20}
            className="text-accent-blue mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Network Proxy &amp; Credential Injection
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Domain-filtered outbound access with per-route credential injection.
            Supports header, URL path, query parameter, and basic auth injection
            modes. Real API keys stay outside the sandbox &mdash; only phantom
            tokens enter the process.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Undo2 size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Filesystem Snapshots
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Content-addressable snapshots with Merkle roots. Create baselines
            before agent execution, compute diffs after, and roll back to any
            previous state. Respects{" "}
            <code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              .gitignore
            </code>{" "}
            patterns and custom exclusions.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue" hoverable>
          <FileCode
            size={20}
            className="text-accent-blue mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Sandboxed Child Processes
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Run untrusted code in a sandboxed child process via{" "}
            <code className="px-1 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              sandboxed_exec()
            </code>
            . The parent stays unsandboxed. Set working directory, timeout,
            and environment variables. Captures stdout and stderr as bytes.
          </p>
        </GlassCard>

        <InfraCodeBlock
          code={sandboxCode}
          language="python"
          filename="sandbox.py"
        />
        <InfraCodeBlock
          code={execCode}
          language="python"
          filename="sandboxed_exec.py"
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
        />

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            Core API
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "CapabilitySet",
                desc: "Builder for filesystem and network rules. allow_path(), allow_file(), block_network(), platform_rule(). Irrevocable after apply().",
              },
              {
                icon: Search,
                title: "QueryContext",
                desc: "Dry-run permission checks. query_path() and query_network() test whether access would be allowed before applying the sandbox.",
              },
              {
                icon: Shield,
                title: "Policy",
                desc: "Load and resolve JSON security profiles. Built-in groups (python_runtime, node_runtime) expand to platform-specific paths. Composable and version-controlled.",
              },
              {
                icon: Network,
                title: "ProxyConfig",
                desc: "Network proxy with domain allowlists, per-route credential injection (header, URL, query param, basic auth), and audit event streaming.",
              },
              {
                icon: Undo2,
                title: "SnapshotManager",
                desc: "Content-addressable filesystem snapshots. Baseline, incremental, compute diffs, restore to any point. Merkle root verification.",
              },
              {
                icon: FileCode,
                title: "sandboxed_exec()",
                desc: "Run a command in a sandboxed child process. Set cwd, timeout, env vars. Parent process remains unsandboxed for orchestration.",
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

        <InfraCodeBlock
          code={queryCode}
          language="python"
          filename="query.py"
          className="md:col-span-2"
        />
      </div>
    </SdkPageLayout>
  );
}
