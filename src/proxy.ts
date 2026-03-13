import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  if (!sessionCookie) {
    if (
      pathname.startsWith("/influencer") ||
      pathname.startsWith("/business")
    ) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return NextResponse.next();
  }

  if (sessionCookie && (pathname === "/" || pathname.startsWith("/auth"))) {
    return NextResponse.redirect(new URL("/api/auth/callback", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth", "/influencer/:path*", "/business/:path*"],
};
