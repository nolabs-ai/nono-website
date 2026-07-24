import type { CSSProperties, ReactNode } from "react";
import {
  PHANTOM_TOKEN,
  type PathId,
  type Scenario,
  type StageId,
} from "./scenarios";
import { cn } from "@/lib/utils";

interface DesktopDiagramProps {
  scenario: Scenario;
  stepIndex: number;
  runId: number;
  animate: boolean;
}

const PATHS: Record<PathId, string> = {
  "agent-supervisor": "M 156 224 H 204",
  spawn: "M 480 240 H 568",
  "phantom-cred": "M 480 294 H 568",
  egress: "M 620 336 V 360 H 480",
  "proxy-github": "M 480 372 H 528 V 396 H 828",
  "audit-drop-argv": "M 228 180 H 216 V 452",
  "audit-drop-proxy": "M 440 384 V 452",
  "audit-drop-sandbox": "M 668 336 V 452",
  "audit-lane": "M 204 452 H 700",
};

// Chevrons that are always part of the structure vs. ones that only exist
// alongside the micro sandbox.
const STATIC_CHEVRONS = [
  "M 199 220 L 204 224 L 199 228", // into supervisor
  "M 823 392 L 828 396 L 823 400", // into GitHub
  "M 695 448 L 700 452 L 695 456", // lane into merkle
  "M 212 447 L 216 452 L 220 447", // argv audit drop
  "M 436 447 L 440 452 L 444 447", // proxy audit drop
];

const SANDBOX_CHEVRONS = [
  "M 563 236 L 568 240 L 563 244", // spawn into sandbox
  "M 563 290 L 568 294 L 563 298", // phantom cred into sandbox
  "M 485 356 L 480 360 L 485 364", // egress into proxy
  "M 664 447 L 668 452 L 672 447", // sandbox audit drop
];

interface StageBox {
  id: StageId;
  title: string;
  sub: string;
  y: number;
}

const STAGES: StageBox[] = [
  { id: "resolver", title: "executable resolver", sub: "path + hash verification", y: 96 },
  { id: "argv", title: "argv policy", sub: "caller + argv rules", y: 156 },
  { id: "capability", title: "capability broker", sub: "minimal baseline · selected grants", y: 216 },
  { id: "credential", title: "credential broker", sub: "", y: 276 },
  { id: "proxy", title: "L7 proxy · localhost", sub: "method/path policy", y: 336 },
];

const SANDBOX = { x: 568, y: 96, w: 200, h: 240 };

const SANDBOX_CORNERS = [
  "M 568 118 L 568 96 L 590 96",
  "M 746 96 L 768 96 L 768 118",
  "M 768 314 L 768 336 L 746 336",
  "M 590 336 L 568 336 L 568 314",
];

const CAPABILITIES = [
  "workspace: read-only",
  "fs writes: denied",
  "host secrets: denied",
  "stdio: bounded",
  "net: via nono proxy",
];

const MERKLE_EDGES = [
  "M 728 462 L 742 446",
  "M 756 462 L 742 446",
  "M 784 462 L 798 446",
  "M 812 462 L 798 446",
  "M 742 446 L 770 430",
  "M 798 446 L 770 430",
];

const MERKLE_LEAVES: [number, number][] = [
  [728, 462],
  [756, 462],
  [784, 462],
  [812, 462],
  [742, 446],
  [798, 446],
];

function VerdictBadge({
  x,
  y,
  verdict,
  appear,
}: {
  x: number;
  y: number;
  verdict: "ALLOW" | "DENY";
  appear: boolean;
}) {
  const color = verdict === "ALLOW" ? "var(--allow)" : "var(--deny)";
  return (
    <g
      className={appear ? "animate-fade-in" : undefined}
      style={appear ? { animationDelay: "350ms" } : undefined}
    >
      <rect x={x} y={y} width={56} height={18} rx={2} fill="none" stroke={color} strokeWidth={1} />
      {verdict === "ALLOW" ? (
        <path
          d={`M ${x + 6} ${y + 9.5} l 2.5 2.5 l 4.5 -4.5`}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d={`M ${x + 6} ${y + 6} l 6 6 M ${x + 12} ${y + 6} l -6 6`}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      )}
      <text x={x + 18} y={y + 12.5} fontSize={9} fill={color} className="font-code">
        {verdict}
      </text>
    </g>
  );
}

function NodeBox({
  x,
  y,
  w,
  h,
  active,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  children?: ReactNode;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="var(--accent-glow)"
        fillOpacity={active ? 1 : 0}
        stroke={active ? "var(--accent)" : "var(--muted)"}
        strokeWidth={1}
        className="ts-node-transition"
      />
      {children}
    </g>
  );
}

export default function DesktopDiagram({
  scenario,
  stepIndex,
  runId,
  animate,
}: DesktopDiagramProps) {
  const step = scenario.steps[stepIndex];
  const reached = scenario.steps.slice(0, stepIndex + 1);

  const isActive = (id: StageId) => step.active.includes(id);

  const argvBadgeIdx = scenario.steps.findIndex((s) => s.badge?.stage === "argv");
  const proxyBadgeIdx = scenario.steps.findIndex((s) => s.badge?.stage === "proxy");
  const argvBadge = argvBadgeIdx !== -1 && stepIndex >= argvBadgeIdx ? scenario.steps[argvBadgeIdx].badge : undefined;
  const proxyBadge = proxyBadgeIdx !== -1 && stepIndex >= proxyBadgeIdx ? scenario.steps[proxyBadgeIdx].badge : undefined;

  const resolveIdx = scenario.steps.findIndex((s) => s.phase === "RESOLVE");
  const resolved = resolveIdx !== -1 && stepIndex >= resolveIdx;

  const sealed = reached.some((s) => s.active.includes("merkle"));
  const sealing = animate && step.active.includes("merkle");
  const auditActive = isActive("audit");

  const vis = step.sandbox;
  const sandboxPresent = vis === "materializing" || vis === "active" || vis === "collapsing";
  const materializing = animate && vis === "materializing";

  const capsIdxExplicit = scenario.steps.findIndex((s) => s.id === "capabilities");
  const spawnIdx = scenario.steps.findIndex((s) => s.sandbox === "materializing");
  const capsIdx = capsIdxExplicit !== -1 ? capsIdxExplicit : spawnIdx;
  const capsShown = sandboxPresent && capsIdx !== -1 && stepIndex >= capsIdx;
  const capsAppearing = animate && stepIndex === capsIdx;

  const phantomIdx = scenario.steps.findIndex((s) =>
    s.pulses?.some((p) => p.path === "phantom-cred")
  );
  const phantomShown = sandboxPresent && (phantomIdx === -1 || stepIndex >= phantomIdx);
  const phantomAppearing = animate && stepIndex === phantomIdx;

  const shortCommand =
    scenario.command.split(" ").slice(0, 3).join(" ") + " …";

  const subFor = (stage: StageBox): string => {
    if (stage.id === "resolver" && resolved) return "exec: gh → verified";
    if (stage.id === "argv" && argvBadge) return argvBadge.rule;
    if (stage.id === "proxy" && proxyBadge) return proxyBadge.rule;
    return stage.sub;
  };

  return (
    <svg
      viewBox="0 0 960 520"
      className="h-auto w-full"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {/* ── base connectors ── */}
      <g fill="none" stroke="var(--muted)" strokeWidth={1}>
        <path d={PATHS["agent-supervisor"]} />
        <path d={PATHS["proxy-github"]} />
        {STATIC_CHEVRONS.map((d) => (
          <path key={d} d={d} strokeLinejoin="round" />
        ))}
      </g>
      <g fill="none" stroke="var(--muted)" strokeWidth={1} strokeDasharray="2 4">
        <path d={PATHS["audit-drop-argv"]} />
        <path d={PATHS["audit-drop-proxy"]} />
      </g>
      {/* connectors that only exist while the micro sandbox exists */}
      <g
        fill="none"
        stroke="var(--muted)"
        strokeWidth={1}
        opacity={sandboxPresent ? 1 : 0}
        className="ts-node-transition"
      >
        <path d={PATHS.spawn} />
        <path d={PATHS["phantom-cred"]} />
        <path d={PATHS.egress} />
        <path d={PATHS["audit-drop-sandbox"]} strokeDasharray="2 4" />
        {SANDBOX_CHEVRONS.map((d) => (
          <path key={d} d={d} strokeLinejoin="round" />
        ))}
      </g>

      {/* ── coding agent node ── */}
      <NodeBox x={24} y={180} w={132} h={88} active={isActive("agent")}>
        <text x={36} y={212} fontSize={12} fill="var(--foreground)">
          coding agent
        </text>
        <text x={36} y={232} fontSize={9} fill="var(--muted-strong)" className="font-code">
          $ {shortCommand}
        </text>
      </NodeBox>

      {/* ── supervisor boundary ── */}
      <rect
        x={204}
        y={64}
        width={300}
        height={352}
        fill="var(--surface)"
        stroke="var(--muted)"
        strokeWidth={1}
      />
      <text
        x={216}
        y={84}
        fontSize={10}
        fill="var(--muted-strong)"
        className="uppercase tracking-[0.15em]"
      >
        nono supervisor
      </text>

      {/* ── supervisor stages ── */}
      {STAGES.map((stage) => (
        <NodeBox key={stage.id} x={228} y={stage.y} w={252} h={48} active={isActive(stage.id)}>
          <text x={240} y={stage.y + 19} fontSize={12} fill="var(--foreground)">
            {stage.title}
          </text>
          {stage.id === "credential" ? (
            <>
              {/* real credential stays supervisor-side: lock + stop tick at the boundary */}
              <g stroke="var(--muted-strong)" fill="none" strokeWidth={1}>
                <rect x={240} y={306} width={7} height={5.5} rx={0.8} />
                <path d="M 241.5 306 v -1.8 a 2 2 0 0 1 4 0 v 1.8" />
              </g>
              <text x={252} y={312} fontSize={9} fill="var(--muted-strong)" className="font-code">
                real GH_TOKEN · supervisor-side
              </text>
              <path d="M 424 309 H 496" stroke="var(--muted)" strokeWidth={1} strokeDasharray="2 3" fill="none" />
              <path d="M 496 303 V 315" stroke="var(--muted-strong)" strokeWidth={1.5} fill="none" />
            </>
          ) : (
            <text
              x={240}
              y={stage.y + 36}
              fontSize={9.5}
              fill="var(--muted-strong)"
              className="font-code"
            >
              {subFor(stage)}
            </text>
          )}
        </NodeBox>
      ))}

      {/* ── verdict badges ── */}
      {argvBadge && (
        <VerdictBadge
          key={`argv-${scenario.id}-${runId}`}
          x={416}
          y={171}
          verdict={argvBadge.verdict}
          appear={animate && stepIndex === argvBadgeIdx}
        />
      )}
      {proxyBadge && (
        <VerdictBadge
          key={`proxy-${scenario.id}-${runId}`}
          x={416}
          y={351}
          verdict={proxyBadge.verdict}
          appear={animate && stepIndex === proxyBadgeIdx}
        />
      )}

      {/* ── micro sandbox (absent until SPAWN, gone after DESTROY) ── */}
      {sandboxPresent && (
        <g
          key={vis === "collapsing" ? `sb-col-${runId}` : "sb-live"}
          className={animate && vis === "collapsing" ? "animate-collapse-out" : undefined}
        >
          <rect
            key={materializing ? `sb-rect-${runId}` : "sb-rect"}
            x={SANDBOX.x}
            y={SANDBOX.y}
            width={SANDBOX.w}
            height={SANDBOX.h}
            fill="var(--surface)"
            stroke={isActive("sandbox") ? "var(--accent)" : "var(--muted)"}
            strokeWidth={1}
            strokeDasharray="4 4"
            className={cn("ts-node-transition", materializing && "animate-fade-in")}
            style={materializing ? { animationDelay: "250ms" } : undefined}
          />
          {SANDBOX_CORNERS.map((d, i) => (
            <path
              key={materializing ? `sb-corner-${i}-${runId}` : `sb-corner-${i}`}
              d={d}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.5}
              pathLength={materializing ? 100 : undefined}
              strokeDasharray={materializing ? 100 : undefined}
              strokeDashoffset={materializing ? 100 : undefined}
              className={materializing ? "animate-corner-draw" : undefined}
            />
          ))}
          <g
            key={materializing ? `sb-head-${runId}` : "sb-head"}
            className={materializing ? "animate-fade-in" : undefined}
            style={materializing ? { animationDelay: "300ms" } : undefined}
          >
            <text x={584} y={124} fontSize={12} fill="var(--foreground)">
              gh micro sandbox
            </text>
            <text x={584} y={140} fontSize={9.5} fill="var(--muted-strong)" className="font-code">
              invocation-scoped · ephemeral
            </text>
          </g>
          {capsShown &&
            CAPABILITIES.map((cap, i) => (
              <text
                key={capsAppearing ? `cap-${i}-${runId}` : `cap-${i}`}
                x={584}
                y={166 + i * 22}
                fontSize={10}
                fill="var(--muted-strong)"
                className={cn("font-code", capsAppearing && "animate-fade-in")}
                style={
                  capsAppearing
                    ? ({ animationDelay: `${300 + i * 120}ms` } as CSSProperties)
                    : undefined
                }
              >
                {cap}
              </text>
            ))}
          {phantomShown && (
            <g
              key={phantomAppearing ? `phantom-${runId}` : "phantom"}
              className={phantomAppearing ? "animate-fade-in" : undefined}
              style={phantomAppearing ? { animationDelay: "500ms" } : undefined}
            >
              <line x1={584} y1={274} x2={752} y2={274} stroke="var(--border-strong)" strokeWidth={1} />
              <text x={584} y={296} fontSize={10} fill="var(--accent)" className="font-code">
                {PHANTOM_TOKEN}
              </text>
              <text x={584} y={312} fontSize={8.5} fill="var(--muted-strong)" className="font-code">
                phantom · valid only via nono proxy
              </text>
            </g>
          )}
        </g>
      )}

      {/* ── GitHub node ── */}
      <NodeBox x={828} y={364} w={108} h={64} active={isActive("github")}>
        <text x={840} y={390} fontSize={12} fill="var(--foreground)">
          GitHub API
        </text>
        <text x={840} y={406} fontSize={9} fill="var(--muted-strong)" className="font-code">
          api.github.com
        </text>
      </NodeBox>

      {/* ── audit stream + merkle root ── */}
      <path
        d={PATHS["audit-lane"]}
        fill="none"
        stroke={auditActive ? "var(--accent)" : "var(--muted)"}
        strokeWidth={1}
        className="ts-node-transition"
      />
      <text x={204} y={472} fontSize={10} fill="var(--muted-strong)" className="font-code">
        audit stream · hash-chained
      </text>
      {MERKLE_EDGES.map((d, i) => (
        <path
          key={sealing ? `me-${i}-${runId}` : `me-${i}`}
          d={d}
          fill="none"
          stroke={sealed ? "var(--muted-strong)" : "var(--muted)"}
          strokeWidth={1}
          pathLength={sealing ? 100 : undefined}
          strokeDasharray={sealing ? 100 : undefined}
          strokeDashoffset={sealing ? 100 : undefined}
          className={sealing ? "animate-corner-draw" : "ts-node-transition"}
          style={sealing ? ({ animationDelay: `${i * 80}ms` } as CSSProperties) : undefined}
        />
      ))}
      {MERKLE_LEAVES.map(([cx, cy]) => (
        <rect
          key={`${cx}-${cy}`}
          x={cx - 2.5}
          y={cy - 2.5}
          width={5}
          height={5}
          fill="none"
          stroke="var(--muted-strong)"
          strokeWidth={1}
          className="ts-node-transition"
        />
      ))}
      <rect
        x={767}
        y={427}
        width={6}
        height={6}
        fill={sealed ? "var(--accent)" : "none"}
        stroke={sealed ? "var(--accent)" : "var(--muted)"}
        strokeWidth={1}
        className={cn("ts-node-transition", sealing && "animate-fade-in")}
        style={sealing ? { animationDelay: "600ms" } : undefined}
      />
      <text
        x={770}
        y={488}
        fontSize={9.5}
        fill="var(--muted-strong)"
        textAnchor="middle"
        className="font-code"
      >
        SHA-256 Merkle root
      </text>

      {/* ── signal pulses ── */}
      {animate &&
        step.pulses?.map((p) => (
          <path
            key={`${runId}-${stepIndex}-${p.path}-${p.reverse ? "r" : "f"}`}
            d={PATHS[p.path]}
            pathLength={100}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="12 188"
            strokeDashoffset={p.reverse ? -102 : 14}
            className={p.reverse ? "animate-pulse-travel-reverse" : "animate-pulse-travel"}
            style={
              {
                "--pulse-duration": `${p.durMs ?? Math.max(step.duration - 250, 300)}ms`,
                animationDelay: p.delayMs ? `${p.delayMs}ms` : undefined,
              } as CSSProperties
            }
          />
        ))}
    </svg>
  );
}
