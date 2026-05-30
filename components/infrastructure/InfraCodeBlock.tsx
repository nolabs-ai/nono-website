"use client";

import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "@/lib/useTheme";

interface InfraCodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  className?: string;
}

export function InfraCodeBlock({
  code,
  language,
  filename,
  className,
}: InfraCodeBlockProps) {
  const theme = useTheme();
  const prismTheme = theme === "dark" ? themes.nightOwl : themes.nightOwlLight;
  return (
    <div className={`border border-terminal-border bg-terminal-bg text-terminal-text ${className ?? ""}`}>
      <div className="px-8 py-3 border-b border-terminal-border">
        <span className="text-xs font-mono text-terminal-text/60">
          {filename ?? language}
        </span>
      </div>
      <Highlight theme={prismTheme} code={code.trim()} language={language}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre
            className="px-8 py-4 overflow-x-auto text-xs leading-relaxed font-mono"
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
  );
}
