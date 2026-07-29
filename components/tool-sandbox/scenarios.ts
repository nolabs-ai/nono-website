export type RailPhase =
  | "REQUEST"
  | "RESOLVE"
  | "AUTHORIZE"
  | "SPAWN"
  | "EXECUTE"
  | "AUDIT"
  | "DESTROY";

export const RAIL_PHASES: RailPhase[] = [
  "REQUEST",
  "RESOLVE",
  "AUTHORIZE",
  "SPAWN",
  "EXECUTE",
  "AUDIT",
  "DESTROY",
];

export type StageId =
  | "agent"
  | "resolver"
  | "argv"
  | "capability"
  | "credential"
  | "human"
  | "proxy"
  | "sandbox"
  | "github"
  | "audit"
  | "merkle";

export type PathId =
  | "agent-supervisor"
  | "spawn"
  | "phantom-cred"
  | "escalate"
  | "approval-return"
  | "egress"
  | "proxy-github"
  | "audit-drop-argv"
  | "audit-drop-proxy"
  | "audit-drop-sandbox"
  | "audit-lane";

export type SandboxVis = "none" | "materializing" | "active" | "collapsing" | "gone";

export interface Pulse {
  path: PathId;
  reverse?: boolean;
  delayMs?: number;
  durMs?: number;
}

export interface Badge {
  stage: "argv" | "proxy";
  verdict: "ALLOW" | "DENY";
  rule: string;
}

export interface Step {
  id: string;
  phase: RailPhase;
  duration: number;
  active: StageId[];
  pulses?: Pulse[];
  badge?: Badge;
  sandbox: SandboxVis;
  caption: string;
  detail?: string;
}

export type ScenarioId = "allowed" | "human-approved" | "argv-denied" | "l7-denied";

export interface Scenario {
  id: ScenarioId;
  label: string;
  command: string;
  agent: {
    user: string;
    response: string;
    tool: string;
    toolMeta: string;
    result: string;
    resultMeta: string;
  };
  staticStep: number;
  skippedPhases: RailPhase[];
  outcomeText: string;
  steps: Step[];
}

export const PHANTOM_TOKEN = "GH_TOKEN=nono_cd07…";

export const SCENARIOS: Scenario[] = [
  {
    id: "allowed",
    label: "Allowed read",
    command: "gh issue view 1052 --repo nolabs-ai/nono",
    agent: {
      user: "What changed in issue #1052?",
      response: "Let me check the issue.",
      tool: "GitHub · View issue",
      toolMeta: "nolabs-ai/nono · #1052",
      result: "Issue #1052 · Brokered tool isolation",
      resultMeta: "Open · 14 comments",
    },
    staticStep: 9,
    skippedPhases: [],
    outcomeText:
      "Allowed: gh issue view ran inside a fresh invocation-scoped micro sandbox with a phantom GH_TOKEN. The proxy allowed POST /graphql and injected the real credential at the boundary; the audit record was sealed with a SHA-256 Merkle root and the sandbox was destroyed.",
    steps: [
      {
        id: "request",
        phase: "REQUEST",
        duration: 1200,
        active: ["agent"],
        pulses: [{ path: "agent-supervisor" }],
        sandbox: "none",
        caption: "a coding agent invokes gh",
        detail: "caller: coding agent · tool: gh",
      },
      {
        id: "resolve",
        phase: "RESOLVE",
        duration: 1000,
        active: ["resolver"],
        sandbox: "none",
        caption: "nono resolves and verifies the gh executable",
        detail: "exec: gh → verified",
      },
      {
        id: "authorize",
        phase: "AUTHORIZE",
        duration: 1300,
        active: ["argv"],
        badge: { stage: "argv", verdict: "ALLOW", rule: "issue view → ALLOW" },
        sandbox: "none",
        caption: "argv policy evaluates the caller and arguments",
        detail: "argv prefix: issue view → ALLOW",
      },
      {
        id: "spawn",
        phase: "SPAWN",
        duration: 1200,
        active: ["capability", "sandbox"],
        pulses: [{ path: "spawn" }],
        sandbox: "materializing",
        caption: "a fresh micro sandbox materializes around gh",
        detail: "scope: this invocation only",
      },
      {
        id: "capabilities",
        phase: "SPAWN",
        duration: 1500,
        active: ["sandbox"],
        sandbox: "active",
        caption: "the sandbox receives only its selected capabilities",
        detail: "workspace: read-only · net: via nono proxy",
      },
      {
        id: "credential",
        phase: "SPAWN",
        duration: 1400,
        active: ["credential", "sandbox"],
        pulses: [{ path: "phantom-cred" }],
        sandbox: "active",
        caption: "a phantom token is injected — the real token never enters the child",
        detail: PHANTOM_TOKEN,
      },
      {
        id: "egress",
        phase: "EXECUTE",
        duration: 1500,
        active: ["sandbox", "proxy"],
        pulses: [{ path: "egress" }],
        badge: { stage: "proxy", verdict: "ALLOW", rule: "POST /graphql → ALLOW" },
        sandbox: "active",
        caption: "the proxy validates the phantom token and evaluates L7 policy",
        detail: "POST /graphql → ALLOW",
      },
      {
        id: "github",
        phase: "EXECUTE",
        duration: 1100,
        active: ["proxy", "github"],
        pulses: [{ path: "proxy-github" }],
        sandbox: "active",
        caption: "real credential injected at the boundary, forwarded over TLS",
        detail: "→ api.github.com",
      },
      {
        id: "output",
        phase: "EXECUTE",
        duration: 1200,
        active: ["sandbox", "agent"],
        pulses: [
          { path: "proxy-github", reverse: true, durMs: 420 },
          { path: "spawn", reverse: true, durMs: 320, delayMs: 430 },
          { path: "agent-supervisor", reverse: true, durMs: 320, delayMs: 770 },
        ],
        sandbox: "active",
        caption: "bounded stdout returns to the coding agent via the supervisor",
      },
      {
        id: "seal",
        phase: "AUDIT",
        duration: 1400,
        active: ["audit", "merkle"],
        pulses: [
          { path: "audit-drop-argv", durMs: 500 },
          { path: "audit-drop-proxy", durMs: 500 },
          { path: "audit-drop-sandbox", durMs: 500 },
          { path: "audit-lane", durMs: 700, delayMs: 500 },
        ],
        sandbox: "active",
        caption: "security-relevant events sealed into the hash-chained audit record",
        detail: "SHA-256 Merkle root",
      },
      {
        id: "destroy",
        phase: "DESTROY",
        duration: 1100,
        active: [],
        sandbox: "collapsing",
        caption: "invocation exits — the micro sandbox is destroyed",
      },
      {
        id: "hold",
        phase: "DESTROY",
        duration: 3000,
        active: [],
        sandbox: "gone",
        caption: "one invocation, one sandbox — nothing persists",
      },
    ],
  },
  {
    id: "human-approved",
    label: "Human approval",
    command: "gh pr merge 847 --repo nolabs-ai/nono --squash",
    agent: {
      user: "Merge PR #847 when checks pass.",
      response: "Checks are green — merging PR #847.",
      tool: "GitHub · Merge pull request",
      toolMeta: "nolabs-ai/nono · #847",
      result: "PR #847 merged into main",
      resultMeta: "squash · approved by human",
    },
    staticStep: 8,
    skippedPhases: [],
    outcomeText:
      "Human approved: gh pr merge matched no argv rule, so nono routed the exact invocation to a human for review. On approval it ran inside a fresh micro sandbox, the proxy allowed PUT to the merge endpoint, and the approval was sealed into the audit record.",
    steps: [
      {
        id: "request",
        phase: "REQUEST",
        duration: 1200,
        active: ["agent"],
        pulses: [{ path: "agent-supervisor" }],
        sandbox: "none",
        caption: "a coding agent invokes gh",
        detail: "caller: coding agent · tool: gh",
      },
      {
        id: "resolve",
        phase: "RESOLVE",
        duration: 1000,
        active: ["resolver"],
        sandbox: "none",
        caption: "nono resolves and verifies the gh executable",
        detail: "exec: gh → verified",
      },
      {
        id: "escalate",
        phase: "AUTHORIZE",
        duration: 1500,
        active: ["argv", "human"],
        pulses: [{ path: "escalate" }],
        sandbox: "none",
        caption: "no argv rule matches — the exact invocation is routed to a human",
        detail: "argv prefix: pr merge → escalate",
      },
      {
        id: "pending",
        phase: "AUTHORIZE",
        duration: 1700,
        active: ["human"],
        sandbox: "none",
        caption: "a human reviews the exact command before anything runs",
        detail: "approval: pending",
      },
      {
        id: "approved",
        phase: "AUTHORIZE",
        duration: 1200,
        active: ["human"],
        pulses: [{ path: "approval-return" }],
        sandbox: "none",
        caption: "approved — execution proceeds under scoped policy",
        detail: "decision: approve",
      },
      {
        id: "spawn",
        phase: "SPAWN",
        duration: 1200,
        active: ["capability", "sandbox"],
        pulses: [{ path: "spawn" }],
        sandbox: "materializing",
        caption: "a fresh micro sandbox materializes around gh",
        detail: "scope: this invocation only",
      },
      {
        id: "capabilities",
        phase: "SPAWN",
        duration: 1200,
        active: ["sandbox"],
        sandbox: "active",
        caption: "the sandbox receives only its selected capabilities",
        detail: "workspace: read-only · net: via nono proxy",
      },
      {
        id: "credential",
        phase: "SPAWN",
        duration: 1200,
        active: ["credential", "sandbox"],
        pulses: [{ path: "phantom-cred" }],
        sandbox: "active",
        caption: "a phantom token is injected — the real token never enters the child",
        detail: PHANTOM_TOKEN,
      },
      {
        id: "egress",
        phase: "EXECUTE",
        duration: 1400,
        active: ["sandbox", "proxy"],
        pulses: [{ path: "egress" }],
        badge: { stage: "proxy", verdict: "ALLOW", rule: "PUT /…/merge → ALLOW" },
        sandbox: "active",
        caption: "the proxy validates the phantom token and evaluates L7 policy",
        detail: "PUT /repos/nolabs-ai/nono/pulls/847/merge → ALLOW",
      },
      {
        id: "github",
        phase: "EXECUTE",
        duration: 1100,
        active: ["proxy", "github"],
        pulses: [{ path: "proxy-github" }],
        sandbox: "active",
        caption: "real credential injected at the boundary, forwarded over TLS",
        detail: "→ api.github.com",
      },
      {
        id: "output",
        phase: "EXECUTE",
        duration: 1200,
        active: ["sandbox", "agent"],
        pulses: [
          { path: "proxy-github", reverse: true, durMs: 420 },
          { path: "spawn", reverse: true, durMs: 320, delayMs: 430 },
          { path: "agent-supervisor", reverse: true, durMs: 320, delayMs: 770 },
        ],
        sandbox: "active",
        caption: "bounded stdout returns to the coding agent via the supervisor",
      },
      {
        id: "seal",
        phase: "AUDIT",
        duration: 1400,
        active: ["audit", "merkle"],
        pulses: [
          { path: "audit-drop-argv", durMs: 500 },
          { path: "audit-drop-proxy", durMs: 500 },
          { path: "audit-drop-sandbox", durMs: 500 },
          { path: "audit-lane", durMs: 700, delayMs: 500 },
        ],
        sandbox: "active",
        caption: "the human decision is sealed into the hash-chained audit record",
        detail: "SHA-256 Merkle root",
      },
      {
        id: "destroy",
        phase: "DESTROY",
        duration: 1100,
        active: [],
        sandbox: "collapsing",
        caption: "invocation exits — the micro sandbox is destroyed",
      },
      {
        id: "hold",
        phase: "DESTROY",
        duration: 3000,
        active: [],
        sandbox: "gone",
        caption: "approved by a human, executed in isolation — nothing persists",
      },
    ],
  },
  {
    id: "argv-denied",
    label: "Argv denied",
    command: 'gh issue comment 1052 --body "shipping this"',
    agent: {
      user: "Comment “shipping this” on issue #1052.",
      response: "I’ll add the comment.",
      tool: "GitHub · Comment on issue",
      toolMeta: "nolabs-ai/nono · #1052",
      result: "Tool denied · argv policy",
      resultMeta: "issue comment is not permitted",
    },
    staticStep: 3,
    skippedPhases: ["SPAWN", "EXECUTE", "DESTROY"],
    outcomeText:
      "Denied at argv authorization: the issue comment prefix was refused before any sandbox, child process, or outbound request existed. The denial was recorded in the hash-chained audit record.",
    steps: [
      {
        id: "request",
        phase: "REQUEST",
        duration: 1200,
        active: ["agent"],
        pulses: [{ path: "agent-supervisor" }],
        sandbox: "none",
        caption: "a coding agent invokes gh",
        detail: "caller: coding agent · tool: gh",
      },
      {
        id: "resolve",
        phase: "RESOLVE",
        duration: 1000,
        active: ["resolver"],
        sandbox: "none",
        caption: "nono resolves and verifies the gh executable",
        detail: "exec: gh → verified",
      },
      {
        id: "deny",
        phase: "AUTHORIZE",
        duration: 1800,
        active: ["argv"],
        badge: { stage: "argv", verdict: "DENY", rule: "issue comment → DENY" },
        sandbox: "none",
        caption: "denied at argv authorization — no sandbox, no child process, no request",
        detail: "argv prefix: issue comment → DENY",
      },
      {
        id: "audit",
        phase: "AUDIT",
        duration: 1500,
        active: ["audit", "merkle"],
        pulses: [
          { path: "audit-drop-argv", durMs: 500 },
          { path: "audit-lane", durMs: 700, delayMs: 500 },
        ],
        sandbox: "none",
        caption: "the denial is recorded in the hash-chained audit record",
        detail: "SHA-256 Merkle root",
      },
      {
        id: "hold",
        phase: "AUDIT",
        duration: 3000,
        active: [],
        sandbox: "none",
        caption: "nothing was spawned; nothing left the supervisor",
      },
    ],
  },
  {
    id: "l7-denied",
    label: "L7 denied",
    command: "gh api --method POST /repos/nolabs-ai/nono/issues/1052/comments",
    agent: {
      user: "Post a comment through the GitHub API.",
      response: "I’ll call the GitHub API.",
      tool: "GitHub · API request",
      toolMeta: "POST · issue #1052 comments",
      result: "Tool denied · L7 policy",
      resultMeta: "POST comments endpoint is not permitted",
    },
    staticStep: 5,
    skippedPhases: [],
    outcomeText:
      "Denied at the proxy: gh api passed the broad argv rule, but the POST to the repository comments endpoint was refused by L7 method/path policy. Nothing crossed to GitHub; the denial was sealed into the audit record and the sandbox was destroyed.",
    steps: [
      {
        id: "request",
        phase: "REQUEST",
        duration: 1200,
        active: ["agent"],
        pulses: [{ path: "agent-supervisor" }],
        sandbox: "none",
        caption: "a coding agent invokes gh",
        detail: "caller: coding agent · tool: gh",
      },
      {
        id: "resolve",
        phase: "RESOLVE",
        duration: 1000,
        active: ["resolver"],
        sandbox: "none",
        caption: "nono resolves and verifies the gh executable",
        detail: "exec: gh → verified",
      },
      {
        id: "authorize",
        phase: "AUTHORIZE",
        duration: 1400,
        active: ["argv"],
        badge: { stage: "argv", verdict: "ALLOW", rule: "api → ALLOW" },
        sandbox: "none",
        caption: "the broad gh api argv rule passes — L7 policy still applies",
        detail: "argv prefix: api → ALLOW",
      },
      {
        id: "spawn",
        phase: "SPAWN",
        duration: 1200,
        active: ["capability", "sandbox"],
        pulses: [{ path: "spawn" }],
        sandbox: "materializing",
        caption: "a fresh micro sandbox materializes around gh",
        detail: "scope: this invocation only",
      },
      {
        id: "proxy-deny",
        phase: "EXECUTE",
        duration: 1900,
        active: ["sandbox", "proxy"],
        pulses: [{ path: "egress", durMs: 900 }],
        badge: {
          stage: "proxy",
          verdict: "DENY",
          rule: "POST /repos/…/comments → DENY",
        },
        sandbox: "active",
        caption: "denied at the proxy — the request never crosses to GitHub",
        detail: "POST /repos/nolabs-ai/nono/issues/1052/comments → DENY",
      },
      {
        id: "audit",
        phase: "AUDIT",
        duration: 1400,
        active: ["audit", "merkle"],
        pulses: [
          { path: "audit-drop-proxy", durMs: 500 },
          { path: "audit-lane", durMs: 700, delayMs: 500 },
        ],
        sandbox: "active",
        caption: "the denial is sealed into the audit record",
        detail: "SHA-256 Merkle root",
      },
      {
        id: "destroy",
        phase: "DESTROY",
        duration: 1100,
        active: [],
        sandbox: "collapsing",
        caption: "invocation exits — the micro sandbox is destroyed",
      },
      {
        id: "hold",
        phase: "DESTROY",
        duration: 3000,
        active: [],
        sandbox: "gone",
        caption: "the request never left localhost",
      },
    ],
  },
];
