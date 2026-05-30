"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Copy, Check } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

interface CodeBlockProps {
  children?: string;
  className?: string;
  filename?: string;
  highlight?: string;
}

function parseHighlightLines(highlight?: string): Set<number> {
  if (!highlight) return new Set();
  const lines = new Set<number>();
  highlight.split(",").forEach((part) => {
    const range = part.trim().split("-");
    if (range.length === 2) {
      for (let i = parseInt(range[0]); i <= parseInt(range[1]); i++)
        lines.add(i);
    } else {
      lines.add(parseInt(part.trim()));
    }
  });
  return lines;
}

export function CodeBlock({
  children = "",
  className,
  filename,
  highlight,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();
  const language = className?.replace(/language-/, "") ?? "text";
  const highlightedLines = parseHighlightLines(highlight);
  const prismTheme = theme === "dark" ? themes.nightOwl : themes.nightOwlLight;

  if (!className) {
    return (
      <code className="px-1.5 py-0.5 bg-code-bg border border-code-border font-mono text-xs text-code-text">
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 overflow-hidden border border-terminal-border bg-terminal-bg text-terminal-text">
      <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-border">
        <span className="text-xs font-mono text-terminal-text/60">
          {filename ?? language}
        </span>
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-xs text-terminal-text/40 uppercase tracking-wider font-mono">
              {language}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1 text-terminal-text/40 hover:text-terminal-text transition-colors"
            aria-label="Copy code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <Highlight
        theme={prismTheme}
        code={children.trim()}
        language={language}
      >
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre
            className="p-4 overflow-x-auto text-xs leading-relaxed font-mono"
            style={{ background: "transparent" }}
          >
            {tokens.map((line, i) => {
              const lineNumber = i + 1;
              const isHighlighted = highlightedLines.has(lineNumber);
              return (
                <div
                  key={i}
                  {...getLineProps({ line })}
                  className={
                    isHighlighted
                      ? "bg-surface-hover -mx-4 px-4 border-l-2 border-accent"
                      : ""
                  }
                >
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
