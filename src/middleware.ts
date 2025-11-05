import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookieName: "session_token",
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  });

  const pathname = request.nextUrl.pathname;

  // If no session cookie exists, redirect to signup for any protected route
  if (!sessionCookie) {
    if (
      pathname.startsWith("/influencer") ||
      pathname.startsWith("/business")
    ) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    // Allow public routes like "/" or "/signup"
    return NextResponse.next();
  }

  // Get the full session to access the user’s role
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
      },
    }
  );
  const userRole = session?.user?.role; // e.g., "influencer" or "business"

  // If no role is found (edge case), treat as unauthenticated
  if (!userRole) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Protect /influencer routes
  if (pathname.startsWith("/influencer")) {
    if (userRole !== "influencer") {
      // Redirect business users to their area, or to main if no specific redirect
      return NextResponse.redirect(new URL("/business", request.url));
    }
  }

  // Protect /business routes
  if (pathname.startsWith("/business")) {
    if (userRole !== "business") {
      // Redirect influencers to their area
      return NextResponse.redirect(new URL("/influencer", request.url));
    }
  }

  // Redirect logged-in users away from public pages like "/" or "/signup"
  if (pathname === "/" || pathname === "/auth") {
    const redirectPath =
      userRole === "influencer" ? "/influencer" : "/business";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Allow access to the requested page if all checks pass
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth", "/influencer", "/business"],
};
