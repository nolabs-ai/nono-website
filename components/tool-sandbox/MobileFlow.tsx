import type { ReactNode } from "react";
import { PHANTOM_TOKEN, type RailPhase, type Scenario } from "./scenarios";
import { cn } from "@/lib/utils";

interface MobileFlowProps {
  scenario: Scenario;
  stepIndex: number;
}

const PHASE_CELL: Record<RailPhase, number> = {
  REQUEST: 0,
  RESOLVE: 1,
  AUTHORIZE: 1,
  SPAWN: 2,
  EXECUTE: 3,
  SEAL: 4,
  DESTROY: 2,
};

const CAPABILITIES = [
  "workspace: read-only",
  "fs writes: denied",
  "host secrets: denied",
  "stdio: bounded",
  "net: via nono proxy",
];

function Chip({ verdict }: { verdict: "ALLOW" | "DENY" }) {
  const allow = verdict === "ALLOW";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-px font-code text-[10px]",
        allow ? "border-allow text-allow" : "border-deny text-deny"
      )}
    >
      <span>{allow ? "✓" : "✕"}</span>
      {verdict}
    </span>
  );
}

function Cell({
  active,
  dimmed,
  eyebrow,
  children,
}: {
  active: boolean;
  dimmed?: boolean;
  eyebrow: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-l-2 px-4 py-3 transition-colors",
        active ? "border-l-accent bg-surface" : "border-l-transparent bg-background",
        dimmed && "opacity-60"
      )}
    >
      <div className="mb-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-muted">
        {eyebrow}
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <code className="block break-words text-[11px] leading-relaxed text-muted-strong">
      {children}
    </code>
  );
}

export default function MobileFlow({ scenario, stepIndex }: MobileFlowProps) {
  const step = scenario.steps[stepIndex];
  const reached = scenario.steps.slice(0, stepIndex + 1);
  const activeCell = PHASE_CELL[step.phase];

  const resolved = reached.some((s) => s.phase === "RESOLVE");
  const argvBadge = reached.find((s) => s.badge?.stage === "argv")?.badge;
  const proxyBadge = reached.find((s) => s.badge?.stage === "proxy")?.badge;
  const spawned = reached.some(
    (s) => s.sandbox === "materializing" || s.sandbox === "active"
  );
  const gone = step.sandbox === "gone" || step.sandbox === "collapsing";
  const phantomReached = reached.some((s) =>
    s.pulses?.some((p) => p.path === "phantom-cred")
  );
  const phantomShown = spawned && (phantomReached || scenario.id === "l7-denied");
  const githubReached = reached.some((s) => s.active.includes("github"));
  const sealed = reached.some((s) => s.active.includes("merkle"));
  const argvDenied = argvBadge?.verdict === "DENY";

  const stripVerdict = (rule: string) => rule.replace(/ → (ALLOW|DENY)$/, "");

  return (
    <div className="grid gap-px border border-border bg-border">
      <Cell active={activeCell === 0} eyebrow="coding agent · tool request">
        <code className="block break-words text-xs leading-relaxed text-foreground">
          <span className="text-accent">$ </span>
          {scenario.command}
        </code>
      </Cell>

      <Cell active={activeCell === 1} eyebrow="nono supervisor">
        <div className="flex flex-col gap-1.5">
          {resolved ? (
            <Row>exec: gh → verified</Row>
          ) : (
            <Row>resolving + verifying executable…</Row>
          )}
          {argvBadge && (
            <div className="flex flex-wrap items-center gap-2">
              <Row>argv prefix: {stripVerdict(argvBadge.rule)}</Row>
              <Chip verdict={argvBadge.verdict} />
            </div>
          )}
          {phantomShown && (
            <Row>phantom GH_TOKEN issued · real token stays supervisor-side</Row>
          )}
        </div>
      </Cell>

      <Cell
        active={activeCell === 2}
        dimmed={!spawned || gone}
        eyebrow="gh micro sandbox · invocation-scoped"
      >
        {spawned ? (
          <div className="flex flex-col gap-1">
            {CAPABILITIES.map((cap) => (
              <Row key={cap}>{cap}</Row>
            ))}
            {phantomShown && (
              <code className="block break-words text-[11px] leading-relaxed text-accent">
                {PHANTOM_TOKEN}
              </code>
            )}
            {gone && (
              <code className="block text-[11px] leading-relaxed text-muted">
                destroyed — nothing persists
              </code>
            )}
          </div>
        ) : (
          <Row>
            {argvDenied
              ? "no sandbox was created — blocked at argv policy"
              : "no sandbox yet"}
          </Row>
        )}
      </Cell>

      <Cell
        active={activeCell === 3}
        dimmed={!proxyBadge}
        eyebrow="L7 proxy → GitHub API"
      >
        {proxyBadge ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Row>{stripVerdict(proxyBadge.rule)}</Row>
              <Chip verdict={proxyBadge.verdict} />
            </div>
            {proxyBadge.verdict === "ALLOW" ? (
              githubReached && (
                <Row>real credential injected at the boundary · TLS → api.github.com</Row>
              )
            ) : (
              <Row>nothing crosses the proxy</Row>
            )}
          </div>
        ) : (
          <Row>{argvDenied ? "no outbound request" : "method/path policy"}</Row>
        )}
      </Cell>

      <Cell active={activeCell === 4} dimmed={!sealed} eyebrow="audit">
        <div className="flex flex-col gap-1">
          <Row>security-relevant events → hash chain</Row>
          {sealed && <Row>sealed with SHA-256 Merkle root</Row>}
        </div>
      </Cell>
    </div>
  );
}
