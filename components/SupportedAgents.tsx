import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { supportedAgents } from "@/data/agents";
import { REGISTRY_URL } from "@/lib/site";

/**
 * Renders a logo as a theme-aware monochrome silhouette via CSS masking, so
 * every brand reads consistently in both light and dark mode regardless of its
 * source colours. The logo brightens from muted to foreground on hover.
 */
function AgentLogo({ logo, name }: { logo: string; name: string }) {
  return (
    <span
      role="img"
      aria-label={name}
      className="block h-7 w-full bg-muted/80 transition-colors duration-200 group-hover:bg-foreground"
      style={{
        maskImage: `url(${logo})`,
        WebkitMaskImage: `url(${logo})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}

export default function SupportedAgents() {
  return (
    <section id="agents" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          badge="Agents"
          title="Works with your agents"
          subtitle="nono sandboxes any terminal agent. Pull a signed profile from the registry and run — no wrappers, no rewrites."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-border border border-border">
          {supportedAgents.map((agent) => {
            const inner = (
              <>
                <AgentLogo logo={agent.logo} name={agent.name} />
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted text-center leading-tight group-hover:text-foreground transition-colors">
                  {agent.name}
                </span>
              </>
            );
            const base =
              "flex flex-col items-center justify-center gap-3 px-4 py-8 bg-background";

            return agent.href ? (
              <a
                key={agent.name}
                href={agent.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`${agent.name} on the registry`}
                className={`group ${base} transition-colors hover:bg-surface-hover`}
              >
                {inner}
              </a>
            ) : (
              <div key={agent.name} className={base}>
                {inner}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={REGISTRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-mono text-foreground hover:text-muted-strong transition-colors"
          >
            Find more agents or publish your own
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
