import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  // const sessionCookie = request.cookies.get("better-auth.session_token");

  const pathname = request.nextUrl.pathname;
  console.log({ pathname, sessionCookie });

  // If no cookie → redirect away from protected routes
  // if (!sessionCookie) {
  //   if (
  //     pathname.startsWith("/influencer") ||
  //     pathname.startsWith("/business")
  //   ) {
  //     return NextResponse.redirect(new URL("/auth", request.url));
  //   }
  //   return NextResponse.next();
  // }

  // // If authenticated → prevent access to /auth or /
  // if (sessionCookie && (pathname === "/" || pathname.startsWith("/auth"))) {
  //   return NextResponse.redirect(new URL("/influencer", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth", "/influencer/:path*", "/business/:path*"],
};
