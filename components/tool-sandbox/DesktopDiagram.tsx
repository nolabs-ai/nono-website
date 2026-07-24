import type { CSSProperties } from "react";
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
  "agent-supervisor": "M 300 294 H 350",
  spawn: "M 520 294 H 580",
  "phantom-cred": "M 520 382 H 646",
  egress: "M 906 294 H 936",
  "proxy-github": "M 1044 294 H 1104",
  "audit-drop-argv": "M 438 270 V 520",
  "audit-drop-proxy": "M 990 362 V 520",
  "audit-drop-sandbox": "M 742 444 V 520",
  "audit-lane": "M 176 520 H 1094",
};

const GATES: {
  id: StageId;
  index: string;
  title: string;
  idle: string;
  y: number;
}[] = [
  { id: "resolver", index: "01", title: "EXECUTABLE", idle: "identity + digest", y: 150 },
  { id: "argv", index: "02", title: "ARGV POLICY", idle: "caller + arguments", y: 216 },
  { id: "capability", index: "03", title: "CAPABILITIES", idle: "minimal grants", y: 282 },
  { id: "credential", index: "04", title: "CREDENTIAL", idle: "supervisor vault", y: 348 },
];

const SANDBOX_PATH =
  "M 608 128 H 858 L 904 174 V 402 L 876 444 H 608 L 580 416 V 156 Z";
const SANDBOX_INNER =
  "M 620 146 H 850 L 886 182 V 394 L 866 426 H 616 L 598 408 V 166 Z";
const TOOL_CORE =
  "M 674 222 H 810 L 828 240 V 316 L 810 334 H 674 L 656 316 V 240 Z";
const PROXY_GATE =
  "M 956 218 H 1024 L 1044 238 V 346 L 1028 362 H 952 L 936 346 V 238 Z";

function cutRect(x: number, y: number, w: number, h: number, cut = 10) {
  return `M ${x} ${y} H ${x + w - cut} L ${x + w} ${y + cut} V ${
    y + h
  } H ${x} Z`;
}

function Gate({
  gate,
  active,
  value,
  verdict,
}: {
  gate: (typeof GATES)[number];
  active: boolean;
  value: string;
  verdict?: "ALLOW" | "DENY";
}) {
  const color =
    verdict === "DENY"
      ? "var(--ts-deny)"
      : verdict === "ALLOW"
        ? "var(--ts-allow)"
        : active
          ? "var(--ts-accent)"
          : "var(--ts-line)";

  return (
    <g className="ts-node-transition">
      <path
        d={cutRect(350, gate.y, 170, 54, 9)}
        fill={active ? "var(--ts-active)" : "var(--ts-panel)"}
        stroke={color}
      />
      <text x={362} y={gate.y + 17} className="ts-svg-label" fill="var(--ts-faint)">
        {gate.index}
      </text>
      <text x={388} y={gate.y + 18} className="ts-svg-label" fill="var(--ts-text)">
        {gate.title}
      </text>
      <text x={362} y={gate.y + 39} className="ts-svg-code" fill="var(--ts-muted)">
        {value || gate.idle}
      </text>
      {verdict && (
        <g transform={`translate(474 ${gate.y + 9})`}>
          <circle r={3} fill={color} />
          <text x={-2} y={27} textAnchor="end" className="ts-svg-micro" fill={color}>
            {verdict}
          </text>
        </g>
      )}
    </g>
  );
}

function CapabilityPort({
  x,
  y,
  align = "left",
  label,
  value,
  danger,
}: {
  x: number;
  y: number;
  align?: "left" | "right";
  label: string;
  value: string;
  danger?: boolean;
}) {
  const width = 112;
  const left = align === "left" ? x : x - width;
  const color = danger ? "var(--ts-deny)" : "var(--ts-accent)";
  return (
    <g>
      <path
        d={cutRect(left, y, width, 38, 7)}
        fill="var(--ts-panel-strong)"
        stroke="var(--ts-line-strong)"
      />
      <rect
        x={align === "left" ? left : left + width - 3}
        y={y + 11}
        width={3}
        height={16}
        fill={color}
      />
      <text x={left + 10} y={y + 14} className="ts-svg-micro" fill="var(--ts-faint)">
        {label}
      </text>
      <text x={left + 10} y={y + 29} className="ts-svg-code" fill="var(--ts-text)">
        {value}
      </text>
    </g>
  );
}

function AgentSurface({
  scenario,
  active,
  resultVisible,
}: {
  scenario: Scenario;
  active: boolean;
  resultVisible: boolean;
}) {
  return (
    <g>
      <path
        d="M 20 126 H 286 L 300 140 V 442 L 286 456 H 20 Z"
        fill="var(--ts-panel)"
        stroke={active ? "var(--ts-accent)" : "var(--ts-line-strong)"}
        className="ts-node-transition"
      />
      <path d="M 20 158 H 300" stroke="var(--ts-line)" />
      <circle cx={36} cy={142} r={3} fill="var(--ts-accent)" />
      <circle cx={48} cy={142} r={3} fill="var(--ts-line-strong)" />
      <circle cx={60} cy={142} r={3} fill="var(--ts-line-strong)" />
      <text x={78} y={146} className="ts-svg-label" fill="var(--ts-muted)">
        AGENT SESSION
      </text>
      <text x={274} y={146} textAnchor="end" className="ts-svg-micro" fill="var(--ts-faint)">
        LIVE
      </text>

      <circle cx={39} cy={184} r={9} fill="var(--ts-line)" />
      <text x={39} y={187} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-text)">
        U
      </text>
      <text x={56} y={178} className="ts-svg-micro" fill="var(--ts-faint)">
        USER
      </text>
      <text x={56} y={197} className="ts-svg-body" fill="var(--ts-text)">
        {scenario.agent.user}
      </text>

      <path d="M 30 216 H 288" stroke="var(--ts-line)" strokeDasharray="2 5" />
      <path
        d="M 31 238 L 39 230 L 47 238 L 39 246 Z"
        fill="none"
        stroke="var(--ts-accent)"
      />
      <text x={56} y={232} className="ts-svg-micro" fill="var(--ts-accent)">
        AGENT
      </text>
      <text x={56} y={251} className="ts-svg-body" fill="var(--ts-text)">
        {scenario.agent.response}
      </text>

      <path
        d="M 31 272 H 278 L 288 282 V 344 H 31 Z"
        fill="var(--ts-panel-strong)"
        stroke={active ? "var(--ts-accent)" : "var(--ts-line-strong)"}
        className="ts-node-transition"
      />
      <path
        d="M 43 287 H 57 L 63 293 V 307 L 57 313 H 43 L 37 307 V 293 Z"
        fill="var(--ts-active)"
        stroke="var(--ts-accent)"
      />
      <text x={50} y={302} textAnchor="middle" className="ts-svg-code" fill="var(--ts-accent)">
        gh
      </text>
      <text x={73} y={291} className="ts-svg-micro" fill="var(--ts-faint)">
        TOOL CALL
      </text>
      <text x={73} y={310} className="ts-svg-body" fill="var(--ts-text)">
        {scenario.agent.tool}
      </text>
      <text x={73} y={329} className="ts-svg-code" fill="var(--ts-muted)">
        {scenario.agent.toolMeta}
      </text>
      <circle
        cx={271}
        cy={287}
        r={3}
        fill={active && !resultVisible ? "var(--ts-accent)" : "var(--ts-line-strong)"}
        className={active && !resultVisible ? "ts-status-pulse" : undefined}
      />

      <g
        opacity={resultVisible ? 1 : 0.35}
        className="ts-node-transition"
      >
        <path
          d="M 31 360 H 278 L 288 370 V 430 H 31 Z"
          fill={resultVisible ? "var(--ts-result)" : "transparent"}
          stroke={resultVisible ? "var(--ts-line-strong)" : "var(--ts-line)"}
        />
        <text
          x={44}
          y={378}
          className="ts-svg-micro"
          fill={
            scenario.id === "allowed" ? "var(--ts-allow)" : "var(--ts-deny)"
          }
        >
          {scenario.id === "allowed" ? "TOOL RESULT" : "TOOL DENIED"}
        </text>
        <text x={44} y={399} className="ts-svg-body" fill="var(--ts-text)">
          {resultVisible ? scenario.agent.result : "Awaiting supervisor…"}
        </text>
        <text x={44} y={418} className="ts-svg-code" fill="var(--ts-muted)">
          {resultVisible ? scenario.agent.resultMeta : "policy evaluation pending"}
        </text>
      </g>
    </g>
  );
}

function AuditSpine({
  events,
  sealing,
  runId,
}: {
  events: { label: string; tone?: "allow" | "deny" }[];
  sealing: boolean;
  runId: number;
}) {
  return (
    <g>
      <text x={176} y={500} className="ts-svg-label" fill="var(--ts-faint)">
        TAMPER-EVIDENT AUDIT
      </text>
      <path d={PATHS["audit-lane"]} fill="none" stroke="var(--ts-line-strong)" />
      {events.map((event, index) => {
        const x = 220 + index * 112;
        const color =
          event.tone === "deny"
            ? "var(--ts-deny)"
            : event.tone === "allow"
              ? "var(--ts-allow)"
              : "var(--ts-accent)";
        return (
          <g
            key={`${event.label}-${index}-${runId}`}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <circle cx={x} cy={520} r={4} fill="var(--ts-bg)" stroke={color} />
            <path d={`M ${x + 4} 520 H ${x + 104}`} stroke="var(--ts-line)" />
            <text x={x} y={542} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-muted)">
              {event.label}
            </text>
          </g>
        );
      })}

      <g transform="translate(1000 488)">
        <path
          d="M 0 28 L 18 14 M 36 28 L 18 14 M 18 14 L 54 0 M 72 14 L 54 0 M 90 28 L 72 14"
          fill="none"
          stroke={sealing ? "var(--ts-accent)" : "var(--ts-line-strong)"}
          className={sealing ? "animate-corner-draw" : undefined}
          pathLength={sealing ? 100 : undefined}
          strokeDasharray={sealing ? 100 : undefined}
          strokeDashoffset={sealing ? 100 : undefined}
        />
        {[0, 18, 36, 54, 72, 90].map((x, i) => (
          <rect
            key={x}
            x={x - 3}
            y={(i === 1 || i === 4 ? 14 : i === 3 ? 0 : 28) - 3}
            width={6}
            height={6}
            fill={sealing && i === 3 ? "var(--ts-accent)" : "var(--ts-bg)"}
            stroke={sealing ? "var(--ts-accent)" : "var(--ts-line-strong)"}
          />
        ))}
        <text x={54} y={54} textAnchor="middle" className="ts-svg-code" fill="var(--ts-muted)">
          9a3b7c1d…6082
        </text>
      </g>
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
  const active = (id: StageId) => step.active.includes(id);

  const resolveReached = reached.some((item) => item.phase === "RESOLVE");
  const argvBadge = reached.find((item) => item.badge?.stage === "argv")?.badge;
  const proxyBadge = reached.find((item) => item.badge?.stage === "proxy")?.badge;
  const capabilityReached = reached.some((item) => item.id === "capabilities");
  const credentialReached = reached.some((item) => item.id === "credential");
  const githubReached = reached.some((item) => item.active.includes("github"));
  const outputReached = reached.some((item) => item.id === "output");
  const sealed = reached.some((item) => item.active.includes("merkle"));
  const sealing = animate && active("merkle");
  const denied = argvBadge?.verdict === "DENY" || proxyBadge?.verdict === "DENY";
  const resultVisible = scenario.id === "allowed" ? outputReached : denied;

  const sandboxPresent = ["materializing", "active", "collapsing"].includes(step.sandbox);
  const materializing = animate && step.sandbox === "materializing";
  const collapsing = animate && step.sandbox === "collapsing";

  const command =
    scenario.command.length > 71
      ? `${scenario.command.slice(0, 68)}…`
      : scenario.command;

  const gateValue = (id: StageId) => {
    if (id === "resolver" && resolveReached) return "gh · digest verified";
    if (id === "argv" && argvBadge) return argvBadge.rule.replace(" → ALLOW", "").replace(" → DENY", "");
    if (id === "capability" && sandboxPresent) return "read-only · proxy-only";
    if (id === "credential" && credentialReached) return "real token remains here";
    return "";
  };

  const events: { label: string; tone?: "allow" | "deny" }[] = [];
  if (resolveReached) events.push({ label: "resolve" });
  if (argvBadge)
    events.push({
      label: `argv.${argvBadge.verdict.toLowerCase()}`,
      tone: argvBadge.verdict === "ALLOW" ? "allow" : "deny",
    });
  if (sandboxPresent) events.push({ label: "spawn" });
  if (credentialReached) events.push({ label: "credential" });
  if (proxyBadge)
    events.push({
      label: `l7.${proxyBadge.verdict.toLowerCase()}`,
      tone: proxyBadge.verdict === "ALLOW" ? "allow" : "deny",
    });
  if (sealed) events.push({ label: "seal" });

  return (
    <svg
      viewBox="0 0 1200 580"
      className="h-auto w-full"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <defs>
        <pattern id="ts-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".55" fill="var(--ts-grid)" />
        </pattern>
      </defs>
      <rect width="1200" height="580" fill="url(#ts-dots)" opacity=".8" />

      <AgentSurface
        scenario={scenario}
        active={active("agent") || active("argv")}
        resultVisible={resultVisible}
      />

      {/* The structured tool call becomes a concrete executable invocation here. */}
      <g opacity={resolveReached ? 1 : 0} className="ts-node-transition">
        <path d={cutRect(350, 82, 554, 36, 8)} fill="var(--ts-panel)" stroke="var(--ts-line)" />
        <text x={364} y={104} className="ts-svg-micro" fill="var(--ts-accent)">
          RESOLVED INVOCATION
        </text>
        <text x={478} y={104} className="ts-svg-code" fill="var(--ts-text)">
          {command}
        </text>
      </g>

      {/* Broker control spine: a sequence of gates, not one generic container. */}
      <text x={350} y={136} className="ts-svg-label" fill="var(--ts-muted)">
        NONO · CAPABILITY BROKER
      </text>
      <path d="M 338 150 V 402" stroke="var(--ts-line-strong)" />
      {GATES.map((gate) => (
        <g key={gate.id}>
          <path d={`M 338 ${gate.y + 27} H 350`} stroke="var(--ts-line-strong)" />
          <Gate
            gate={gate}
            active={active(gate.id)}
            value={gateValue(gate.id)}
            verdict={gate.id === "argv" ? argvBadge?.verdict : undefined}
          />
        </g>
      ))}

      {/* Real credential is visibly locked to the supervisor side. */}
      <g opacity={credentialReached ? 1 : 0.45} className="ts-node-transition">
        <path
          d="M 365 367 h 11 v 10 h -11 z M 367 367 v -3 a 3.5 3.5 0 0 1 7 0 v 3"
          fill="none"
          stroke={credentialReached ? "var(--ts-accent)" : "var(--ts-muted)"}
        />
        <path d="M 494 375 H 514 M 514 365 V 385" stroke="var(--ts-deny)" />
      </g>

      {/* Ephemeral execution chamber, with gh unmistakably inside it. */}
      {sandboxPresent && (
        <g
          key={`sandbox-${runId}-${step.sandbox}`}
          className={collapsing ? "animate-collapse-out" : undefined}
        >
          <path
            d={SANDBOX_PATH}
            fill="var(--ts-chamber)"
            stroke={active("sandbox") ? "var(--ts-accent)" : "var(--ts-line-strong)"}
            strokeWidth={1.5}
            pathLength={materializing ? 100 : undefined}
            strokeDasharray={materializing ? 100 : undefined}
            strokeDashoffset={materializing ? 100 : undefined}
            className={cn("ts-node-transition", materializing && "animate-sandbox-draw")}
          />
          <path
            d={SANDBOX_INNER}
            fill="none"
            stroke="var(--ts-line)"
            strokeDasharray="2 6"
            className={materializing ? "animate-fade-in" : undefined}
          />
          <path d="M 580 188 H 598 M 886 188 H 904 M 580 382 H 598 M 886 382 H 904" stroke="var(--ts-accent)" strokeWidth={2} />
          <text x={612} y={166} className="ts-svg-label" fill="var(--ts-accent)">
            INVOCATION 01
          </text>
          <text x={878} y={166} textAnchor="end" className="ts-svg-micro" fill="var(--ts-muted)">
            EPHEMERAL
          </text>

          <g className={materializing ? "animate-tool-core-in" : undefined}>
            <path d={TOOL_CORE} fill="var(--ts-panel-strong)" stroke="var(--ts-accent)" />
            <path d="M 674 222 L 684 232 H 800 L 810 222 M 674 334 L 684 324 H 800 L 810 334" fill="none" stroke="var(--ts-line-strong)" />
            <text x={742} y={250} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-faint)">
              PROCESS MODULE
            </text>
            <text x={742} y={291} textAnchor="middle" className="ts-svg-tool" fill="var(--ts-text)">
              <tspan fill="var(--ts-accent)">&gt;_</tspan> gh
            </text>
            <text x={742} y={313} textAnchor="middle" className="ts-svg-code" fill="var(--ts-muted)">
              PID 48291 · issue view 1052
            </text>
          </g>

          {capabilityReached && (
            <g className="animate-fade-in">
              <CapabilityPort x={598} y={184} label="FILESYSTEM" value="WORKSPACE · READ" />
              <CapabilityPort x={886} y={184} align="right" label="WRITES" value="DENIED" danger />
              <CapabilityPort x={598} y={350} label="STDIO" value="1 MB · BOUNDED" />
              <CapabilityPort x={886} y={350} align="right" label="NETWORK" value="PROXY ONLY" />
            </g>
          )}

          {credentialReached && (
            <g className="animate-fade-in">
              <path
                d="M 650 390 H 834 L 844 400 L 834 410 H 650 L 640 400 Z"
                fill="var(--ts-active)"
                stroke="var(--ts-accent)"
              />
              <circle cx={662} cy={400} r={4} fill="none" stroke="var(--ts-accent)" />
              <path d="M 666 400 H 678 M 674 400 V 405" stroke="var(--ts-accent)" />
              <text x={687} y={404} className="ts-svg-code" fill="var(--ts-text)">
                {PHANTOM_TOKEN}
              </text>
            </g>
          )}

          {active("sandbox") && <path d="M 616 178 H 868" className="ts-sandbox-scan" />}
        </g>
      )}

      {/* L7 is a physical gateway: requests cannot route around it. */}
      <g>
        <path
          d={PROXY_GATE}
          fill={active("proxy") ? "var(--ts-active)" : "var(--ts-panel)"}
          stroke={
            proxyBadge?.verdict === "DENY"
              ? "var(--ts-deny)"
              : active("proxy")
                ? "var(--ts-accent)"
                : "var(--ts-line-strong)"
          }
          className="ts-node-transition"
        />
        <path d="M 936 266 H 954 M 1026 266 H 1044 M 936 320 H 954 M 1026 320 H 1044" stroke="var(--ts-line-strong)" />
        <text x={990} y={250} textAnchor="middle" className="ts-svg-label" fill="var(--ts-text)">
          L7 GATE
        </text>
        <text x={990} y={270} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-muted)">
          LOCALHOST PROXY
        </text>
        {proxyBadge ? (
          <>
            <text
              x={990}
              y={302}
              textAnchor="middle"
              className="ts-svg-code"
              fill={proxyBadge.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-allow)"}
            >
              {proxyBadge.rule.includes("/graphql") ? "POST /graphql" : "POST /…/comments"}
            </text>
            <text
              x={990}
              y={327}
              textAnchor="middle"
              className="ts-svg-label"
              fill={proxyBadge.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-allow)"}
            >
              {proxyBadge.verdict}
            </text>
          </>
        ) : (
          <text x={990} y={304} textAnchor="middle" className="ts-svg-code" fill="var(--ts-faint)">
            method / path
          </text>
        )}
      </g>

      {/* API endpoint uses a target form, not another generic rectangle. */}
      <g opacity={proxyBadge?.verdict === "DENY" ? 0.28 : 1} className="ts-node-transition">
        <circle
          cx={1148}
          cy={294}
          r={43}
          fill={githubReached ? "var(--ts-active)" : "var(--ts-panel)"}
          stroke={githubReached ? "var(--ts-accent)" : "var(--ts-line-strong)"}
        />
        <circle cx={1148} cy={294} r={31} fill="none" stroke="var(--ts-line)" strokeDasharray="2 5" />
        <text x={1148} y={299} textAnchor="middle" className="ts-svg-tool-small" fill="var(--ts-text)">
          GH
        </text>
        <text x={1148} y={352} textAnchor="middle" className="ts-svg-label" fill="var(--ts-muted)">
          GITHUB API
        </text>
        <text x={1148} y={368} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-faint)">
          api.github.com
        </text>
      </g>

      {/* Structural traces and state-specific moving signals. */}
      <g fill="none" stroke="var(--ts-line-strong)">
        <path d={PATHS["agent-supervisor"]} />
        <path d={PATHS.spawn} opacity={sandboxPresent ? 1 : 0.25} />
        <path d={PATHS.egress} opacity={sandboxPresent ? 1 : 0.25} />
        <path d={PATHS["proxy-github"]} />
      </g>
      <g fill="none" stroke="var(--ts-line)" strokeDasharray="2 5">
        <path d={PATHS["audit-drop-argv"]} />
        <path d={PATHS["audit-drop-proxy"]} />
        <path d={PATHS["audit-drop-sandbox"]} opacity={sandboxPresent ? 1 : 0.2} />
      </g>

      <AuditSpine events={events} sealing={sealing} runId={runId} />

      {animate &&
        step.pulses?.map((pulse) => (
          <path
            key={`${runId}-${stepIndex}-${pulse.path}-${pulse.reverse ? "r" : "f"}`}
            d={PATHS[pulse.path]}
            pathLength={100}
            fill="none"
            stroke="var(--ts-accent)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="10 190"
            strokeDashoffset={pulse.reverse ? -102 : 14}
            className={pulse.reverse ? "animate-pulse-travel-reverse" : "animate-pulse-travel"}
            style={
              {
                "--pulse-duration": `${pulse.durMs ?? Math.max(step.duration - 250, 300)}ms`,
                animationDelay: pulse.delayMs ? `${pulse.delayMs}ms` : undefined,
              } as CSSProperties
            }
          />
        ))}
    </svg>
  );
}
