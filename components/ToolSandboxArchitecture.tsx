"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import DesktopDiagram from "@/components/tool-sandbox/DesktopDiagram";
import MobileFlow from "@/components/tool-sandbox/MobileFlow";
import {
  RAIL_PHASES,
  SCENARIOS,
  type RailPhase,
  type Scenario,
  type ScenarioId,
} from "@/components/tool-sandbox/scenarios";
import { cn } from "@/lib/utils";

const ORDER: ScenarioId[] = ["allowed", "argv-denied", "l7-denied"];

interface MachineState {
  scenarioId: ScenarioId;
  stepIndex: number;
  autoCycle: boolean;
  runId: number;
}

type Action =
  | { type: "TICK" }
  | { type: "SELECT"; id: ScenarioId }
  | { type: "RESUME" };

function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

function reducer(state: MachineState, action: Action): MachineState {
  switch (action.type) {
    case "TICK": {
      const scenario = getScenario(state.scenarioId);
      if (state.stepIndex < scenario.steps.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1 };
      }
      // End of scenario: auto mode cycles to the next one, a manually
      // selected scenario loops itself.
      if (!state.autoCycle) {
        return { ...state, stepIndex: 0, runId: state.runId + 1 };
      }
      const next = ORDER[(ORDER.indexOf(state.scenarioId) + 1) % ORDER.length];
      return { ...state, scenarioId: next, stepIndex: 0, runId: state.runId + 1 };
    }
    case "SELECT":
      return {
        scenarioId: action.id,
        stepIndex: 0,
        autoCycle: false,
        runId: state.runId + 1,
      };
    case "RESUME":
      return { ...state, runId: state.runId + 1 };
  }
}

function phaseStatus(
  phase: RailPhase,
  scenario: Scenario,
  currentPhase: RailPhase,
  terminal: boolean
): "active" | "done" | "skipped" | "pending" {
  if (phase === currentPhase) return "active";
  const idx = RAIL_PHASES.indexOf(phase);
  const cur = RAIL_PHASES.indexOf(currentPhase);
  if (scenario.skippedPhases.includes(phase) && (idx < cur || terminal)) return "skipped";
  if (idx < cur) return "done";
  return "pending";
}

export default function ToolSandboxArchitecture() {
  const [state, dispatch] = useReducer(reducer, {
    scenarioId: "allowed",
    stepIndex: 0,
    autoCycle: true,
    runId: 0,
  });
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const sectionRef = useRef<HTMLElement>(null);

  const scenario = getScenario(state.scenarioId);
  const animate = reduced === false;
  const stepIndex = animate ? state.stepIndex : scenario.staticStep;
  const step = scenario.steps[stepIndex];
  const terminal = stepIndex === scenario.steps.length - 1;
  const playing = animate && inView && pageVisible;

  // Deterministic clock: exactly one timeout alive at any moment.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => dispatch({ type: "TICK" }), step.duration);
    return () => clearTimeout(t);
  }, [playing, state.scenarioId, state.stepIndex, state.runId, step.duration]);

  // Pause when the section is out of the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) dispatch({ type: "RESUME" });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause when the document is hidden.
  useEffect(() => {
    const onVisibility = () => {
      const visible = !document.hidden;
      setPageVisible(visible);
      if (visible) dispatch({ type: "RESUME" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Reduced motion: render the static architecture, never schedule the clock.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Announce the outcome of a manually selected scenario once it completes.
  useEffect(() => {
    if (animate && !state.autoCycle && state.stepIndex === scenario.steps.length - 1) {
      setAnnouncement(scenario.outcomeText);
    }
  }, [animate, state.autoCycle, state.stepIndex, scenario]);

  const captionText = animate ? step.caption : scenario.outcomeText;
  const detailText = animate ? step.detail : undefined;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="tool-sandbox-heading"
      className="ts-stage relative isolate overflow-hidden border-y border-white/[0.08] px-6 py-20 text-[#f3f2ed] md:py-24"
    >
      <div aria-hidden="true" className="ts-stage-glow absolute inset-0 -z-10" />
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="mb-5 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#e8734a]">
            <span className="inline-block size-1.5 bg-[#e8734a]" aria-hidden="true" />
            Tool Sandbox
          </span>
          <h2
            id="tool-sandbox-heading"
            className="mx-auto mb-4 max-w-3xl text-3xl font-bold leading-tight tracking-[-0.035em] text-[#f3f2ed] md:text-5xl"
          >
            Every tool execution. Isolated and scoped.
          </h2>
          <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-[#b8bbb5]">
            Brokered Tool Execution
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#949892] md:text-base">
            Every tool call gets an ephemeral micro tool sandbox, scoped to only the
            files, network routes, arguments, and credentials it needs. Every decision
            is auditable.
          </p>
          <p className="sr-only">
            How nono&apos;s tool sandbox works: a coding agent runs a tool invocation, for
            example gh issue view. The nono supervisor resolves and verifies the
            executable, evaluates argv policy for the caller and arguments, and on
            approval creates a fresh, invocation-scoped micro sandbox around the tool
            with only its selected capabilities: read-only workspace, no filesystem
            writes, no host secrets, bounded stdout and stderr, and network access only
            through the nono proxy. The sandbox receives a phantom GH_TOKEN; the real
            credential stays with the supervisor and never enters the child. The proxy
            validates the phantom token, evaluates HTTP method and path policy, injects
            the real credential at the boundary, and forwards over TLS to
            api.github.com. If an action falls outside the provided policy, the policy
            engine can route it to a human approval decision to approve, deny, or time
            out. Security-relevant events are hash-chained into an audit record sealed
            with a SHA-256 Merkle root, and the sandbox is destroyed when the invocation
            exits. Three scenarios: Allowed read — gh issue view runs,
            POST /graphql is allowed by the proxy, and output returns to the coding agent.
            Argv denied — gh issue comment is refused at argv authorization; no sandbox
            or outbound request is ever created. L7 denied — gh api passes the broad
            argv rule, but the POST to the repository comments endpoint is denied at
            the proxy; nothing reaches GitHub.
          </p>
        </div>

        <div
          role="group"
          aria-label="Tool sandbox scenarios"
          className="mt-10 flex flex-wrap justify-center gap-1.5"
        >
          {SCENARIOS.map((s) => {
            const selected = s.id === state.scenarioId;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={selected}
                onClick={() => dispatch({ type: "SELECT", id: s.id })}
                className={cn(
                  "cursor-pointer border px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#e8734a]",
                  selected
                    ? "border-[#e8734a] bg-[#e8734a]/10 text-[#f3f2ed]"
                    : "border-white/10 bg-white/[0.025] text-[#777c77] hover:border-white/20 hover:text-[#d8d8d2]"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("mr-1.5 text-[8px]", selected ? "text-[#e8734a]" : "text-transparent")}
                >
                  ●
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        <ol
          aria-hidden="true"
          className="mt-8 hidden flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:flex"
        >
          {RAIL_PHASES.map((phase, i) => {
            const status = phaseStatus(phase, scenario, step.phase, terminal);
            return (
              <li key={phase} className="flex items-center gap-x-3">
                {i > 0 && <span className="text-[10px] text-white/15">→</span>}
                <span
                  className={cn(
                    "text-[11px] font-mono uppercase tracking-[0.15em] transition-colors",
                    status === "active" && "text-[#f3f2ed]",
                    status === "done" && "text-[#8b8f8a]",
                    status === "pending" && "text-[#4e524e]",
                    status === "skipped" && "text-[#4e524e] line-through opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "mr-1 text-[8px]",
                      status === "active" ? "text-[#e8734a]" : "text-transparent"
                    )}
                  >
                    ●
                  </span>
                  {phase}
                </span>
              </li>
            );
          })}
        </ol>

        <div
          aria-hidden="true"
          className="mt-3 hidden overflow-hidden border border-white/[0.08] bg-[#090b0b]/70 shadow-[0_30px_90px_rgba(0,0,0,0.32)] lg:block"
        >
          <DesktopDiagram
            scenario={scenario}
            stepIndex={stepIndex}
            runId={state.runId}
            animate={animate}
          />
        </div>

        <div aria-hidden="true" className="mt-8 lg:hidden">
          <MobileFlow scenario={scenario} stepIndex={stepIndex} />
        </div>

        <p
          aria-hidden="true"
          className="mx-auto mt-5 min-h-10 max-w-2xl text-center text-xs leading-relaxed"
        >
          <span className="text-[#8b8f8a]">{captionText}</span>
          {detailText && (
            <>
              {" "}
              <code className="break-words text-[#c2c3bd]">{detailText}</code>
            </>
          )}
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-[#686d68]">
          The agent never talks directly to the isolated tool. Requests, credentials,
          network traffic, stdio, and audit events cross the supervisor boundary.
        </p>

        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </div>
    </section>
  );
}
