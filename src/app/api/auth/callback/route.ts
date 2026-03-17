import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    // Redirect to login if no valid session
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const role = session.user.role; // "influencer" or "business"
console.log("User role:", role);

  let redirectPath = "/";
  switch (role) {
    case "business":
      redirectPath = "/business";
      break;
    case "admin":
      redirectPath = "/admin";
      break;
    default:
      redirectPath = "/influencer";
      break;
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
