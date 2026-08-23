import { NextResponse } from "next/server";
import { REGISTRY_URL } from "@/lib/site";

export const runtime = "nodejs";
// Cache identical queries at the edge for a minute; searches are cheap and
// repeat a lot from the same landing page.
export const revalidate = 60;

interface RegistryPackage {
  namespace: string;
  name: string;
  description?: string | null;
  latest_version?: string | null;
}

/**
 * Server-side proxy for the nono registry search API.
 *
 * The registry (registry.nono.sh) only allows CORS from its own origin, so a
 * browser fetch from nono.sh would be blocked. This route runs on the server,
 * calls the registry, and returns a trimmed result set the client can render.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (!query) {
    return NextResponse.json({ packages: [] });
  }

  try {
    const upstream = await fetch(
      `${REGISTRY_URL}/api/v1/packages?q=${encodeURIComponent(query)}`,
      { next: { revalidate: 60 } },
    );

    if (!upstream.ok) {
      return NextResponse.json(
        { packages: [], error: `registry returned ${upstream.status}` },
        { status: 502 },
      );
    }

    const data = (await upstream.json()) as { packages?: RegistryPackage[] };
    const packages = (data.packages ?? [])
      // Hide our own org's mirror packages (always-further/*); surface the
      // canonical nolabs-ai/* packages instead.
      .filter((pkg) => pkg.namespace !== "always-further")
      .slice(0, 8)
      .map((pkg) => ({
        namespace: pkg.namespace,
        name: pkg.name,
        description: pkg.description ?? null,
        latest_version: pkg.latest_version ?? null,
      }));

    return NextResponse.json({ packages });
  } catch {
    return NextResponse.json(
      { packages: [], error: "failed to reach registry" },
      { status: 502 },
    );
  }
}
