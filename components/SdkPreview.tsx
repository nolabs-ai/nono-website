"use client";

import { Highlight, themes } from "prism-react-renderer";
import { SectionHeader } from "@/components/ui/SectionHeader";

const snippets = [
  {
    lang: "python" as const,
    label: "Python",
    code: `import nono_py as nono

caps = nono.CapabilitySet()
caps.allow_path("/project", nono.AccessMode.READ_WRITE)
caps.block_network()

nono.apply(caps)`,
  },
  {
    lang: "typescript" as const,
    label: "TypeScript",
    code: `import { CapabilitySet, AccessMode, apply } from 'nono-ts';

const caps = new CapabilitySet();
caps.allowPath('/project', AccessMode.ReadWrite);
caps.blockNetwork();

apply(caps);`,
  },
  {
    lang: "rust" as const,
    label: "Rust",
    code: `use nono::{CapabilitySet, AccessMode, Sandbox};

let caps = CapabilitySet::new()
    .allow_path("/project", AccessMode::ReadWrite)?
    .block_network();

Sandbox::apply(&caps)?;`,
  },
];

const ffiLanguages = [
  { name: "C" },
  { name: "C++" },
  { name: "Go" },
  { name: "Swift" },
  { name: "Ruby" },
  { name: "Zig" },
];

export default function SdkPreview() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          badge="SDKs"
          title="Orchestrate Secure Environments"
          subtitle="Enforce kernel-level isolation, network filtering, and atomic rollbacks with native SDKs."
        />

        <div className="grid md:grid-cols-3 gap-0 border border-terminal-border bg-terminal-bg text-terminal-text">
          {snippets.map((snippet, i) => (
            <div
              key={snippet.label}
              className={`${i > 0 ? "border-t md:border-t-0 md:border-l border-terminal-border" : ""}`}
            >
              <div className="px-4 py-2 border-b border-terminal-border">
                <span className="text-xs font-mono uppercase tracking-wider text-terminal-text/60">
                  {snippet.label}
                </span>
              </div>
              <Highlight
                theme={themes.nightOwl}
                code={snippet.code}
                language={snippet.lang}
              >
                {({ tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className="p-4 font-mono text-xs leading-relaxed overflow-x-auto"
                    style={{ background: "transparent" }}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          ))}
        </div>

        <div className="mt-6 border border-border px-6 py-5">
          <p className="text-xs font-mono uppercase tracking-wider text-muted text-center mb-4">
            C FFI bindings for any language with C interop
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {ffiLanguages.map((lang) => (
              <span
                key={lang.name}
                className="text-xs font-mono text-muted"
              >
                {lang.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
