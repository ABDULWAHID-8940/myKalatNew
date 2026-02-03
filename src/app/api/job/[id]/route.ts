import { NextResponse, NextRequest } from "next/server";
import Job from "@/models/JobSchema";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  await dbConnect();

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || session.user.role !== "influencer") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id } = await params;

    const influencerId = session.user.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid Job ID" }, { status: 400 });
    }

    // Update the job by adding the influencer to the hiredInfluencers array
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $addToSet: { hiredInfluencers: influencerId } },
      { new: true },
    );

    // If the job is not found, return a 404 status
    if (!updatedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error) {
    console.error("Error updating hired influencers:", error);
    return NextResponse.json(
      { message: "Failed to update hired influencers", error },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect(); // Ensure the database is connected

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }
    if (session.user.role !== "business") {
      return NextResponse.json(
        { message: "Only businesses can delete jobs" },
        { status: 403 },
      );
    }

    const { id } = await params; // Extract the job ID from the dynamic route parameter

    // Validate the job ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid Job ID" }, { status: 400 });
    }

    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    if (String(existingJob.postedBy) !== session.user.id) {
      return NextResponse.json(
        { message: "You are not allowed to delete this job" },
        { status: 403 },
      );
    }

    // Attempt to delete the job from the database
    const deletedJob = await Job.findByIdAndDelete(id);

    // If the job is not found, return a 404 status
    if (!deletedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: {
          message: "Job deleted successfully",
          job: deletedJob,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      {
        message: "Failed to delete job",
        error,
      },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  await dbConnect();
  try {
    const url = new URL(request.url);
    const excludeCompleted = url.searchParams.get("excludeCompleted");
    const { id } = await params; // Get the ID from route params

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const query: {
      postedBy: mongoose.Types.ObjectId;
      status?: { $ne: string };
    } = {
      postedBy: new mongoose.Types.ObjectId(id),
    };

    if (excludeCompleted === "true") {
      query.status = { $ne: "completed" };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs", error },
      { status: 500 },
    );
  }
}
