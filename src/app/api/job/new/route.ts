import { NextResponse, NextRequest } from "next/server";
import Job, { IJob } from "@/models/JobSchema";
import dbConnect from "@/lib/mongoose";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const influencer_id = session.user.id;

    const jobs = await Job.find({
      status: "open",
      hiredInfluencers: { $nin: [influencer_id] },
      proposalsSubmitted: {
        $not: { $elemMatch: { influencer: influencer_id } },
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { data: jobs, message: "Jobs fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs", error: error },
      { status: 500 }
    );
  }
}
