"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Search,
  Loader2,
  BadgeCheck,
  CornerDownLeft,
  ArrowRight,
} from "lucide-react";
import { DOCS_URL, REGISTRY_URL } from "@/lib/site";

/* -------------------------------------------------------------------------- */
/* Install tabs                                                               */
/* -------------------------------------------------------------------------- */

type InstallKey = "curl" | "brew" | "cargo";

const INSTALL: Record<InstallKey, { label: string; command: string }> = {
  curl: { label: "curl", command: "curl -fsSL https://nono.sh/install.sh | sh" },
  brew: { label: "brew", command: "brew install nono" },
  cargo: { label: "cargo", command: "cargo install nono-cli" },
};

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, []);
  return { copied, copy };
}

/** A terminal-chrome card with a titlebar (traffic lights) and a body. */
function TerminalCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-[0_20px_50px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* titlebar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-2 font-code text-[11px] tracking-wide text-white/40">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function InstallCard() {
  const [active, setActive] = useState<InstallKey>("curl");
  const { copied, copy } = useCopy();
  const command = INSTALL[active].command;

  return (
    <TerminalCard title="install nono">
      {/* tabs */}
      <div className="flex border-b border-white/10">
        {(Object.keys(INSTALL) as InstallKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`relative px-5 py-3 font-code text-[13px] transition-colors ${
              active === key
                ? "text-white"
                : "text-white/45 hover:text-white/70"
            }`}
          >
            {INSTALL[key].label}
            {active === key && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#e8734a]" />
            )}
          </button>
        ))}
      </div>

      {/* command body */}
      <div className="flex items-center gap-3 px-5 py-5">
        <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-code text-[13.5px] text-[#e8e8e8]">
          <span className="mr-2 select-none text-[#e8734a]">$</span>
          {command}
        </code>
        <button
          type="button"
          onClick={() => copy(command)}
          aria-label="Copy install command"
          title="Copy"
          className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          {copied ? (
            <Check size={15} className="text-emerald-400" />
          ) : (
            <Copy size={15} />
          )}
        </button>
      </div>
    </TerminalCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Interactive registry search                                                */
/* -------------------------------------------------------------------------- */

interface Pkg {
  namespace: string;
  name: string;
  description: string | null;
  latest_version: string | null;
}

const SUGGESTIONS = ["codex", "claude", "pi", "gemini", "opencode"];

function SearchCard({
  onPick,
  selectedRef,
}: {
  onPick: (ref: string) => void;
  selectedRef: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Pkg[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setState("idle");
        return;
      }
      setState("loading");
      try {
        const res = await fetch(
          `/api/registry-search?q=${encodeURIComponent(trimmed)}`,
        );
        if (!res.ok) throw new Error("bad response");
        const data = (await res.json()) as { packages: Pkg[] };
        setResults(data.packages);
        setState("done");
        // Auto-load the top match into the run command so step 3 stays in
        // sync as you type — clicking another result overrides it.
        if (data.packages.length > 0) {
          const top = data.packages[0];
          onPick(`${top.namespace}/${top.name}`);
        }
      } catch {
        setResults([]);
        setState("error");
      }
    },
    [onPick],
  );

  // debounced search on typing
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => runSearch(query), 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, runSearch]);

  return (
    <TerminalCard title="nono search">
      {/* input row — styled like a shell prompt */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <span className="select-none font-code text-[13.5px] text-white/40">
          $ nono search
        </span>
        <div className="relative flex min-w-0 flex-1 items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="codex"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search the nono registry"
            className="min-w-0 flex-1 bg-transparent font-code text-[13.5px] text-[#e8e8e8] placeholder:text-white/25 focus:outline-none"
          />
          <span className="ml-2 shrink-0 text-white/40">
            {state === "loading" ? (
              <Loader2 size={15} className="animate-spin text-[#e8734a]" />
            ) : (
              <Search size={15} />
            )}
          </span>
        </div>
      </div>

      {/* suggestions */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-3">
        <span className="font-code text-[11px] text-white/35">try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQuery(s)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-code text-[11px] text-white/55 transition-colors hover:border-[#e8734a]/50 hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>

      {/* results */}
      <div className="min-h-[132px] px-2.5 py-2.5">
        {state === "idle" && (
          <p className="px-2.5 py-8 text-center font-code text-[12.5px] text-white/30">
            Start typing to search {""}
            <span className="text-white/50">registry.nono.sh</span>
          </p>
        )}

        {state === "error" && (
          <p className="px-2.5 py-8 text-center font-code text-[12.5px] text-[#ff8a6a]">
            Couldn&apos;t reach the registry. Try again in a moment.
          </p>
        )}

        {state === "done" && results.length === 0 && (
          <p className="px-2.5 py-8 text-center font-code text-[12.5px] text-white/40">
            No packages match{" "}
            <span className="text-white/60">&ldquo;{query}&rdquo;</span>
          </p>
        )}

        <ul className="flex flex-col gap-1">
          {results.map((pkg) => {
            const ref = `${pkg.namespace}/${pkg.name}`;
            const selected = ref === selectedRef;
            return (
              <li key={ref}>
                <button
                  type="button"
                  onClick={() => onPick(ref)}
                  aria-pressed={selected}
                  title={`Use ${ref} in the run command`}
                  className={`group flex w-full items-center gap-3 rounded-lg border px-2.5 py-2.5 text-left transition-colors ${
                    selected
                      ? "border-[#e8734a]/50 bg-[#e8734a]/10"
                      : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <BadgeCheck
                    size={16}
                    className="shrink-0 text-emerald-400"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <code className="truncate font-code text-[13px] font-medium text-[#e8e8e8]">
                        {ref}
                      </code>
                      {pkg.latest_version && (
                        <span className="shrink-0 font-code text-[10.5px] text-white/35">
                          v{pkg.latest_version}
                        </span>
                      )}
                    </span>
                    {pkg.description && (
                      <span className="mt-0.5 block truncate font-code text-[11.5px] text-white/40">
                        {pkg.description}
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex shrink-0 items-center gap-1 font-code text-[11px] transition-colors ${
                      selected
                        ? "text-[#e8734a]"
                        : "text-white/25 group-hover:text-[#e8734a]"
                    }`}
                  >
                    {selected ? (
                      <>
                        <Check size={12} /> selected
                      </>
                    ) : (
                      <>
                        use <CornerDownLeft size={12} />
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* caption: makes the connection to step 3 explicit */}
      {state === "done" && results.length > 0 && (
        <div className="flex items-center gap-1.5 border-t border-white/10 bg-white/[0.02] px-5 py-2.5 font-code text-[11px] text-white/40">
          <CornerDownLeft size={12} className="text-[#e8734a]" />
          <span>Pick a package to load it into the run command below.</span>
        </div>
      )}
    </TerminalCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Run command                                                                */
/* -------------------------------------------------------------------------- */

function RunCard({ agentRef }: { agentRef: string }) {
  const { copied, copy } = useCopy();
  // The pack ref is namespace/name; the trailing binary is just the name.
  const binary = agentRef.split("/").pop() ?? agentRef;
  const command = `nono run --profile ${agentRef} -- ${binary}`;

  return (
    <TerminalCard title="run it, sandboxed">
      <div className="flex items-center gap-3 px-5 py-5">
        <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-code text-[13.5px] text-[#e8e8e8]">
          <span className="mr-2 select-none text-[#e8734a]">$</span>
          nono run --profile{" "}
          <span className="text-[#e8734a]">{agentRef}</span> -- {binary}
        </code>
        <button
          type="button"
          onClick={() => copy(command)}
          aria-label="Copy run command"
          title="Copy"
          className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          {copied ? (
            <Check size={15} className="text-emerald-400" />
          ) : (
            <Copy size={15} />
          )}
        </button>
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 bg-white/[0.02] px-5 py-3 font-code text-[11.5px] text-white/45">
        <span className="text-emerald-400">↳</span>
        <span>
          Your agent runs inside a kernel-enforced sandbox. If the pack
          isn&apos;t installed yet, nono pulls it first.
        </span>
      </div>
    </TerminalCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Page shell                                                                 */
/* -------------------------------------------------------------------------- */

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex size-6 items-center justify-center rounded-full border border-[#e8734a]/40 bg-[#e8734a]/10 font-code text-[12px] font-semibold text-[#e8734a]">
        {n}
      </span>
      <h2 className="font-code text-sm font-semibold uppercase tracking-wider text-white/70">
        {label}
      </h2>
    </div>
  );
}

export default function RedditLanding() {
  const [agentRef, setAgentRef] = useState("nolabs-ai/codex");

  return (
    // Force the always-dark terminal aesthetic regardless of site theme.
    <div className="min-h-screen bg-[#111110] px-6 pt-28 pb-24 text-white">
      <div className="mx-auto w-full max-w-2xl">
        {/* hero */}
        <div className="mb-14 text-center">
          <h1 className="font-code text-4xl font-bold tracking-tighter text-white sm:text-5xl">
            nono
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
            Run any AI coding agent inside a kernel-enforced sandbox. Three
            steps: install, find an agent, run it. Zero setup, zero latency.
          </p>
        </div>

        {/* step 1 — install */}
        <section className="mb-12">
          <StepBadge n={1} label="Install nono" />
          <InstallCard />
        </section>

        {/* step 2 — search */}
        <section className="mb-12">
          <StepBadge n={2} label="Find an agent" />
          <SearchCard onPick={setAgentRef} selectedRef={agentRef} />
        </section>

        {/* step 3 — run */}
        <section className="mb-14">
          <StepBadge n={3} label="Run it" />
          <RunCard agentRef={agentRef} />
        </section>

        {/* footer links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/10 pt-8 text-center font-code text-[12.5px]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/55 transition-colors hover:text-white"
          >
            How it works <ArrowRight size={13} />
          </Link>
          <a
            href={REGISTRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white/55 transition-colors hover:text-white"
          >
            Browse the registry <ArrowRight size={13} />
          </a>
          <a
            href={`${DOCS_URL}/cli/getting_started/installation`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white/55 transition-colors hover:text-white"
          >
            Docs <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
