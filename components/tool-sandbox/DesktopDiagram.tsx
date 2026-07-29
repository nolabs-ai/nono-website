import type { CSSProperties } from "react";
import {
  PHANTOM_TOKEN,
  type PathId,
  type Scenario,
  type StageId,
} from "./scenarios";

interface DesktopDiagramProps {
  scenario: Scenario;
  stepIndex: number;
  runId: number;
  animate: boolean;
}

const PATHS: Record<PathId, string> = {
  "agent-supervisor": "M 300 294 H 350",
  spawn: "M 520 294 H 720",
  "phantom-cred": "M 520 382 H 786",
  escalate: "M 520 226 H 538 V 188 H 556",
  "approval-return": "M 634 236 V 294",
  egress: "M 1046 294 H 1076",
  "proxy-github": "M 1184 294 H 1244",
  "audit-drop-argv": "M 438 270 V 520",
  "audit-drop-proxy": "M 1130 362 V 520",
  "audit-drop-sandbox": "M 882 444 V 520",
  "audit-lane": "M 176 520 H 1234",
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
  "M 950 218 H 1030 L 1044 232 V 348 L 1030 362 H 950 L 936 348 V 232 Z";

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
  success,
}: {
  scenario: Scenario;
  active: boolean;
  resultVisible: boolean;
  success: boolean;
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
          fill={success ? "var(--ts-allow)" : "var(--ts-deny)"}
        >
          {success ? "TOOL RESULT" : "TOOL DENIED"}
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
      <text x={176} y={500} className="ts-svg-label" fill="var(--ts-text)">
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
            <text x={x} y={544} textAnchor="middle" className="ts-svg-audit" fill="var(--ts-text)">
              {event.label}
            </text>
          </g>
        );
      })}

      <g transform="translate(1140 488)">
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
  const humanScenario = scenario.id === "human-approved";
  const humanReached = reached.some((item) => item.active.includes("human"));
  const humanApproved = reached.some((item) => item.id === "approved");
  const humanPending = humanReached && !humanApproved;
  const success = scenario.id === "allowed" || scenario.id === "human-approved";
  const resultVisible = success ? outputReached : denied;

  const sandboxPresent = ["materializing", "active", "collapsing"].includes(step.sandbox);
  const spawnReached = reached.some((item) => item.sandbox === "materializing");
  const materializing = animate && step.sandbox === "materializing";
  const collapsing = animate && step.sandbox === "collapsing";

  const command =
    scenario.command.length > 71
      ? `${scenario.command.slice(0, 68)}…`
      : scenario.command;
  const procLabel = scenario.command.replace(/^gh\s+/, "").split(" ").slice(0, 3).join(" ");

  const gateValue = (id: StageId) => {
    if (id === "resolver" && resolveReached) return "gh · digest verified";
    if (id === "argv" && humanReached) return "no rule matched → escalate";
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
  if (humanApproved) events.push({ label: "human.approve", tone: "allow" });
  if (spawnReached) events.push({ label: "spawn" });
  if (credentialReached) events.push({ label: "credential" });
  if (proxyBadge)
    events.push({
      label: `l7.${proxyBadge.verdict.toLowerCase()}`,
      tone: proxyBadge.verdict === "ALLOW" ? "allow" : "deny",
    });
  if (sealed) events.push({ label: "seal" });

  return (
    <svg
      viewBox="0 58 1340 510"
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
        success={success}
      />

      {/* The agent's intent becomes a concrete executable invocation here. */}
      <g opacity={resolveReached ? 1 : 0.58} className="ts-node-transition">
        <path d={cutRect(350, 82, 554, 36, 8)} fill="var(--ts-panel)" stroke="var(--ts-line)" />
        <text x={364} y={104} className="ts-svg-micro" fill="var(--ts-accent)">
          {resolveReached ? "RESOLVED INVOCATION" : "TOOL INTENT"}
        </text>
        <text x={478} y={104} className="ts-svg-code" fill="var(--ts-text)">
          {resolveReached ? command : scenario.agent.tool}
        </text>
      </g>

      {/* Broker control spine: a sequence of gates, not one generic container. */}
      <text x={350} y={136} className="ts-svg-label" fill="var(--ts-muted)">
        NONO · POLICY + CAPABILITY BROKER
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

      {/* A genuine external breakout, off to the side of the main corridor:
          invocations with no matching rule leave the argv gate for a human
          decision, then rejoin the scoped execution path below. */}
      <g className="ts-node-transition" opacity={humanScenario ? 1 : 0.55}>
        {humanScenario && (
          <>
            <path
              d={PATHS.escalate}
              fill="none"
              stroke={humanReached ? "rgba(226,180,111,.85)" : "rgba(226,180,111,.45)"}
              className="ts-node-transition"
            />
            <path
              d="M 549 183 L 554 188 L 549 193"
              fill="none"
              stroke={humanReached ? "rgba(226,180,111,.85)" : "rgba(226,180,111,.5)"}
              className="ts-node-transition"
            />
          </>
        )}
        <path
          d={cutRect(556, 140, 156, 96, 11)}
          fill={humanReached ? "rgba(226,180,111,.06)" : "var(--ts-panel)"}
          stroke={
            humanApproved
              ? "var(--ts-allow)"
              : humanPending
                ? "rgba(226,180,111,.95)"
                : humanScenario
                  ? "rgba(226,180,111,.65)"
                  : "var(--ts-line-strong)"
          }
          className="ts-node-transition"
        />
        <circle
          cx={690}
          cy={166}
          r={6}
          fill="none"
          stroke={humanScenario ? "rgba(226,180,111,.85)" : "var(--ts-line-strong)"}
          className="ts-node-transition"
        />
        <path
          d="M 680 183 Q 690 172 700 183"
          fill="none"
          stroke={humanScenario ? "rgba(226,180,111,.85)" : "var(--ts-line-strong)"}
          className="ts-node-transition"
        />
        <text
          x={568}
          y={159}
          className="ts-svg-micro ts-node-transition"
          fill={humanScenario ? "rgba(226,180,111,.85)" : "var(--ts-faint)"}
        >
          OUTSIDE PROVIDED POLICY
        </text>
        <text
          x={568}
          y={181}
          className="ts-svg-label ts-node-transition"
          fill={humanScenario ? "var(--ts-text)" : "var(--ts-muted)"}
        >
          HUMAN APPROVAL
        </text>
        <path d="M 568 193 H 700" stroke="var(--ts-line)" />
        {humanApproved ? (
          <text x={568} y={211} className="ts-svg-code" fill="var(--ts-allow)">
            decision: approve
          </text>
        ) : humanPending ? (
          <text x={568} y={211} className="ts-svg-code" fill="var(--ts-text)">
            reviewing invocation…
          </text>
        ) : (
          <text x={568} y={211} className="ts-svg-code" fill="var(--ts-muted)">
            approve · deny
          </text>
        )}
        {humanApproved ? (
          <g>
            <path
              d="M 568 222 l 3 3 l 5.5 -5.5"
              fill="none"
              stroke="var(--ts-allow)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x={582} y={226} className="ts-svg-micro" fill="var(--ts-allow)">
              APPROVED
            </text>
          </g>
        ) : humanPending ? (
          <g>
            <circle cx={572} cy={223} r={3} fill="rgba(226,180,111,.9)" className="ts-status-pulse" />
            <text x={582} y={226} className="ts-svg-micro" fill="rgba(226,180,111,.9)">
              PENDING
            </text>
          </g>
        ) : (
          <text x={568} y={226} className="ts-svg-micro" fill="var(--ts-faint)">
            HUMAN-IN-THE-LOOP
          </text>
        )}
        {/* Approval rejoins the normal scoped execution path. */}
        {humanScenario && (
          <>
            <path
              d={PATHS["approval-return"]}
              fill="none"
              stroke={
                humanApproved ? "rgba(226,180,111,.8)" : "rgba(226,180,111,.45)"
              }
              strokeDasharray="2 4"
              className="ts-node-transition"
            />
            <path
              d="M 630 287 L 634 292 L 638 287"
              fill="none"
              stroke={humanApproved ? "rgba(226,180,111,.8)" : "rgba(226,180,111,.5)"}
              className="ts-node-transition"
            />
          </>
        )}
      </g>

      {/* Real credential is visibly locked to the supervisor side. */}
      <g opacity={credentialReached ? 1 : 0.45} className="ts-node-transition">
        <path
          d="M 365 367 h 11 v 10 h -11 z M 367 367 v -3 a 3.5 3.5 0 0 1 7 0 v 3"
          fill="none"
          stroke={credentialReached ? "var(--ts-accent)" : "var(--ts-muted)"}
        />
        <path d="M 494 375 H 514 M 514 365 V 385" stroke="var(--ts-deny)" />
      </g>

      {/* A dormant execution slot fills the pre-authorization state without
          implying that a sandbox or child process already exists. */}
      {!sandboxPresent && (
        <g
          transform="translate(140 0)"
          className="ts-node-transition"
          opacity={1}
        >
          <path
            d={SANDBOX_PATH}
            fill="var(--ts-chamber)"
            stroke={argvBadge?.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-line-strong)"}
            strokeWidth={1.25}
          />
          <path
            d={SANDBOX_INNER}
            fill="none"
            stroke="var(--ts-line)"
            strokeDasharray="2 6"
          />
          <text x={612} y={166} className="ts-svg-label" fill="var(--ts-muted)">
            NONO MICRO SANDBOX
          </text>
          <text x={878} y={166} textAnchor="end" className="ts-svg-micro" fill="var(--ts-faint)">
            INVOCATION-SCOPED
          </text>

          <path
            d="M 610 184 H 590 V 204 M 874 184 H 894 V 204 M 610 404 H 590 V 384 M 874 404 H 894 V 384"
            fill="none"
            stroke={argvBadge?.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-line-strong)"}
          />
          <circle
            cx={742}
            cy={294}
            r={112}
            fill="none"
            stroke="var(--ts-line)"
            strokeDasharray="1 9"
          />
          <path
            d="M 658 220 A 112 112 0 0 1 826 220 M 826 368 A 112 112 0 0 1 658 368"
            fill="none"
            stroke="var(--ts-line-strong)"
          />
          <path
            d={TOOL_CORE}
            fill="rgba(255,255,255,0.012)"
            stroke={argvBadge?.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-line-strong)"}
          />
          <path
            d="M 674 222 L 684 232 H 800 L 810 222 M 674 334 L 684 324 H 800 L 810 334"
            fill="none"
            stroke="var(--ts-line)"
          />
          <text x={742} y={250} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-faint)">
            PROCESS BAY
          </text>
          <circle
            cx={742}
            cy={281}
            r={17}
            fill="none"
            stroke={argvBadge?.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-line-strong)"}
          />
          <path
            d={
              argvBadge?.verdict === "DENY"
                ? "M 734 273 L 750 289 M 750 273 L 734 289"
                : "M 742 269 V 293 M 730 281 H 754"
            }
            stroke={argvBadge?.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-faint)"}
          />
          <text
            x={742}
            y={320}
            textAnchor="middle"
            className="ts-svg-label"
            fill={argvBadge?.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-faint)"}
          >
            {argvBadge?.verdict === "DENY" ? "SPAWN SUPPRESSED" : "AWAITING SYSCALL"}
          </text>
          <path d="M 628 294 H 654 M 830 294 H 856" stroke="var(--ts-line-strong)" />
          <text x={742} y={430} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-faint)">
            {argvBadge?.verdict === "DENY"
              ? "NO CHILD PROCESS CREATED"
              : "BOUNDARY ACTIVATES AFTER AUTHORIZATION"}
          </text>
        </g>
      )}

      {/* Ephemeral execution chamber, with gh unmistakably inside it. */}
      {sandboxPresent && (
        <g
          transform="translate(140 0)"
          key={`sandbox-${runId}-${step.sandbox}`}
          className={collapsing ? "animate-collapse-out" : undefined}
        >
          {/* The complete edge remains visible while an orange signal traces it. */}
          <path
            d={SANDBOX_PATH}
            fill="var(--ts-chamber)"
            stroke="var(--ts-line-strong)"
            strokeWidth={1.25}
          />
          {materializing ? (
            <path
              d={SANDBOX_PATH}
              fill="none"
              stroke="var(--ts-accent)"
              strokeWidth={1.75}
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100}
              className="animate-sandbox-draw"
            />
          ) : (
            <path
              d={SANDBOX_PATH}
              fill="none"
              stroke={active("sandbox") ? "var(--ts-accent)" : "var(--ts-line-strong)"}
              strokeWidth={1.5}
              className="ts-node-transition"
            />
          )}
          <path
            d={SANDBOX_INNER}
            fill="none"
            stroke="var(--ts-line)"
            strokeDasharray="2 6"
          />
          <path d="M 580 188 H 598 M 886 188 H 904 M 580 382 H 598 M 886 382 H 904" stroke="var(--ts-accent)" strokeWidth={2} />
          <text x={612} y={166} className="ts-svg-label" fill="var(--ts-accent)">
            NONO MICRO SANDBOX
          </text>
          <text x={878} y={166} textAnchor="end" className="ts-svg-micro" fill="var(--ts-muted)">
            INVOCATION-SCOPED
          </text>

          <g>
            <path d={TOOL_CORE} fill="var(--ts-panel-strong)" stroke="var(--ts-accent)" />
            <path d="M 674 222 L 684 232 H 800 L 810 222 M 674 334 L 684 324 H 800 L 810 334" fill="none" stroke="var(--ts-line-strong)" />
            <text x={742} y={250} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-faint)">
              PROCESS MODULE
            </text>
            <text x={742} y={291} textAnchor="middle" className="ts-svg-tool" fill="var(--ts-text)">
              <tspan fill="var(--ts-accent)">&gt;_</tspan> gh
            </text>
            <text x={742} y={313} textAnchor="middle" className="ts-svg-code" fill="var(--ts-muted)">
              PID 48291 · {procLabel}
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
        <g transform="translate(140 0)">
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
        {/* Distinct ingress and egress ports make the intermediary role explicit. */}
        <path d="M 936 258 H 954 M 1026 258 H 1044 M 936 322 H 954 M 1026 322 H 1044" stroke="var(--ts-line-strong)" />
        <path d="M 948 287 H 968 L 974 281 M 968 287 L 974 293" fill="none" stroke="var(--ts-accent)" />
        <path d="M 1006 287 H 1026 L 1020 281 M 1026 287 L 1020 293" fill="none" stroke="var(--ts-line-strong)" />
        <circle cx={990} cy={287} r={15} fill="var(--ts-panel-strong)" stroke="var(--ts-line-strong)" />
        <path
          d="M 982 282 H 997 L 993 278 M 997 282 L 993 286 M 998 292 H 983 L 987 288 M 983 292 L 987 296"
          fill="none"
          stroke={active("proxy") ? "var(--ts-accent)" : "var(--ts-muted)"}
        />
        <text x={990} y={242} textAnchor="middle" className="ts-svg-label" fill="var(--ts-text)">
          L7 PROXY
        </text>
        <text x={990} y={257} textAnchor="middle" className="ts-svg-micro" fill="var(--ts-muted)">
          INSPECT
        </text>
        {proxyBadge ? (
          <>
            <text
              x={990}
              y={320}
              textAnchor="middle"
              className="ts-svg-code"
              fill={proxyBadge.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-allow)"}
            >
              {proxyBadge.rule.replace(" → ALLOW", "").replace(" → DENY", "")}
            </text>
            <text
              x={990}
              y={344}
              textAnchor="middle"
              className="ts-svg-label"
              fill={proxyBadge.verdict === "DENY" ? "var(--ts-deny)" : "var(--ts-allow)"}
            >
              {proxyBadge.verdict}
            </text>
          </>
        ) : (
          <text x={990} y={329} textAnchor="middle" className="ts-svg-code" fill="var(--ts-faint)">
            method / path
          </text>
        )}
        </g>
      </g>

      {/* The upstream is a globe rather than an abstract GH target, making the
          sandbox → proxy → internet path legible at a glance. */}
      <g
        transform="translate(112 0)"
        opacity={proxyBadge?.verdict === "DENY" ? 0.28 : 1}
        className="ts-node-transition"
      >
        <circle
          cx={1148}
          cy={294}
          r={43}
          fill={githubReached ? "var(--ts-active)" : "var(--ts-panel)"}
          stroke={githubReached ? "var(--ts-accent)" : "var(--ts-line-strong)"}
        />
        <ellipse cx={1148} cy={294} rx={18} ry={43} fill="none" stroke="var(--ts-line-strong)" />
        <path
          d="M 1108 280 Q 1148 294 1188 280 M 1108 308 Q 1148 294 1188 308 M 1105 294 H 1191"
          fill="none"
          stroke="var(--ts-line-strong)"
        />
        <path
          d="M 1132 266 L 1142 262 L 1150 267 L 1158 265 L 1165 274 L 1160 282 L 1148 284 L 1142 292 L 1132 286 L 1127 276 Z
             M 1155 300 L 1166 304 L 1169 316 L 1161 326 L 1153 318 L 1148 308 Z"
          fill={githubReached ? "var(--ts-accent)" : "var(--ts-line-strong)"}
          opacity={githubReached ? 0.8 : 0.45}
        />
        <circle
          cx={1170}
          cy={276}
          r={3.5}
          fill={githubReached ? "var(--ts-accent)" : "var(--ts-muted)"}
          className={githubReached ? "ts-status-pulse" : undefined}
        />
        <text x={1148} y={352} textAnchor="middle" className="ts-svg-label" fill="var(--ts-muted)">
          INTERNET · GITHUB API
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
