import { PHANTOM_TOKEN, type Scenario } from "./scenarios";
import { cn } from "@/lib/utils";

interface MobileFlowProps {
  scenario: Scenario;
  stepIndex: number;
}

function Verdict({ value }: { value: "ALLOW" | "DENY" }) {
  return (
    <span
      className={cn(
        "border px-1.5 py-0.5 font-code text-[9px] tracking-wider",
        value === "ALLOW"
          ? "border-(--ts-allow)/60 text-(--ts-allow)"
          : "border-(--ts-deny)/60 text-(--ts-deny)"
      )}
    >
      {value}
    </span>
  );
}

function TraceArrow({ active }: { active?: boolean }) {
  return (
    <div aria-hidden="true" className="flex h-8 justify-center">
      <div
        className={cn(
          "relative w-px",
          active ? "bg-(--ts-accent)" : "bg-(--ts-line)"
        )}
      >
        <span
          className={cn(
            "absolute -bottom-0.5 -left-[3px] size-[7px] rotate-45 border-r border-b",
            active ? "border-(--ts-accent)" : "border-(--ts-line-strong)"
          )}
        />
      </div>
    </div>
  );
}

export default function MobileFlow({ scenario, stepIndex }: MobileFlowProps) {
  const step = scenario.steps[stepIndex];
  const reached = scenario.steps.slice(0, stepIndex + 1);

  const resolved = reached.some((item) => item.phase === "RESOLVE");
  const argvBadge = reached.find((item) => item.badge?.stage === "argv")?.badge;
  const proxyBadge = reached.find((item) => item.badge?.stage === "proxy")?.badge;
  const spawned = reached.some((item) =>
    ["materializing", "active", "collapsing"].includes(item.sandbox)
  );
  const capabilityReached = reached.some((item) => item.id === "capabilities");
  const credentialReached = reached.some((item) => item.id === "credential");
  const outputReached = reached.some((item) => item.id === "output");
  const sealed = reached.some((item) => item.active.includes("merkle"));
  const denied = argvBadge?.verdict === "DENY" || proxyBadge?.verdict === "DENY";
  const humanScenario = scenario.id === "human-approved";
  const humanReached = reached.some((item) => item.active.includes("human"));
  const humanApproved = reached.some((item) => item.id === "approved");
  const humanPending = humanReached && !humanApproved;
  const success = scenario.id === "allowed" || scenario.id === "human-approved";
  const resultVisible = success ? outputReached : denied;
  const procLabel = scenario.command.replace(/^gh\s+/, "").split(" ").slice(0, 3).join(" ");

  return (
    <div className="mx-auto max-w-md">
      <div className="ts-mobile-panel border border-(--ts-line) bg-(--ts-panel) p-4">
        <div className="mb-4 flex items-center justify-between border-b border-(--ts-line) pb-3">
          <div className="flex items-center gap-2">
            <span className="size-1.5 bg-(--ts-accent)" />
            <span className="font-code text-[9px] tracking-[0.16em] text-(--ts-muted)">
              AGENT SESSION
            </span>
          </div>
          <span className="font-code text-[8px] text-(--ts-faint)">LIVE</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1 font-code text-[8px] tracking-wider text-(--ts-faint)">
              USER
            </div>
            <p className="text-xs text-(--ts-text)">{scenario.agent.user}</p>
          </div>
          <div>
            <div className="mb-1 font-code text-[8px] tracking-wider text-(--ts-accent)">
              AGENT
            </div>
            <p className="text-xs text-(--ts-text)">{scenario.agent.response}</p>
          </div>
          <div className="border-l-2 border-(--ts-accent) bg-(--ts-surface) p-3">
            <div className="mb-1 font-code text-[8px] tracking-wider text-(--ts-muted)">
              TOOL CALL
            </div>
            <div className="text-xs font-medium text-(--ts-text)">{scenario.agent.tool}</div>
            <code className="mt-1 block text-[10px] text-(--ts-muted)">
              {scenario.agent.toolMeta}
            </code>
          </div>
          <div
            className={cn(
              "border p-3 transition-opacity",
              resultVisible
                ? "border-(--ts-line) bg-(--ts-surface) opacity-100"
                : "border-(--ts-line) opacity-40"
            )}
          >
            <div
              className={cn(
                "mb-1 font-code text-[8px] tracking-wider",
                success ? "text-(--ts-allow)" : "text-(--ts-deny)"
              )}
            >
              {success ? "TOOL RESULT" : "TOOL DENIED"}
            </div>
            <div className="text-[11px] text-(--ts-text)">
              {resultVisible ? scenario.agent.result : "Awaiting supervisor…"}
            </div>
            <code className="mt-1 block text-[9px] text-(--ts-muted)">
              {resultVisible ? scenario.agent.resultMeta : "policy evaluation pending"}
            </code>
          </div>
        </div>
      </div>

      <TraceArrow active={step.phase === "REQUEST"} />

      <div className="border border-(--ts-line) bg-(--ts-panel) p-4">
        <div className="mb-3 font-code text-[9px] tracking-[0.16em] text-(--ts-muted)">
          NONO · POLICY + CAPABILITY BROKER
        </div>
        {resolved && (
          <code className="mb-3 block break-all border border-(--ts-line) bg-(--ts-inset) p-2 text-[9px] leading-relaxed text-(--ts-text-soft)">
            <span className="text-(--ts-accent)">exec </span>
            {scenario.command}
          </code>
        )}
        <div className="grid gap-px bg-(--ts-line)">
          {[
            ["01", "EXECUTABLE", resolved ? "gh · digest verified" : "identity + digest"],
            [
              "02",
              "ARGV POLICY",
              humanReached
                ? "no rule matched → escalate"
                : argvBadge
                  ? argvBadge.rule.replace(" → ALLOW", "").replace(" → DENY", "")
                  : "caller + arguments",
            ],
            ["03", "CAPABILITIES", spawned ? "read-only · proxy-only" : "minimal grants"],
            ["04", "CREDENTIAL", credentialReached ? "real token remains here" : "supervisor vault"],
          ].map(([index, title, value], i) => {
            const active =
              (i === 0 && step.phase === "RESOLVE") ||
              (i === 1 && step.phase === "AUTHORIZE") ||
              (i === 2 && step.phase === "SPAWN") ||
              (i === 3 && step.id === "credential");
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 bg-(--ts-panel) px-3 py-2.5",
                  active && "border-l-2 border-(--ts-accent) bg-(--ts-active)"
                )}
              >
                <span className="font-code text-[8px] text-(--ts-faint)">{index}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-code text-[8px] tracking-wider text-(--ts-text-soft)">
                    {title}
                  </div>
                  <code className="block truncate text-[9px] text-(--ts-muted)">{value}</code>
                </div>
                {i === 1 && argvBadge && <Verdict value={argvBadge.verdict} />}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "relative ml-10 mt-3 border px-3 py-3 transition-colors",
          humanApproved
            ? "border-(--ts-allow)/70 bg-(--ts-allow)/5"
            : humanPending
              ? "border-(--ts-warn)/90 bg-(--ts-warn-surface)"
              : humanScenario
                ? "border-(--ts-warn)/45 bg-(--ts-panel)"
                : "border-(--ts-line) bg-(--ts-panel) opacity-55"
        )}
      >
        {humanScenario && (
          <div
            className={cn(
              "absolute top-5 -left-10 w-10 border-t border-dashed",
              humanReached ? "border-(--ts-warn)/80" : "border-(--ts-warn)/40"
            )}
          />
        )}
        <div
          className={cn(
            "font-code text-[7px] tracking-[0.14em]",
            humanScenario ? "text-(--ts-warn)" : "text-(--ts-faint)"
          )}
        >
          OUTSIDE PROVIDED POLICY
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold tracking-wide text-(--ts-text)">
            Human approval
          </span>
          {humanApproved ? (
            <span className="border border-(--ts-allow)/60 px-1.5 py-0.5 font-code text-[8px] tracking-wider text-(--ts-allow)">
              APPROVED
            </span>
          ) : humanPending ? (
            <span className="ts-status-pulse border border-(--ts-warn)/60 px-1.5 py-0.5 font-code text-[8px] tracking-wider text-(--ts-warn)">
              PENDING
            </span>
          ) : (
            <code className="text-[8px] text-(--ts-muted)">approve · deny</code>
          )}
        </div>
        <div className="mt-1 font-code text-[7px] tracking-wider text-(--ts-faint)">
          HUMAN-IN-THE-LOOP
        </div>
      </div>

      <TraceArrow active={step.phase === "SPAWN"} />

      <div
        className={cn(
          "ts-mobile-chamber relative min-h-64 p-5 transition-all",
          spawned
            ? "border border-(--ts-accent)/70 bg-(--ts-chamber) opacity-100"
            : "border border-(--ts-line) bg-(--ts-surface-faint) opacity-35"
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="font-code text-[9px] tracking-[0.15em] text-(--ts-accent)">
            NONO MICRO SANDBOX
          </span>
          <span className="font-code text-[8px] text-(--ts-faint)">INVOCATION-SCOPED</span>
        </div>

        {spawned ? (
          <>
            <div className="ts-mobile-tool-core mx-auto flex h-24 max-w-48 flex-col items-center justify-center border border-(--ts-accent)/70 bg-(--ts-panel-strong)">
              <span className="font-code text-[8px] tracking-wider text-(--ts-faint)">
                PROCESS MODULE
              </span>
              <div className="my-1 font-code text-xl text-(--ts-text)">
                <span className="text-(--ts-accent)">&gt;_</span> gh
              </div>
              <code className="text-[9px] text-(--ts-muted)">PID 48291 · {procLabel}</code>
            </div>

            {capabilityReached && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  ["FILESYSTEM", "WORKSPACE · READ"],
                  ["WRITES", "DENIED"],
                  ["STDIO", "1 MB · BOUNDED"],
                  ["NETWORK", "PROXY ONLY"],
                ].map(([label, value]) => (
                  <div key={label} className="border border-(--ts-line) bg-(--ts-inset) p-2">
                    <div className="font-code text-[7px] tracking-wider text-(--ts-faint)">
                      {label}
                    </div>
                    <code
                      className={cn(
                        "mt-1 block text-[8px]",
                        value === "DENIED" ? "text-(--ts-deny)" : "text-(--ts-text-soft)"
                      )}
                    >
                      {value}
                    </code>
                  </div>
                ))}
              </div>
            )}

            {credentialReached && (
              <div className="mt-3 border border-(--ts-accent)/50 bg-(--ts-active) px-3 py-2 text-center">
                <code className="text-[9px] text-(--ts-accent)">{PHANTOM_TOKEN}</code>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-40 items-center justify-center text-center font-code text-[9px] text-(--ts-faint)">
            {argvBadge?.verdict === "DENY"
              ? "NO SANDBOX CREATED · BLOCKED AT ARGV"
              : "AWAITING SYSCALL"}
          </div>
        )}
      </div>

      <TraceArrow active={step.phase === "EXECUTE"} />

      <div
        className={cn(
          "ts-mobile-gate border p-4",
          proxyBadge?.verdict === "DENY"
            ? "border-(--ts-deny)/50 bg-(--ts-deny)/5"
            : step.phase === "EXECUTE"
              ? "border-(--ts-accent)/50 bg-(--ts-chamber)"
              : "border-(--ts-line) bg-(--ts-surface-faint)"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-code text-[9px] tracking-[0.15em] text-(--ts-text-soft)">
              L7 PROXY
            </div>
            <div className="mt-1 font-code text-[8px] text-(--ts-faint)">
              INSPECT
            </div>
          </div>
          {proxyBadge && <Verdict value={proxyBadge.verdict} />}
        </div>
        {proxyBadge && (
          <code className="mt-3 block break-all text-[9px] text-(--ts-muted)">
            {proxyBadge.rule.replace(" → ALLOW", "").replace(" → DENY", "")}
          </code>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span className="font-code text-[7px] text-(--ts-faint)">IN</span>
          <div className="h-px flex-1 bg-(--ts-accent)/60" />
          <div className="flex size-8 items-center justify-center rounded-full border border-(--ts-line-strong) font-code text-[10px] text-(--ts-accent)">
            ⇄
          </div>
          <div className="h-px flex-1 bg-(--ts-line)" />
          <span className="font-code text-[7px] text-(--ts-faint)">OUT</span>
          <svg
            viewBox="0 0 48 48"
            className={cn(
              "size-12",
              proxyBadge?.verdict === "DENY" && "opacity-35"
            )}
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="21" fill="none" stroke="var(--ts-line-strong)" />
            <ellipse cx="24" cy="24" rx="9" ry="21" fill="none" stroke="var(--ts-line)" />
            <path
              d="M4 17 Q24 24 44 17 M4 31 Q24 24 44 31 M3 24 H45"
              fill="none"
              stroke="var(--ts-line)"
            />
            <path
              d="M16 10 L22 8 L27 12 L33 11 L37 16 L33 21 L25 21 L21 26 L15 22 L12 16 Z"
              fill={proxyBadge?.verdict === "ALLOW" ? "var(--ts-accent)" : "var(--ts-line-strong)"}
              opacity=".7"
            />
            <circle
              cx="36"
              cy="14"
              r="2.5"
              fill={proxyBadge?.verdict === "ALLOW" ? "var(--ts-accent)" : "var(--ts-faint)"}
            />
          </svg>
        </div>
        <div
            className={cn(
              "mt-2 text-right font-code text-[7px] tracking-wider",
              proxyBadge?.verdict === "DENY"
                ? "text-(--ts-faint)/70"
                : "text-(--ts-muted)"
            )}
          >
            INTERNET · API.GITHUB.COM
        </div>
      </div>

      <TraceArrow active={step.phase === "AUDIT"} />

      <div className="border-t border-(--ts-line) pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-code text-[9px] font-medium tracking-[0.15em] text-(--ts-text-soft)">
              TAMPER-EVIDENT AUDIT
            </div>
            <code className="mt-2 block text-[10px] font-medium text-(--ts-text-soft)">
              resolve → argv → spawn → l7 → seal
            </code>
          </div>
          <div className={cn("text-right", !sealed && "opacity-35")}>
            <div className="font-code text-[8px] text-(--ts-accent)">MERKLE ROOT</div>
            <code className="mt-1 block text-[9px] text-(--ts-muted)">9a3b7c1d…6082</code>
          </div>
        </div>
      </div>
    </div>
  );
}
