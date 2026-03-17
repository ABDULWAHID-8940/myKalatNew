import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin-overview";

// export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const overview = await getAdminOverview();
    return NextResponse.json({ data: overview }, { status: 200 });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { error: "Failed to load admin overview" },
      { status: 500 },
    );
  }
}
