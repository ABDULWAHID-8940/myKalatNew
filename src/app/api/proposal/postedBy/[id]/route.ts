import { NextResponse, NextRequest } from "next/server";
import Job from "@/models/JobSchema"; // Import the Proposal model
import Proposal from "@/models/ProposalSchema"; // Import the Job model
import dbConnect from "@/lib/mongoose"; // Utility to connect to MongoDB
import mongoose from "mongoose"; // For ObjectId validation
export const dynamic = "force-dynamic";
// GET: Fetch proposals for jobs posted by a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id: postedById } = await params;
    console.log("PostedById:", postedById);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postedById)) {
      return NextResponse.json(
        { message: "Invalid Poster ID" },
        { status: 400 }
      );
    }

    // First find all jobs posted by this user
    const jobIds = await Job.find({ postedBy: postedById }).distinct("_id");

    // Then find proposals for those jobs
    const proposals = await Proposal.find({ jobId: { $in: jobIds } })
      .populate({
        path: "jobId",
        select: "title description price location socialMedia status postedBy",
        model: Job,
      })
      .populate({
        path: "influencerId",
        select: "name image",
        model: "User",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(proposals, { status: 200 });
  } catch (error) {
    console.error("Error fetching posted-by proposals:", error);
    return NextResponse.json(
      { message: "Failed to fetch proposals", error },
      { status: 500 }
    );
  }
}

/**
 * API Documentation:
 *
 * GET /api/proposal/postedBy/[id]
 * - Description: Fetches all proposals for jobs posted by a specific user.
 * - Route Parameter:
 *   - [id]: The ID of the user who posted the jobs (must be a valid MongoDB ObjectId).
 * - Response:
 *   - 200: Returns an array of proposals for jobs posted by the specified user.
 *   - 400: Returns an error message if the provided user ID is invalid.
 *   - 500: Returns an error message if there is a server error while fetching proposals.
 *
 * Example Request:
 * GET /api/proposal/postedBy/64f8c0e2b5d6c9a1f8e7b123
 *
 * Example Response (200):
 * [
 *   {
 *     "_id": "64f8c0e2b5d6c9a1f8e7b456",
 *     "jobId": {
 *       "_id": "64f8c0e2b5d6c9a1f8e7b789",
 *       "title": "Social Media Promoter Needed",
 *       "description": "Looking for someone to promote our product on TikTok and YouTube.",
 *       "price": 5000,
 *       "location": "Addis Ababa, Ethiopia",
 *       "socialMedia": [
 *         { "platform": "tiktok" },
 *         { "platform": "youtube" }
 *       ],
 *       "status": "open",
 *       "postedBy": "64f8c0e2b5d6c9a1f8e7b123"
 *     },
 *     "influencerId": {
 *       "_id": "67ddc27bac1483e290fd607b",
 *       "name": "John Doe",
 *       "image": "https://example.com/john-doe.jpg"
 *     },
 *     "createdAt": "2023-09-01T12:00:00.000Z",
 *     "updatedAt": "2023-09-01T12:00:00.000Z"
 *   }
 * ]
 *
 * Example Response (400):
 * {
 *   "message": "Invalid Poster ID"
 * }
 *
 * Example Response (500):
 * {
 *   "message": "Failed to fetch proposals",
 *   "error": "Error details here"
 * }
 */
