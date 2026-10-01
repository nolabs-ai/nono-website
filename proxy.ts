import { NextResponse, type NextRequest } from "next/server";

// Sends case variants such as /OSS to the canonical /oss.
// A next.config redirect cannot do this: redirect sources match
// case-insensitively, so a /OSS -> /oss rule also matches /oss and loops.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/oss") {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/oss";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/:path([oO][sS][sS])"],
};
