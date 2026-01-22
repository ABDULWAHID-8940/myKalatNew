import { NextResponse } from "next/server";
import Contract from "@/models/ContractSchema";
import dbConnect from "@/lib/mongoose";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();

    const { status, role } = body; // Expecting role: "influencer" | "owner"

    if (
      ![
        "active",
        "terminated",
        "influencerConfirmed",
        "ownerConfirmed",
      ].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 },
      );
    }

    const contract = await Contract.findById(id);
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    // Handle activation (only influencer allowed)
    if (status === "active") {
      if (role !== "influencer") {
        return NextResponse.json(
          { error: "Only influencer can activate the contract" },
          { status: 403 },
        );
      }

      contract.status = "active";
      contract.activatedAt = new Date();
    }

    // Handle confirmation (for completion)
    if (status === "influencerConfirmed" && role === "influencer") {
      contract.influencerConfirmed = true;
    } else if (status === "ownerConfirmed" && role === "business") {
      contract.ownerConfirmed = true;
    }

    // If both confirmed, mark completed
    if (contract.influencerConfirmed && contract.ownerConfirmed) {
      contract.status = "completed";
      contract.completedAt = new Date();
    }

    // Handle termination (either role)
    if (status === "terminated") {
      contract.status = "terminated";
      contract.terminatedAt = new Date();
    }

    const updatedContract = await contract.save();
    return NextResponse.json({ data: updatedContract });
  } catch (error) {
    console.error("Error updating contract:", error);
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 },
    );
  }
}

/**
 * API Documentation:
 *
 * PATCH /api/contract/[id]/status
 * - Description: Updates the status of a specific contract or registers confirmation actions from either the influencer or the business owner.
 *   - Influencer can activate the contract.
 *   - Both influencer and owner must confirm to complete the contract.
 *   - Either party can terminate the contract.
 *
 * - Path Parameters:
 *   - id (required): The ID of the contract to update.
 *
 * - Request Body:
 *   {
 *     "status": "active" | "terminated" | "influencerConfirmed" | "ownerConfirmed",
 *     "role": "influencer" | "owner"
 *   }
 *
 * - Response:
 *   - 200: Returns the updated contract document.
 *     {
 *       "_id": "ContractObjectId",
 *       "status": "completed" | "active" | "terminated",
 *       "activatedAt": "2025-03-30T12:00:00.000Z" | null,
 *       "completedAt": "2025-03-31T12:00:00.000Z" | null,
 *       "terminatedAt": "2025-03-31T12:30:00.000Z" | null,
 *       "influencerConfirmed": true | false,
 *       "ownerConfirmed": true | false,
 *       "createdAt": "2025-03-29T10:00:00.000Z",
 *       "updatedAt": "2025-03-31T12:00:00.000Z"
 *     }
 *
 *   - 400: Returns an error message if:
 *     - The status is invalid.
 *     - The role is not allowed to perform the action.
 *     {
 *       "error": "Invalid status update" | "Only influencer can activate the contract"
 *     }
 *
 *   - 404: Returns an error message if the contract is not found.
 *     {
 *       "error": "Contract not found"
 *     }
 *
 *   - 500: Returns an error message if there is a server error.
 *     {
 *       "error": "Failed to update contract"
 *     }
 *
 * Detailed Behavior:
 * - Validates the `status` field to ensure it is one of: `"active"`, `"terminated"`, `"influencerConfirmed"`, `"ownerConfirmed"`.
 * - **Only the influencer** can change the status to `"active"`, setting the `activatedAt` timestamp.
 * - `"influencerConfirmed"` and `"ownerConfirmed"` track individual confirmation flags for completion.
 *   - When **both** are true, status is automatically set to `"completed"` and `completedAt` is set.
 * - `"terminated"` status can be set by either role and sets the `terminatedAt` timestamp.
 * - Role is required in the request body to verify permissions.
 *
 * Example Requests:
 *
 * PATCH /api/contract/64f8c0e2b5d6c9a1f8e7b123/status
 * Request Body:
 *   {
 *     "status": "active",
 *     "role": "influencer"
 *   }
 * Response (200):
 *   {
 *     "_id": "64f8c0e2b5d6c9a1f8e7b123",
 *     "status": "active",
 *     "activatedAt": "2025-03-30T12:00:00.000Z",
 *     "completedAt": null,
 *     "influencerConfirmed": false,
 *     "ownerConfirmed": false,
 *     ...
 *   }
 *
 * PATCH /api/contract/64f8c0e2b5d6c9a1f8e7b123/status
 * Request Body:
 *   {
 *     "status": "ownerConfirmed",
 *     "role": "owner"
 *   }
 * Response (200):
 *   {
 *     "_id": "64f8c0e2b5d6c9a1f8e7b123",
 *     "status": "completed",
 *     "activatedAt": "2025-03-30T12:00:00.000Z",
 *     "completedAt": "2025-03-31T12:00:00.000Z",
 *     "influencerConfirmed": true,
 *     "ownerConfirmed": true,
 *     ...
 *   }
 *
 * PATCH /api/contract/64f8c0e2b5d6c9a1f8e7b123/status
 * Request Body:
 *   {
 *     "status": "terminated",
 *     "role": "influencer"
 *   }
 * Response (200):
 *   {
 *     "_id": "64f8c0e2b5d6c9a1f8e7b123",
 *     "status": "terminated",
 *     "terminatedAt": "2025-03-31T13:00:00.000Z",
 *     ...
 *   }
 */
