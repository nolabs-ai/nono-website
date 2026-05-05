import { InfraPageLayout } from "@/components/infrastructure/InfraPageLayout";
import { InfraCodeBlock } from "@/components/infrastructure/InfraCodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, ShieldCheck, Package } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Go Sandbox - Isolate Go AI Agents with Kernel-Level Enforcement",
  description:
    "Sandbox Go programs and AI agents with kernel-enforced isolation. nono-go provides CGo bindings to apply irrevocable Landlock (Linux, Windows/WSL2) and Seatbelt (macOS) sandboxes from Go.",
  alternates: { canonical: "/go-sandbox" },
  openGraph: {
    title: "Go Sandbox - Isolate Go AI Agents with Kernel-Level Enforcement",
    description:
      "Sandbox Go programs and AI agents with kernel-enforced isolation. nono-go provides CGo bindings to apply irrevocable Landlock (Linux, Windows/WSL2) and Seatbelt (macOS) sandboxes from Go.",
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
    href: "/go-sdk",
    label: "Go SDK",
    description: "CGo bindings for nono-go",
  },
  {
    href: "/python-sandbox",
    label: "Python Sandbox",
    description: "Isolate Python agents and pip installs",
  },
];

const cliCode = `# Sandbox a Go AI agent with read-write to the project
nono run --allow-cwd -- go run .

# Use the go-dev profile (includes go_runtime security group)
nono run --profile go-dev -- go run .

# Restrict network to LLM API endpoints only
nono run --allow-cwd --network-profile minimal -- ./my-agent

# Inject credentials from keychain (real keys never enter the sandbox)
nono run --allow-cwd --credential openai -- ./my-agent

# Sandbox go build and go test
nono run --profile go-dev --allow-cwd -- go build ./...
nono run --profile go-dev --allow-cwd -- go test ./...`;

const profileCode = `{
  "meta": {
    "name": "go-agent",
    "version": "1.0.0",
    "description": "Go AI agent with controlled access"
  },
  "security": {
    "groups": ["go_runtime"]
  },
  "filesystem": {
    "allow": ["$HOME/.cache/go-build"],
    "read_file": ["$HOME/.gitconfig"]
  },
  "network": {
    "network_profile": "minimal"
  },
  "workdir": { "access": "readwrite" },
  "interactive": false
}`;

const sdkCode = `package main

import (
	"errors"
	"fmt"
	"log"
	"github.com/always-further/nono-go"
)

func main() {
	// 1. Build a capability set
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

	// 2. Query permissions before applying (dry-run)
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

	// 3. Apply sandbox (irreversible)
	if err := nono.Apply(caps); err != nil {
		log.Fatal(err)
	}

	// 4. Error handling with sentinel accessors
	err = caps.AllowPath("/nonexistent", nono.AccessRead)
	if errors.Is(err, nono.ErrPathNotFound()) {
		fmt.Println("path does not exist")
	}
}`;

const stateCode = `package main

import (
	"fmt"
	"log"
	"github.com/always-further/nono-go"
)

func main() {
	caps := nono.New()
	if err := caps.AllowPath("/data", nono.AccessReadWrite); err != nil {
		log.Fatal(err)
	}
	if err := caps.SetNetworkMode(nono.NetworkBlocked); err != nil {
		log.Fatal(err)
	}

	// Serialize to JSON
	state, err := nono.StateFromCaps(caps)
	if err != nil {
		log.Fatal(err)
	}
	defer state.Close()

	jsonStr, err := state.ToJSON()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(jsonStr)

	// Restore from JSON
	restored, err := nono.StateFromJSON(jsonStr)
	if err != nil {
		log.Fatal(err)
	}
	defer restored.Close()

	caps2, err := restored.ToCaps()
	if err != nil {
		log.Fatal(err)
	}
	defer caps2.Close()
}`;

export default function GoSandboxPage() {
  return (
    <InfraPageLayout
      title="Go Sandbox for AI Agents"
      tagline="Go Isolation"
      description="Sandbox Go programs and AI agents at the kernel level. Use the nono CLI with the go_runtime security group, or embed nono-go directly into your Go application for programmatic control."
      relatedPages={relatedPages}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Why Go agents need kernel-level sandboxing
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              Go compiles to native binaries with full access to system calls.
              An AI agent written in Go can read any file, open any network
              connection, and spawn any subprocess the user can. Application-level
              restrictions are trivially bypassed by calling{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                syscall
              </code>
              {" "}directly.
            </p>
            <p>
              nono enforces isolation at the kernel level using Landlock (Linux
              and Windows/WSL2) and Seatbelt (macOS). The sandbox is irrevocable &mdash; once
              applied, it cannot be loosened, even by the sandboxed process
              itself. This applies to the process and all its children.
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverable>
          <Lock size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            CLI Sandboxing
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Use{" "}
            <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              nono run --profile go-dev
            </code>
            {" "}to sandbox any Go program. The{" "}
            <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              go_runtime
            </code>
            {" "}security group covers GOPATH, GOMODCACHE, and the Go toolchain
            paths. Everything else is denied by default.
          </p>
        </GlassCard>

        <GlassCard className="p-6" hoverable>
          <Package size={20} className="text-accent mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold mb-2 tracking-tight">
            Embedded SDK
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            The{" "}
            <Link href="/go-sdk" className="text-accent hover:underline">
              nono-go
            </Link>
            {" "}library provides CGo bindings to nono&apos;s Rust core. Self-sandbox
            your process with{" "}
            <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
              nono.Apply(caps)
            </code>
            . Static libraries for macOS (arm64, amd64) and Linux (amd64, arm64)
            are bundled. Requires Go 1.24+ and a C toolchain.
          </p>
        </GlassCard>

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            CLI sandboxing
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              The fastest way to sandbox a Go agent. The{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                go-dev
              </code>
              {" "}profile includes the{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                go_runtime
              </code>
              {" "}security group, which allows access to GOPATH, module cache,
              and the Go toolchain. Combine with network profiles and credential
              injection for production use.
            </p>
          </div>
        </GlassCard>

        <InfraCodeBlock
          code={cliCode}
          language="bash"
          filename="terminal"
          className="md:col-span-2"
        />

        <InfraCodeBlock
          code={profileCode}
          language="json"
          filename="profiles/go-agent.json"
          className="md:col-span-2"
        />

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Embedded SDK: nono-go
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              For programmatic control, embed{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono-go
              </code>
              {" "}directly into your Go application. Create a capability set with{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono.New()
              </code>
              , define allowed paths with{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                AllowPath()
              </code>
              {" "}and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                AllowFile()
              </code>
              {" "}(using{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono.AccessRead
              </code>
              {" "}or{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono.AccessReadWrite
              </code>
              ), control network with{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                SetNetworkMode()
              </code>
              , then call{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                nono.Apply(caps)
              </code>
              {" "}to lock it down irreversibly.
            </p>
          </div>
        </GlassCard>

        <InfraCodeBlock
          code={sdkCode}
          language="go"
          filename="main.go"
          className="md:col-span-2"
        />

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Serialize and restore state
          </h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                SandboxState
              </code>
              {" "}provides a JSON-serialisable snapshot of a capability set.
              Use{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                StateFromCaps()
              </code>
              {" "}to export and{" "}
              <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                StateFromJSON()
              </code>
              {" "}to restore. This is useful for persisting sandbox
              configurations or transferring them between processes.
            </p>
          </div>
        </GlassCard>

        <InfraCodeBlock
          code={stateCode}
          language="go"
          filename="state.go"
          className="md:col-span-2"
        />

        <GlassCard className="md:col-span-2 p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck
              size={24}
              className="text-accent shrink-0 mt-1"
              strokeWidth={1.5}
            />
            <div>
              <h3 className="text-lg font-semibold mb-2 tracking-tight">
                Error handling
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                All failing operations return{" "}
                <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                  *nono.Error
                </code>
                . Use{" "}
                <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                  errors.Is
                </code>
                {" "}with sentinel accessors like{" "}
                <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                  nono.ErrPathNotFound()
                </code>
                ,{" "}
                <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                  nono.ErrSandboxInit()
                </code>
                ,{" "}
                <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                  nono.ErrUnsupportedPlatform()
                </code>
                , and others to test for specific failure kinds. Note the{" "}
                <code className="px-1.5 py-0.5 rounded bg-code-bg border border-border font-mono text-xs">
                  ()
                </code>
                {" "}&mdash; each sentinel is a function call.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="md:col-span-2 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            Platform support
          </h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { platform: "macOS arm64", status: "Bundled" },
              { platform: "macOS amd64", status: "Bundled" },
              { platform: "Linux amd64", status: "Bundled" },
              { platform: "Linux arm64", status: "Bundled" },
            ].map((item) => (
              <div key={item.platform}>
                <h3 className="text-sm font-semibold mb-1">{item.platform}</h3>
                <p className="text-xs text-muted">{item.status}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </InfraPageLayout>
  );
}
