import { REGISTRY_URL } from "@/lib/site";

/**
 * Supported agents shown on the homepage logo wall.
 *
 * To add an agent:
 *   1. Drop a single-colour silhouette SVG (or PNG with transparency) into
 *      `public/agents/`. Colour is ignored — only the shape matters, since the
 *      logo is rendered as a theme-aware monochrome mask.
 *   2. Add an entry below. Order here is the order shown on the page.
 *   3. If the agent has a published registry pack, give it an `href` (use the
 *      `profile()` helper). Agents without a pack render non-clickable.
 *
 * The wall links to the registry where users can find more or publish their own.
 */
export interface SupportedAgent {
  name: string;
  /** Path under /public, e.g. "/agents/opencode.svg" */
  logo: string;
  /** Registry profile URL. Omit if the agent has no published pack yet. */
  href?: string;
}

const profile = (slug: string) =>
  `${REGISTRY_URL}/packages/always-further/${slug}`;

export const supportedAgents: SupportedAgent[] = [
  { name: "Claude Code", logo: "/agents/claude.svg", href: profile("claude") },
  { name: "OpenCode", logo: "/agents/opencode.svg", href: profile("opencode") },
  { name: "Codex", logo: "/agents/codex.svg", href: profile("codex") },
  { name: "Antigravity", logo: "/agents/antigravity.svg", href: profile("antigravity") },
  { name: "Goose", logo: "/agents/goose.svg" },
  { name: "OpenClaw", logo: "/agents/openclaw.png", href: profile("openclaw") },
  { name: "GitHub Copilot", logo: "/agents/copilot.svg", href: profile("copilot-cli") },
  { name: "Qwen Code", logo: "/agents/qwen.svg" },
  { name: "Pi", logo: "/agents/pi.svg", href: profile("pi") },
  { name: "Hermes", logo: "/agents/hermes.svg", href: profile("hermes") },
];
