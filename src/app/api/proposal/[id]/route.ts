import { NextResponse, NextRequest } from "next/server";
import Proposal from "@/models/ProposalSchema"; // Import the Proposal model
import Job from "@/models/JobSchema";
import dbConnect from "@/lib/mongoose"; // Utility to connect to MongoDB
import { z } from "zod"; // For input validation
import mongoose from "mongoose"; // For ObjectId validation
import { auth } from "@/lib/auth";

// Define validation schema for PATCH request
const UpdateProposalSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]), // Allowed statuses
});

// PATCH: Update a proposal (e.g., status or message)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  await dbConnect(); // Ensure the database is connected

  try {
    const { id: proposalId } = await params; // Access URL params

    // Validate proposalId
    if (!proposalId || !mongoose.Types.ObjectId.isValid(proposalId)) {
      return NextResponse.json(
        { message: "Invalid Proposal ID" },
        { status: 400 },
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = UpdateProposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.errors },
        { status: 400 },
      );
    }

    const { status } = validation.data;

    // Update the proposal
    const updatedProposal = await Proposal.findByIdAndUpdate(
      proposalId,
      { ...(status && { status }) }, // Update only provided fields
      { new: true }, // Return the updated document
    )
      .populate({
        path: "jobId",
        select: "title description price location socialMedia status",
        model: Job,
      })
      .lean();

    if (!updatedProposal) {
      return NextResponse.json(
        { message: "Proposal not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: updatedProposal }, { status: 200 }); // Return the updated proposal
  } catch (error) {
    console.error("Error updating proposal:", error); // Log the error for debugging
    return NextResponse.json(
      { message: "Failed to update proposal", error },
      { status: 500 },
    );
  }
}

// DELETE: Delete a proposal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect(); // Ensure the database is connected

  try {
    const { id: proposalId } = await params; // Access URL params

    // Validate proposalId
    if (!proposalId || !mongoose.Types.ObjectId.isValid(proposalId)) {
      return NextResponse.json(
        { message: "Invalid Proposal ID" },
        { status: 400 },
      );
    }

    // Delete the proposal
    const deletedProposal = await Proposal.findByIdAndDelete(proposalId);

    if (!deletedProposal) {
      return NextResponse.json(
        { message: "Proposal not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: deletedProposal }, { status: 200 });
  } catch (error) {
    console.error("Error deleting proposal:", error); // Log the error for debugging
    return NextResponse.json(
      { message: "Failed to delete proposal", error },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();

  try {
    const body = await request.json();
    const { id: jobId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: "authenticated failed" },
        { status: 401 },
      );
    }

    const influencerId = session.user.id;
    const message = body.message || "";

    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(influencerId)
    ) {
      return NextResponse.json(
        { message: "invalid Id Try again" },
        { status: 400 },
      );
    }

    // Verify job exists first
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const influencerObjectId = new mongoose.Types.ObjectId(influencerId);

    // Check if this influencer already submitted a proposal for the job
    const alreadySubmitted = await Job.exists({
      _id: jobId,
      "proposalsSubmitted.influencer": influencerObjectId,
    });
    if (alreadySubmitted) {
      return NextResponse.json(
        { message: "Proposal already submitted" },
        { status: 409 },
      );
    }

    // Create proposal
    const newProposal = new Proposal({
      jobId,
      influencerId,
      message,
    });

    const savedProposal = await newProposal.save();

    // Update job - make sure field name matches your schema exactly
    await Job.findByIdAndUpdate(
      jobId,
      {
        $push: {
          proposalsSubmitted: {
            proposal: savedProposal._id,
            influencer: influencerObjectId,
          },
        },
      },
      { new: true },
    );

    return NextResponse.json({ data: savedProposal }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create proposal" },
      { status: 500 },
    );
  }
}
