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
      className="px-6 pt-20 pb-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="mb-5 inline-block text-xs font-mono uppercase tracking-[0.2em] text-muted">
            Tool Sandbox
          </span>
          <h2
            id="tool-sandbox-heading"
            className="mx-auto mb-4 max-w-3xl text-2xl font-bold leading-snug tracking-tight md:text-3xl"
          >
            One invocation. One micro sandbox.
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Every tool call gets an ephemeral boundary with only the files, network
            routes, arguments, and credentials it needs. Every decision is auditable.
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
            api.github.com. Security-relevant events are hash-chained into an audit
            record sealed with a SHA-256 Merkle root, and the sandbox is destroyed when
            the invocation exits. Three scenarios: Allowed read — gh issue view runs,
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
          className="mt-10 flex flex-wrap justify-center gap-2"
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
                  "border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer",
                  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent",
                  selected
                    ? "border-accent bg-surface text-foreground"
                    : "border-border text-muted hover:bg-surface hover:text-foreground"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("mr-1.5 text-[9px]", selected ? "text-accent" : "text-transparent")}
                >
                  ●
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <code className="inline-block max-w-full whitespace-pre-wrap break-words border border-code-border bg-code-bg px-4 py-2 text-left text-[13px] text-code-text">
            <span className="text-accent">$ </span>
            {scenario.command}
          </code>
        </div>

        <ol
          aria-hidden="true"
          className="mt-8 hidden flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:flex"
        >
          {RAIL_PHASES.map((phase, i) => {
            const status = phaseStatus(phase, scenario, step.phase, terminal);
            return (
              <li key={phase} className="flex items-center gap-x-3">
                {i > 0 && <span className="text-[10px] text-muted/50">→</span>}
                <span
                  className={cn(
                    "text-[11px] font-mono uppercase tracking-[0.15em] transition-colors",
                    status === "active" && "text-foreground",
                    status === "done" && "text-muted-strong",
                    status === "pending" && "text-muted",
                    status === "skipped" && "text-muted line-through opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "mr-1 text-[8px]",
                      status === "active" ? "text-accent" : "text-transparent"
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

        <div aria-hidden="true" className="mt-2 hidden lg:block">
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
          className="mx-auto mt-4 min-h-10 max-w-2xl text-center text-xs leading-relaxed"
        >
          <span className="text-muted">{captionText}</span>
          {detailText && (
            <>
              {" "}
              <code className="break-words text-muted-strong">{detailText}</code>
            </>
          )}
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
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
