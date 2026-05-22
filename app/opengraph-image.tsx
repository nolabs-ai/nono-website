import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
          alignItems: "stretch",
          padding: "56px",
          background:
            "radial-gradient(circle at top left, rgba(20,184,166,0.14) 0%, rgba(10,15,29,0.96) 38%, #05070d 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "34%",
            minWidth: "320px",
            paddingRight: "36px",
          }}
        >
          <img src={logoBase64} alt="" width="240" height="240" />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingLeft: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#cbd5e1",
              marginBottom: "26px",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "999px",
                background: "#14b8a6",
                boxShadow: "0 0 30px rgba(20,184,166,0.45)",
              }}
            />
            nono
          </div>

          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.05em",
              marginBottom: "20px",
            }}
          >
            Secure, capability-based runtime for AI agents.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "#cbd5e1",
              marginBottom: "30px",
            }}
          >
            Kernel-enforced isolation, network filtering, immutable auditing, and
            atomic rollbacks for AI agents.
          </div>

          <div
            style={{
              width: "88px",
              height: "3px",
              backgroundColor: "#14b8a6",
              marginBottom: "24px",
            }}
          />

          <div
            style={{
              fontSize: 18,
              color: "#64748b",
              letterSpacing: "0.02em",
            }}
          >
            nono.sh
          </div>
        </div>
      </div>
    ),
    size,
  );
}
