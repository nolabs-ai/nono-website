import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { supportedAgents } from "@/data/agents";
import { REGISTRY_URL } from "@/lib/site";

/**
 * Renders a logo as a theme-aware monochrome silhouette via CSS masking (same
 * technique as CompanyLogos): muted in both themes, brightening to foreground
 * on hover.
 */
function AgentLogo({ logo, name }: { logo: string; name: string }) {
  return (
    <span
      role="img"
      aria-label={name}
      className="block h-7 w-full bg-muted/70 transition-colors duration-200 group-hover:bg-foreground"
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

        <div className="grid grid-cols-2 gap-px border border-border bg-border shadow-[0_24px_70px_rgba(0,0,0,0.12)] sm:grid-cols-3 md:grid-cols-5">
          {supportedAgents.map((agent) => {
            const inner = (
              <>
                <AgentLogo logo={agent.logo} name={agent.name} />
                <span className="text-center font-mono text-[11px] uppercase leading-tight tracking-wider text-muted transition-colors group-hover:text-foreground">
                  {agent.name}
                </span>
              </>
            );
            const base =
              "relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-background px-4 py-8 before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left before:scale-x-0 before:bg-accent before:transition-transform group-hover:before:scale-x-100";

            return agent.href ? (
              <a
                key={agent.name}
                href={agent.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`${agent.name} on the registry`}
                className={`group ${base} transition-colors hover:bg-background-secondary`}
              >
                {inner}
              </a>
            ) : (
              <div key={agent.name} className={`group ${base}`}>
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
