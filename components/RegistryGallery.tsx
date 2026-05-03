import { Fragment } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  Github,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { REGISTRY_URL } from "@/lib/site";

interface RegistryPack {
  id: string;
  namespace: string;
  name: string;
  description: string | null;
  kind: string;
  tags: string[] | null;
  downloads: number;
  is_org: boolean;
}

interface PublishStage {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
}

const publishStages: PublishStage[] = [
  {
    icon: Github,
    step: "01",
    title: "Your repo",
    description: "Push the pack to your own GitHub repo and tag a release.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Sign & scan",
    description: "CI signs the artifact and emits a verifiable manifest.",
  },
  {
    icon: PackageCheck,
    step: "03",
    title: "Publish",
    description: "The pack is indexed on registry.nono.sh.",
  },
  {
    icon: Download,
    step: "04",
    title: "Install anywhere",
    description: "Anyone runs nono pull yourname/pack.",
  },
];

async function fetchPacks(): Promise<RegistryPack[]> {
  try {
    const res = await fetch(`${REGISTRY_URL}/api/v1/packages/recent`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as RegistryPack[];
    return data.slice(0, 3);
  } catch {
    return [];
  }
}

function PackCard({ pack }: { pack: RegistryPack }) {
  const href = `${REGISTRY_URL}/packages/${pack.namespace}/${pack.name}`;
  const tags = (pack.tags ?? []).slice(0, 3);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col border border-border bg-background hover:bg-surface transition-colors"
    >
      <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted truncate">
          {pack.kind}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
          title="Cryptographically signed"
        >
          <BadgeCheck className="w-3 h-3" strokeWidth={2} />
          signed
        </span>
      </div>
      <div className="px-5 py-5 flex-1 flex flex-col gap-4">
        <h3 className="text-base font-mono font-semibold text-foreground truncate">
          {pack.namespace}/{pack.name}
        </h3>
        <p className="text-xs text-muted leading-relaxed flex-1 line-clamp-3">
          {pack.description ?? ""}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono uppercase tracking-wider text-muted border border-border px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Download className="w-3 h-3" strokeWidth={1.5} />
            {pack.downloads.toLocaleString()}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
            view <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
}

function StageCard({ stage }: { stage: PublishStage }) {
  const Icon = stage.icon;
  return (
    <div className="flex-1 min-w-0 border border-border bg-background p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
          {stage.step}
        </span>
        <Icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
      </div>
      <h4 className="text-sm font-mono font-semibold text-foreground">
        {stage.title}
      </h4>
      <p className="text-xs text-muted leading-relaxed">{stage.description}</p>
    </div>
  );
}

function StageConnector() {
  return (
    <div className="flex md:items-center justify-center md:px-2 py-2 md:py-0 shrink-0">
      <ArrowRight
        className="hidden md:block w-4 h-4 text-muted"
        strokeWidth={1.5}
      />
      <div className="md:hidden w-px h-6 bg-border" />
    </div>
  );
}

export default async function RegistryGallery() {
  const packs = await fetchPacks();

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-muted mb-6">
            Registry
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-mono uppercase leading-[1.05]">
            Signed packs.
            <br />
            <span className="text-muted">Verifiable installs.</span>
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-2xl mx-auto">
            A central registry for nono policies, agent hooks, skills, and any
            custom artifacts for your agents. Every pack is signed, scanned, and
            verified before it reaches your machine — software supply-chain
            security built in.
          </p>
        </div>

        {packs.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-20">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        )}

        <div className="mb-12">
          <div className="text-center mb-8">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.2em] text-muted mb-3">
              Publish
            </span>
            <h3 className="text-2xl md:text-3xl font-mono font-bold uppercase tracking-tight">
              Publish from your own repo
            </h3>
            <p className="text-xs text-muted mt-3 max-w-xl mx-auto">
              You own the source. Tag a release and the pack lands on the
              registry — signed, scanned, and ready to install.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-stretch">
            {publishStages.map((stage, i) => (
              <Fragment key={stage.step}>
                <StageCard stage={stage} />
                {i < publishStages.length - 1 && <StageConnector />}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border border-border px-6 py-5">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs font-mono uppercase tracking-wider text-muted">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              Signed
            </span>
            <span className="opacity-40">·</span>
            <span>Scanned</span>
            <span className="opacity-40">·</span>
            <span>Verified</span>
            <span className="opacity-40">·</span>
            <span>Apache-2.0</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href={`${REGISTRY_URL}/publish`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground hover:text-muted-strong transition-colors"
            >
              Publish a pack <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href={REGISTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground hover:text-muted-strong transition-colors"
            >
              Browse the registry <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
