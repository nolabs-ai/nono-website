import { SdkPageLayout } from "@/components/sdk/SdkPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Shield, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TypeScript SDK - Runtime Safety for TypeScript AI Agents",
  description:
    "Enforce kernel-level filesystem isolation from TypeScript with nono-ts. Landlock on Linux and Windows, Seatbelt on macOS.",
  alternates: { canonical: "/typescript-sdk" },
  openGraph: {
    title: "TypeScript SDK - Runtime Safety for TypeScript AI Agents",
    description:
      "Enforce kernel-level filesystem isolation from TypeScript with nono-ts. Landlock on Linux and Windows, Seatbelt on macOS.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

const quickStart = `import { CapabilitySet, AccessMode, apply } from 'nono-ts';

// Define capabilities
const caps = new CapabilitySet();
caps.allowPath('/project', AccessMode.ReadWrite);
caps.allowFile('/home/user/.gitconfig', AccessMode.Read);
caps.blockNetwork(); // deny all outbound connections

// Apply sandbox (irrevocable)
apply(caps);

// Your agent code runs here, fully sandboxed
await agent.run();`;

const queryCode = `import {
  CapabilitySet, AccessMode, QueryContext,
  isSupported, supportInfo
} from 'nono-ts';

// Check platform support
const info = supportInfo();
console.log(info.platform, info.details);

// Build capabilities and dry-run check
const caps = new CapabilitySet();
caps.allowPath('/project', AccessMode.ReadWrite);

const ctx = new QueryContext(caps);
const result = ctx.queryPath('/etc/passwd', AccessMode.Read);
console.log(result.status); // "denied"
console.log(result.reason); // explains why`;

export default function TypeScriptSdkPage() {
  return (
    <SdkPageLayout
      language="TypeScript"
      packageName="nono-ts"
      installCommand="npm install nono-ts"
      registryUrl="https://www.npmjs.com/package/nono-ts"
      registryName="npm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Secure execution model
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              The TypeScript SDK provides native N-API bindings to nono&apos;s core
              Rust library. When you call{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                apply(caps)
              </code>
              , the SDK applies kernel-level{" "}
              <a
                href="https://landlock.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover transition-colors"
              >
                Landlock
              </a>{" "}
              rules (Linux) or Seatbelt
              profiles (macOS) to the Node.js process. The sandbox is irrevocable
              and inherited by all child processes.
            </p>
            <p>
              This works with any Node.js runtime &mdash; standard Node, Bun, or
              Deno. The native bindings load the correct platform-specific
              library automatically. Use{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                QueryContext
              </code>{" "}
              to dry-run permission checks before applying the sandbox, and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                SandboxState
              </code>{" "}
              to serialize and restore capability sets.
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Lock size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Type-Safe API
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Full TypeScript type definitions with strict mode support. The
            CapabilitySet builder pattern catches policy errors at compile time.
            All async operations return properly typed Promises.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue" hoverable>
          <Shield
            size={20}
            className="text-accent-blue mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Runtime Compatibility
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Works with Node.js 18+, Bun, and Deno. The native N-API bindings
            load platform-specific libraries automatically. ESM and CJS module
            formats are both supported.
          </p>
        </GlassCard>

        <InfraCodeBlock
          code={quickStart}
          language="typescript"
          filename="sandbox.ts"
        />
        <InfraCodeBlock
          code={queryCode}
          language="typescript"
          filename="query.ts"
        />

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            SDK Capabilities
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "CapabilitySet",
                desc: "Builder pattern for defining filesystem access, network blocking, and command rules. Irrevocable after apply().",
              },
              {
                icon: Search,
                title: "QueryContext",
                desc: "Dry-run permission checks against a capability set. Test whether a path or network access would be allowed before applying.",
              },
              {
                icon: Shield,
                title: "SandboxState",
                desc: "Serialize and deserialize capability sets to JSON. Persist sandbox configurations or transfer them between processes.",
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
    </SdkPageLayout>
  );
}
