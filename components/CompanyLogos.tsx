import { companies } from "@/data/companies";

/**
 * Centred, wrapping row of company logos. Each logo is rendered as a
 * theme-aware monochrome silhouette via CSS masking (the same technique as
 * AgentLogo in SupportedAgents), so source assets keep their brand colours and
 * every logo reads as the same grey in both light and dark mode. Linked logos
 * brighten from muted to foreground on hover.
 */
function CompanyLogo({
  logo,
  name,
  className,
}: {
  logo: string;
  name: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={`block h-14 w-32 bg-muted/70 transition-colors duration-200 group-hover:bg-foreground ${className ?? ""}`}
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

export default function CompanyLogos() {
  if (companies.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 list-none">
      {companies.map((company) => {
        const logo = (
          <CompanyLogo
            logo={company.logo}
            name={company.name}
            className={company.className}
          />
        );

        return (
          <li key={company.name}>
            {company.href ? (
              <a
                href={company.href}
                target="_blank"
                rel="noopener noreferrer"
                title={company.name}
                className="group block"
              >
                {logo}
              </a>
            ) : (
              logo
            )}
          </li>
        );
      })}
    </ul>
  );
}
