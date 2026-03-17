import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // 1. If NOT logged in: Only protect private dashboards
  if (!sessionCookie) {
    if (pathname.startsWith("/influencer") || pathname.startsWith("/business")) {
      // Use the folder name you actually HAVE (e.g., /auth)
      return NextResponse.redirect(new URL("/app/auth", request.url));
    }
    return NextResponse.next();
  }

  // 2. If LOGGED in: 
  // ONLY redirect them if they try to go back to the login page (/auth)
  // This allows them to stay on the Home Page "/" without being kicked off
  if (sessionCookie && pathname === "/auth") {
    return NextResponse.redirect(new URL("/influencer", request.url)); 
  }

  return NextResponse.next();
}

export const config = {
  // Make sure /auth is here, not /login
  matcher: ["/", "/auth", "/influencer/:path*", "/business/:path*"],
};