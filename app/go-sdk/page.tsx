import { SdkPageLayout } from "@/components/sdk/SdkPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Shield, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Go SDK - Runtime Safety for Go AI Agents",
  description:
    "Enforce kernel-level filesystem isolation from Go with nono-go. Landlock on Linux and Windows, Seatbelt on macOS.",
  alternates: { canonical: "/go-sdk" },
  openGraph: {
    title: "Go SDK - Runtime Safety for Go AI Agents",
    description:
      "Enforce kernel-level filesystem isolation from Go with nono-go. Landlock on Linux and Windows, Seatbelt on macOS.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "nono" }],
  },
};

const quickStart = `package main

import (
	"log"
	"github.com/nolabs-ai/nono-go"
)

func main() {
	caps := nono.New()
	defer caps.Close()

	if err := caps.AllowPath("/home/user/data", nono.AccessRead); err != nil {
		log.Fatal(err)
	}
	if err := caps.AllowPath("/tmp", nono.AccessReadWrite); err != nil {
		log.Fatal(err)
	}
	if err := caps.SetNetworkMode(nono.NetworkBlocked); err != nil {
		log.Fatal(err)
	}

	// Irreversible — applies to this process and all children.
	if err := nono.Apply(caps); err != nil {
		log.Fatal(err)
	}
}`;

const queryCode = `package main

import (
	"fmt"
	"log"
	"github.com/nolabs-ai/nono-go"
)

func main() {
	caps := nono.New()
	if err := caps.AllowPath("/home/user/data", nono.AccessRead); err != nil {
		log.Fatal(err)
	}
	if err := caps.SetNetworkMode(nono.NetworkAllowAll); err != nil {
		log.Fatal(err)
	}

	qc, err := nono.NewQueryContext(caps)
	if err != nil {
		log.Fatal(err)
	}
	defer qc.Close()

	result, err := qc.QueryPath("/home/user/data/file.txt", nono.AccessRead)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(result.Status) // nono.QueryAllowed
}`;

export default function GoSdkPage() {
  return (
    <SdkPageLayout
      language="Go"
      packageName="nono-go"
      installCommand="go get github.com/nolabs-ai/nono-go"
      registryUrl="https://pkg.go.dev/github.com/nolabs-ai/nono-go"
      registryName="pkg.go.dev"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Secure execution model
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              The Go SDK provides CGo bindings to nono&apos;s core Rust library.
              When you call{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono.Apply(caps)
              </code>
              , the SDK applies kernel-level Landlock rules (Linux) or Seatbelt
              profiles (macOS) to the current process. The sandbox is irrevocable
              &mdash; it cannot be loosened after application. Static libraries
              for macOS (arm64, amd64) and Linux (amd64, arm64) are bundled in
              the repository.
            </p>
            <p>
              This means your Go AI agent and every subprocess it spawns operate
              within the defined capability set. Filesystem access is constrained
              at the kernel level, not by application-level checks that can be
              bypassed. Use{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                NewQueryContext
              </code>{" "}
              to dry-run permission checks and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                SandboxState
              </code>{" "}
              to serialize capability sets to JSON.
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple" hoverable>
          <Lock size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Filesystem Isolation
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Define per-path access modes (read, write, read-write) with
            fine-grained control. Only explicitly allowed paths are accessible
            &mdash; everything else is denied by default at the kernel level.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue" hoverable>
          <Shield
            size={20}
            className="text-accent-blue mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Static Binary Support
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Compiles to a single static binary with CGo bindings to nono&apos;s
            Rust core. No runtime dependencies beyond the kernel. Works with
            standard Go build tooling and cross-compilation.
          </p>
        </GlassCard>

        <InfraCodeBlock
          code={quickStart}
          language="go"
          filename="main.go"
        />
        <InfraCodeBlock
          code={queryCode}
          language="go"
          filename="query.go"
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
                desc: "Created via nono.New(). AllowPath(), AllowFile(), and SetNetworkMode() define access rules. Irrevocable after Apply().",
              },
              {
                icon: Search,
                title: "QueryContext",
                desc: "Created via NewQueryContext(caps). QueryPath() and QueryNetwork() dry-run permission checks. The capability set is cloned internally.",
              },
              {
                icon: Shield,
                title: "SandboxState",
                desc: "StateFromCaps() and StateFromJSON() serialize and deserialize capability sets. ToJSON() exports, ToCaps() restores.",
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
