"use client";

import Image from "next/image";
import { useState } from "react";
import { Copy, Check, Download, Terminal } from "lucide-react";
import { DOCS_URL } from "@/lib/site";

/** A single click-anywhere-to-copy command row (always-dark). */
function CopyRow({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy command: ${command}`}
      title="Click to copy"
      className="group/row flex w-full items-center gap-3 rounded-md border border-white/5 bg-white/[0.04] px-3.5 py-3 text-left transition-colors hover:border-white/10 hover:bg-white/[0.08]"
    >
      <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-[#e8e8e8]">
        <span className="mr-2 select-none text-[#e8734a]">$</span>
        {command}
      </code>
      <span className="flex-shrink-0 text-white/55 transition-colors group-hover/row:text-white">
        {copied ? (
          <Check size={15} className="text-emerald-400" />
        ) : (
          <Copy size={15} />
        )}
      </span>
    </button>
  );
}

function Step({
  label,
  command,
  result,
}: {
  label: string;
  command: string;
  result?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-mono uppercase tracking-wider text-white/60">
        {label}
      </div>
      <CopyRow command={command} />
      {result && (
        <div className="mt-1.5 flex items-center gap-1.5 px-1 font-mono text-[12px] text-white/70">
          <span className="text-emerald-400">↳</span>
          <span className="truncate">{result}</span>
        </div>
      )}
    </div>
  );
}

export default function GetStarted() {
  return (
    <section id="get-started" className="px-6 pt-16 pb-20 md:pt-20">
      <div className="mx-auto grid max-w-5xl items-stretch gap-5 md:grid-cols-2">
        {/* Install */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Download size={16} className="text-[#e8734a]" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-white">
              Install
            </h2>
          </div>
          <div className="space-y-4">
            <Step
              label="curl"
              command="curl -fsSL https://nono.sh/install.sh | sh"
            />
            <Step label="Homebrew" command="brew install nono" />
          </div>
          <a
            href={`${DOCS_URL}/cli/getting_started/installation`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-6 font-mono text-xs text-white/55 transition-colors hover:text-white/90"
          >
            Debian · Fedora · Arch · Nix →
          </a>
        </div>

        {/* Quickstart */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Terminal size={16} className="text-[#e8734a]" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-white">
              Quickstart
            </h2>
          </div>
          <div className="space-y-4">
            <Step
              label="Find a package"
              command="nono search pi"
              result="nolabs-ai/pi"
            />
            <Step
              label="Run it, sandboxed"
              command="nono run --profile nolabs-ai/pi -- pi"
            />
          </div>
        </div>
      </div>

      {/* Sigstore provenance card */}
      <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 rounded-lg border border-border bg-surface px-5 py-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:flex-row sm:text-left">
        <a
          href="https://sigstore.dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Sigstore"
          className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-border-strong"
        >
          <Image
            src="/sigstore.svg"
            alt=""
            width={24}
            height={24}
            style={{ width: "auto", height: "24px" }}
          />
        </a>
        <span aria-hidden="true" className="hidden h-10 w-px bg-accent/40 sm:block" />
        <div className="min-w-0">
          <div className="text-sm text-muted">
            Created by the team behind{" "}
            <a
              href="https://sigstore.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground transition-colors hover:text-accent"
            >
              Sigstore
            </a>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            The industry standard for software signing, used by PyPI, Homebrew,
            Maven, Google, GitHub, and NVIDIA.
          </p>
        </div>
      </div>
    </section>
  );
}
