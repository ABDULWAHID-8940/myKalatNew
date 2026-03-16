import { NextResponse, NextRequest } from "next/server";
import Job from "@/models/JobSchema";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { User } from "@/models/UserSchema";
export const dynamic = "force-dynamic";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  await dbConnect();

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || session.user.role !== "influencer") {
      return NextResponse.json(
        { error: "Authenticated failed" },
        { status: 401 }
      );
    }
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // Optional: ensure job exists
    const jobExists = await Job.exists({ _id: id });
    if (!jobExists) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Persist saved job on the user document; avoid duplicates
    const updateResult = await User.findByIdAndUpdate(
      session.user.id,
      [
        {
          $set: {
            savedJobs: {
              $cond: {
                if: { $in: [new mongoose.Types.ObjectId(id), "$savedJobs"] },
                then: {
                  $filter: {
                    input: "$savedJobs",
                    cond: { $ne: ["$$this", new mongoose.Types.ObjectId(id)] },
                  },
                },
                else: {
                  $concatArrays: [
                    "$savedJobs",
                    [new mongoose.Types.ObjectId(id)],
                  ],
                },
              },
            },
          },
        },
      ],
      { new: true }
    );

    return NextResponse.json(
      {
        data: { modified: updateResult.modifiedCount > 0 },
        message: "Job saved",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to save job" },
      { status: 500 }
    );
  }
}
