import { NextResponse, NextRequest } from "next/server";
import { User } from "@/models/UserSchema";
import dbConnect from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import mongoose from "mongoose"; // For ObjectId validation
export const dynamic = "force-dynamic";
// GET: Fetch proposals (all or filtered by jobId or influencerId)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(id);

    return NextResponse.json({ data: user }, { status: 200 }); // Return the fetched proposals
  } catch (error) {
    console.error("Error fetching proposals:", error); // Log the error for debugging
    return NextResponse.json(
      { message: "Failed to fetch proposals", error },
      { status: 500 }
    );
  }
}
