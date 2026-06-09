"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

const lines = [
  { type: "command" as const, text: "nono run --allow-domain api.example.com agent", delay: 0 },
  { type: "blank" as const, text: "", delay: 600 },
  { type: "log" as const, label: "sandbox", text: "landlock applied (3 paths allowed)", delay: 800 },
  { type: "log" as const, label: "network", text: "proxy active (2 hosts allowed)", delay: 1200 },
  { type: "log" as const, label: "snapshot", text: "captured 847 files (12.3 MB deduplicated)", delay: 1600 },
  { type: "log" as const, label: "supervisor", text: "terminal mode, approve/deny per-operation", delay: 2000 },
  { type: "blank" as const, text: "", delay: 2400 },
  { type: "ready" as const, label: "session", text: "ready. agent is sandboxed.", delay: 2600 },
];

export function HeroTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((line, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), line.delay + 400)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-14 text-left">
      <GlassCard className="overflow-hidden">
        {/* Terminal chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.08)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.08)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.08)]" />
          <span className="ml-3 text-[11px] text-muted/50 font-mono">terminal</span>
        </div>

        {/* Terminal body */}
        <div className="px-5 py-4 font-mono text-[13px] leading-[1.8] min-h-[220px] overflow-x-auto">
          {lines.slice(0, visibleLines).map((line, i) => {
            if (line.type === "blank") {
              return <div key={i} className="h-[1.8em]" />;
            }
            if (line.type === "command") {
              return (
                <div key={i} className="whitespace-nowrap">
                  <span className="text-foreground/40">$</span>{" "}
                  <span className="text-foreground">{line.text}</span>
                  {visibleLines === i + 1 && (
                    <span className="inline-block w-[7px] h-[15px] bg-foreground/60 ml-0.5 align-middle animate-blink" />
                  )}
                </div>
              );
            }
            if (line.type === "ready") {
              return (
                <div key={i} className="whitespace-nowrap">
                  <span className="text-foreground/30 inline-block" style={{ width: "11ch" }}>{"label" in line ? line.label : ""}</span>
                  <span className="text-foreground/80 font-medium">{line.text}</span>
                </div>
              );
            }
            return (
              <div key={i} className="text-muted/70 whitespace-nowrap">
                <span className="text-foreground/30 inline-block" style={{ width: "11ch" }}>{"label" in line ? line.label : ""}</span>
                {line.text}
              </div>
            );
          })}
          {visibleLines >= lines.length && (
            <div className="mt-1">
              <span className="text-foreground/40">$</span>{" "}
              <span className="inline-block w-[7px] h-[15px] bg-foreground/60 align-middle animate-blink" />
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
