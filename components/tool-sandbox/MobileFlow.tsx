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
          ? "border-[#45b78a]/60 text-[#45b78a]"
          : "border-[#ef6a6a]/60 text-[#ef6a6a]"
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
          active ? "bg-[#e8734a]" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "absolute -bottom-0.5 -left-[3px] size-[7px] rotate-45 border-r border-b",
            active ? "border-[#e8734a]" : "border-white/15"
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
      <div className="ts-mobile-panel border border-white/10 bg-[#101313] p-4">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="size-1.5 bg-[#e8734a]" />
            <span className="font-code text-[9px] tracking-[0.16em] text-[#8b8f8a]">
              AGENT SESSION
            </span>
          </div>
          <span className="font-code text-[8px] text-[#565b56]">LIVE</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1 font-code text-[8px] tracking-wider text-[#666b66]">
              USER
            </div>
            <p className="text-xs text-[#e7e6e1]">{scenario.agent.user}</p>
          </div>
          <div>
            <div className="mb-1 font-code text-[8px] tracking-wider text-[#e8734a]">
              AGENT
            </div>
            <p className="text-xs text-[#e7e6e1]">{scenario.agent.response}</p>
          </div>
          <div className="border-l-2 border-[#e8734a] bg-white/[0.035] p-3">
            <div className="mb-1 font-code text-[8px] tracking-wider text-[#777c77]">
              TOOL CALL
            </div>
            <div className="text-xs font-medium text-[#f3f2ed]">{scenario.agent.tool}</div>
            <code className="mt-1 block text-[10px] text-[#8b8f8a]">
              {scenario.agent.toolMeta}
            </code>
          </div>
          <div
            className={cn(
              "border p-3 transition-opacity",
              resultVisible
                ? "border-white/10 bg-white/[0.035] opacity-100"
                : "border-white/[0.06] opacity-40"
            )}
          >
            <div
              className={cn(
                "mb-1 font-code text-[8px] tracking-wider",
                success ? "text-[#45b78a]" : "text-[#ef6a6a]"
              )}
            >
              {success ? "TOOL RESULT" : "TOOL DENIED"}
            </div>
            <div className="text-[11px] text-[#e7e6e1]">
              {resultVisible ? scenario.agent.result : "Awaiting supervisor…"}
            </div>
            <code className="mt-1 block text-[9px] text-[#777c77]">
              {resultVisible ? scenario.agent.resultMeta : "policy evaluation pending"}
            </code>
          </div>
        </div>
      </div>

      <TraceArrow active={step.phase === "REQUEST"} />

      <div className="border border-white/10 bg-[#0e1111] p-4">
        <div className="mb-3 font-code text-[9px] tracking-[0.16em] text-[#8b8f8a]">
          NONO · POLICY + CAPABILITY BROKER
        </div>
        {resolved && (
          <code className="mb-3 block break-all border border-white/[0.08] bg-black/20 p-2 text-[9px] leading-relaxed text-[#c8c8c2]">
            <span className="text-[#e8734a]">exec </span>
            {scenario.command}
          </code>
        )}
        <div className="grid gap-px bg-white/[0.08]">
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
                  "flex items-center gap-3 bg-[#101313] px-3 py-2.5",
                  active && "border-l-2 border-[#e8734a] bg-[#e8734a]/[0.06]"
                )}
              >
                <span className="font-code text-[8px] text-[#555a55]">{index}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-code text-[8px] tracking-wider text-[#d4d4ce]">
                    {title}
                  </div>
                  <code className="block truncate text-[9px] text-[#707570]">{value}</code>
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
            ? "border-[#45b78a]/70 bg-[#45b78a]/[0.05]"
            : humanPending
              ? "border-[#e2b46f]/90 bg-[#e2b46f]/[0.06]"
              : humanScenario
                ? "border-[#e2b46f]/45 bg-[#11120f]"
                : "border-white/10 bg-[#101313] opacity-55"
        )}
      >
        {humanScenario && (
          <div
            className={cn(
              "absolute top-5 -left-10 w-10 border-t border-dashed",
              humanReached ? "border-[#e2b46f]/80" : "border-[#e2b46f]/40"
            )}
          />
        )}
        <div
          className={cn(
            "font-code text-[7px] tracking-[0.14em]",
            humanScenario ? "text-[#d7a968]" : "text-[#666b66]"
          )}
        >
          OUTSIDE PROVIDED POLICY
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold tracking-wide text-[#e8e7e2]">
            Human approval
          </span>
          {humanApproved ? (
            <span className="border border-[#45b78a]/60 px-1.5 py-0.5 font-code text-[8px] tracking-wider text-[#45b78a]">
              APPROVED
            </span>
          ) : humanPending ? (
            <span className="ts-status-pulse border border-[#e2b46f]/60 px-1.5 py-0.5 font-code text-[8px] tracking-wider text-[#e2b46f]">
              PENDING
            </span>
          ) : (
            <code className="text-[8px] text-[#92958f]">approve · deny</code>
          )}
        </div>
        <div className="mt-1 font-code text-[7px] tracking-wider text-[#565b56]">
          HUMAN-IN-THE-LOOP
        </div>
      </div>

      <TraceArrow active={step.phase === "SPAWN"} />

      <div
        className={cn(
          "ts-mobile-chamber relative min-h-64 p-5 transition-all",
          spawned
            ? "border border-[#e8734a]/70 bg-[#e8734a]/[0.035] opacity-100"
            : "border border-white/[0.08] bg-white/[0.015] opacity-35"
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="font-code text-[9px] tracking-[0.15em] text-[#e8734a]">
            NONO MICRO SANDBOX
          </span>
          <span className="font-code text-[8px] text-[#666b66]">INVOCATION-SCOPED</span>
        </div>

        {spawned ? (
          <>
            <div className="ts-mobile-tool-core mx-auto flex h-24 max-w-48 flex-col items-center justify-center border border-[#e8734a]/70 bg-[#111414]">
              <span className="font-code text-[8px] tracking-wider text-[#666b66]">
                PROCESS MODULE
              </span>
              <div className="my-1 font-code text-xl text-[#f3f2ed]">
                <span className="text-[#e8734a]">&gt;_</span> gh
              </div>
              <code className="text-[9px] text-[#777c77]">PID 48291 · {procLabel}</code>
            </div>

            {capabilityReached && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  ["FILESYSTEM", "WORKSPACE · READ"],
                  ["WRITES", "DENIED"],
                  ["STDIO", "1 MB · BOUNDED"],
                  ["NETWORK", "PROXY ONLY"],
                ].map(([label, value]) => (
                  <div key={label} className="border border-white/[0.08] bg-black/20 p-2">
                    <div className="font-code text-[7px] tracking-wider text-[#555a55]">
                      {label}
                    </div>
                    <code
                      className={cn(
                        "mt-1 block text-[8px]",
                        value === "DENIED" ? "text-[#ef6a6a]" : "text-[#d1d1cb]"
                      )}
                    >
                      {value}
                    </code>
                  </div>
                ))}
              </div>
            )}

            {credentialReached && (
              <div className="mt-3 border border-[#e8734a]/50 bg-[#e8734a]/[0.07] px-3 py-2 text-center">
                <code className="text-[9px] text-[#eaa080]">{PHANTOM_TOKEN}</code>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-40 items-center justify-center text-center font-code text-[9px] text-[#555a55]">
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
            ? "border-[#ef6a6a]/50 bg-[#ef6a6a]/[0.04]"
            : step.phase === "EXECUTE"
              ? "border-[#e8734a]/50 bg-[#e8734a]/[0.035]"
              : "border-white/[0.08] bg-white/[0.015]"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-code text-[9px] tracking-[0.15em] text-[#d4d4ce]">
              L7 PROXY
            </div>
            <div className="mt-1 font-code text-[8px] text-[#666b66]">
              INSPECT
            </div>
          </div>
          {proxyBadge && <Verdict value={proxyBadge.verdict} />}
        </div>
        {proxyBadge && (
          <code className="mt-3 block break-all text-[9px] text-[#a7aaa4]">
            {proxyBadge.rule.replace(" → ALLOW", "").replace(" → DENY", "")}
          </code>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span className="font-code text-[7px] text-[#666b66]">IN</span>
          <div className="h-px flex-1 bg-[#e8734a]/60" />
          <div className="flex size-8 items-center justify-center rounded-full border border-white/15 font-code text-[10px] text-[#e8734a]">
            ⇄
          </div>
          <div className="h-px flex-1 bg-white/10" />
          <span className="font-code text-[7px] text-[#666b66]">OUT</span>
          <svg
            viewBox="0 0 48 48"
            className={cn(
              "size-12",
              proxyBadge?.verdict === "DENY" && "opacity-35"
            )}
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,.18)" />
            <ellipse cx="24" cy="24" rx="9" ry="21" fill="none" stroke="rgba(255,255,255,.14)" />
            <path
              d="M4 17 Q24 24 44 17 M4 31 Q24 24 44 31 M3 24 H45"
              fill="none"
              stroke="rgba(255,255,255,.14)"
            />
            <path
              d="M16 10 L22 8 L27 12 L33 11 L37 16 L33 21 L25 21 L21 26 L15 22 L12 16 Z"
              fill={proxyBadge?.verdict === "ALLOW" ? "#e8734a" : "rgba(255,255,255,.15)"}
              opacity=".7"
            />
            <circle
              cx="36"
              cy="14"
              r="2.5"
              fill={proxyBadge?.verdict === "ALLOW" ? "#e8734a" : "#666b66"}
            />
          </svg>
        </div>
        <div
            className={cn(
              "mt-2 text-right font-code text-[7px] tracking-wider",
              proxyBadge?.verdict === "DENY"
                ? "text-[#444844]"
                : "text-[#777c77]"
            )}
          >
            INTERNET · API.GITHUB.COM
        </div>
      </div>

      <TraceArrow active={step.phase === "AUDIT"} />

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-code text-[9px] font-medium tracking-[0.15em] text-[#d0d1cb]">
              TAMPER-EVIDENT AUDIT
            </div>
            <code className="mt-2 block text-[10px] font-medium text-[#c3c5bf]">
              resolve → argv → spawn → l7 → seal
            </code>
          </div>
          <div className={cn("text-right", !sealed && "opacity-35")}>
            <div className="font-code text-[8px] text-[#e8734a]">MERKLE ROOT</div>
            <code className="mt-1 block text-[9px] text-[#929690]">9a3b7c1d…6082</code>
          </div>
        </div>
      </div>
    </div>
  );
}
