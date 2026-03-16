import { NextResponse, NextRequest } from "next/server";
import Proposal from "@/models/ProposalSchema";
import Job from "@/models/JobSchema";
import { User } from "@/models/UserSchema";
import dbConnect from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";
export const dynamic = "force-dynamic";
// POST: Create a new proposal
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const influencerId = session.user.id;
    const body = await request.json();
    const { jobId, message } = body;

    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(influencerId)
    ) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // Verify job exists first
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Create proposal
    const newProposal = new Proposal({
      jobId,
      influencerId,
      message,
    });

    console.log({ influencerId });

    const savedProposal = await newProposal.save();

    console.log({ influencerId });

    // Update job - make sure field name matches your schema exactly
    await Job.findByIdAndUpdate(
      jobId,
      {
        $push: {
          proposalsSubmitted: {
            proposal: savedProposal._id,
            influencer: influencerId,
          },
        },
      },
      { new: true },
    );

    return NextResponse.json({ data: savedProposal }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Failed to create proposal", error },
      { status: 500 },
    );
  }
}

// GET: Fetch proposals (all or filtered by jobId or influencerId)
export async function GET(request: NextRequest) {
  await dbConnect(); // Ensure the database is connected

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    const influencerId = url.searchParams.get("influencerId");

    // Validate ObjectIds
    if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ message: "Invalid Job ID" }, { status: 400 });
    }
    if (influencerId && !mongoose.Types.ObjectId.isValid(influencerId)) {
      return NextResponse.json(
        { message: "Invalid Influencer ID" },
        { status: 400 },
      );
    }

    // Build the query
    const query: {
      jobId?: string;
      influencerId?: string;
    } = {};
    if (jobId) query.jobId = jobId;
    if (influencerId) query.influencerId = influencerId;
    const proposals = await Proposal.find(query)
      .populate({
        path: "influencerId",
        select: "name image",
        model: User,
      })
      .lean();

    return NextResponse.json({ data: proposals }, { status: 200 }); // Return the fetched proposals
  } catch (error) {
    console.error("Error fetching proposals:", error); // Log the error for debugging
    return NextResponse.json(
      { message: "Failed to fetch proposals", error },
      { status: 500 },
    );
  }
}
