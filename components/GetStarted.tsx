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
    <section id="get-started" className="pb-20 px-6">
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
              result="always-further/pi"
            />
            <Step
              label="Run it, sandboxed"
              command="nono run --profile always-further/pi -- pi"
            />
          </div>
        </div>
      </div>

      {/* Sigstore trust line */}
      <div className="mx-auto mt-8 flex max-w-5xl flex-col items-center gap-1 text-center text-sm text-muted">
        <div className="flex items-center gap-2">
          <span>Created by the team behind</span>
          <a
            href="https://sigstore.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-muted-strong"
          >
            <Image
              src="/sigstore.svg"
              alt="Sigstore"
              width={18}
              height={18}
              style={{ width: "auto", height: "18px" }}
            />
            Sigstore
          </a>
        </div>
        <span className="text-xs text-muted">
          The industry standard for software signing, used by PyPi, Homebrew,
          Maven and Google, GitHub, NVIDIA
        </span>
      </div>
    </section>
  );
}
