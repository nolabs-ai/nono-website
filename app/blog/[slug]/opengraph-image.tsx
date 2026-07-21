import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function OpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const logoSvg = readFileSync(
    join(process.cwd(), "public/nono-square.svg"),
    "utf-8",
  );
  const logoBase64 = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(circle at top left, rgba(20,184,166,0.14) 0%, rgba(10,15,29,0.96) 38%, #05070d 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 32,
            border: "1px solid rgba(148, 163, 184, 0.12)",
            borderRadius: 24,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 52,
            left: 56,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <img src={logoBase64} alt="" width={92} height={92} />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 30,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "#cbd5e1",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "#14b8a6",
                  boxShadow: "0 0 30px rgba(20,184,166,0.45)",
                }}
              />
              nono
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#64748b",
                letterSpacing: "0.02em",
              }}
            >
              Kernel-enforced isolation for AI agents
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 64,
            right: 56,
            display: "flex",
            padding: "6px 14px",
            borderRadius: 999,
            border: "1px solid rgba(20,184,166,0.25)",
            fontSize: 18,
            color: "#99f6e4",
          }}
        >
          Blog
        </div>

        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            top: 190,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 62,
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              maxWidth: 980,
            }}
          >
            {post.title}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 28,
              lineHeight: 1.34,
              color: "#cbd5e1",
              maxWidth: 860,
            }}
          >
            {post.description}
          </div>

          <div
            style={{
              display: "flex",
              width: 88,
              height: 3,
              backgroundColor: "#14b8a6",
              marginTop: 28,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 56,
            bottom: 56,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 18,
            color: "#64748b",
            letterSpacing: "0.02em",
          }}
        >
          <div style={{ display: "flex" }}>{post.author}</div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>{formatDate(post.date)}</div>
          {post.tags.length > 0 ? <div style={{ display: "flex" }}>·</div> : null}
          {post.tags.length > 0 ? (
            <div style={{ display: "flex", color: "#94a3b8" }}>{post.tags[0]}</div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
