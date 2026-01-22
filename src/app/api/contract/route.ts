// app/api/contracts/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Contract from "@/models/ContractSchema";
import mongoose from "mongoose";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { senderId, reciverId, price, socialMediaActions, deadline } =
      await request.json();

    // Validate proposal exists and get required data

    if (!senderId || !reciverId) {
      return NextResponse.json(
        { error: "Both senderId and reciverId are required" },
        { status: 400 },
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return NextResponse.json(
        { error: "Invalid senderId format" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(reciverId)) {
      return NextResponse.json(
        { error: "Invalid reciverId format" },
        { status: 400 },
      );
    }

    const newContract = await Contract.create({
      senderId,
      reciverId,
      price,
      socialMediaActions,
      deadline,
      status: "draft", // Default status
    });

    return NextResponse.json({ data: newContract }, { status: 201 });
  } catch (error) {
    console.error("Error creating contract:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 },
    );
  }
}

// export async function GET(request: Request) {
//   await dbConnect();

//   try {
//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status");
//     const proposalId = searchParams.get("proposalId");

//     const query: Record<string, unknown> = {};
//     if (status) query.status = status;
//     if (proposalId) query.proposalId = proposalId;

//     const contracts = await Contract.find(query).sort({ createdAt: -1 }).lean();

//     return NextResponse.json(contracts, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching contracts:", error); // Log the error for debugging
//     return NextResponse.json(
//       { error: "Failed to fetch contracts" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const influencerId = searchParams.get("influencerId"); // The influencerId to match against senderinfluencerId or reciverinfluencerId

    if (!influencerId) {
      return NextResponse.json(
        { error: "An 'id' query parameter is required" },
        { status: 400 },
      );
    }

    const query = {
      $or: [{ senderId: influencerId }, { reciverId: influencerId }], // Match id in either senderId or reciverId
    };

    const contracts = await Contract.find(query).sort({ createdAt: -1 });
    // .populate({
    //   path: "proposalId",
    //   populate: [
    //     { path: "jobId", select: "title description userId", model: Job },
    //   ],
    // })
    // .lean();

    return NextResponse.json({ data: contracts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 },
    );
  }
}

/**
 * API Documentation:
 *
 * POST /api/contract
 * - Description: Creates a new contract based on a proposal.
 * - Request Body:
 *   {
 *     "senderId": "senderObjectId",
 *     "reciver": "reciverObjectId",
 *     "price": 1000,
 *     "socialMediaActions": [
 *       {
 *         "platform": "instagram",
 *         "actionType": "post",
 *         "quantity": 2
 *       },
 *       {
 *         "platform": "tiktok",
 *         "actionType": "story",
 *         "quantity": 1
 *       }
 *     ],
 *     "deadline": "2025-04-15T00:00:00.000Z"
 *   }
 * - Response:
 *   - 201: Returns the newly created contract document.
 *     {
 *       "_id": "ContractObjectId",
 *       "senderId": "senderObjectId",
 *  *     "reciver": "reciverObjectId",

 *       "price": 1000,
 *       "socialMediaActions": [
 *         {
 *           "platform": "instagram",
 *           "actionType": "post",
 *           "quantity": 2
 *         },
 *         {
 *           "platform": "tiktok",
 *           "actionType": "story",
 *           "quantity": 1
 *         }
 *       ],
 *       "deadline": "2025-04-15T00:00:00.000Z",
 *       "status": "draft",
 *       "createdAt": "2025-03-30T12:00:00.000Z",
 *       "updatedAt": "2025-03-30T12:00:00.000Z"
 *     }
 *   - 404: Returns an error message if the proposal is not found.
 *     {
 *       "error": "Proposal not found"
 *     }
 *   - 500: Returns an error message if the contract creation fails.
 *     {
 *       "error": "Failed to create contract"
 *     }
 *
 *
 * GET /api/contract
 * - Description: Fetches all contracts or filters contracts based on query parameters.
 * - Query Parameters:
 *   - status (optional): Filters contracts by their status (e.g., "draft", "active", "completed").
 *   - proposalId (optional): Filters contracts by the associated proposal ID.
 * - Response:
 *   - 200: Returns an array of contract documents.
 *     [
 *       {
 *         "_id": "ContractObjectId",
 *         "proposalId": "ProposalObjectId",
 *         "price": 1000,
 *         "socialMediaActions": [
 *           {
 *             "platform": "instagram",
 *             "actionType": "post",
 *             "quantity": 2
 *           },
 *           {
 *             "platform": "tiktok",
 *             "actionType": "story",
 *             "quantity": 1
 *           }
 *         ],
 *         "deadline": "2025-04-15T00:00:00.000Z",
 *         "status": "draft",
 *         "createdAt": "2025-03-30T12:00:00.000Z",
 *         "updatedAt": "2025-03-30T12:00:00.000Z"
 *       }
 *     ]
 *   - 500: Returns an error message if the fetch fails.
 *     {
 *       "error": "Failed to fetch contracts"
 *     }
 *
 * Detailed Behavior:
 * - **POST**:
 *   - Validates that the `proposalId` exists in the database.
 *   - Creates a new contract with the provided `price`, `socialMediaActions`, and `deadline`.
 *   - The `socialMediaActions` field is an array of objects, where each object contains:
 *     - `platform`: The social media platform (e.g., "instagram", "tiktok", "youtube", "twitter").
 *     - `actionType`: The type of action (e.g., "post", "story", "reel", "live").
 *     - `quantity`: The number of actions (default is 1 if not provided).
 *   - Sets the default `status` to `"draft"`.
 * - **GET**:
 *   - Builds a query object based on the provided `status` and `proposalId` query parameters.
 *   - Fetches contracts that match the query and sorts them by `createdAt` in descending order.
 *   - Converts the result to plain JavaScript objects using `.lean()` for better performance.
 *
 * Example Requests:
 *
 * POST /api/contract
 * Request Body:
 *   {
 *     "proposalId": "64f8c0e2b5d6c9a1f8e7b123",
 *     "price": 1000,
 *     "socialMediaActions": [
 *       {
 *         "platform": "instagram",
 *         "actionType": "post",
 *         "quantity": 2
 *       },
 *       {
 *         "platform": "tiktok",
 *         "actionType": "story",
 *         "quantity": 1
 *       }
 *     ],
 *     "deadline": "2025-04-15T00:00:00.000Z"
 *   }
 * Response (201):
 *   {
 *     "_id": "64f8c0e2b5d6c9a1f8e7b789",
 *     "proposalId": "64f8c0e2b5d6c9a1f8e7b123",
 *     "price": 1000,
 *     "socialMediaActions": [
 *       {
 *         "platform": "instagram",
 *         "actionType": "post",
 *         "quantity": 2
 *       },
 *       {
 *         "platform": "tiktok",
 *         "actionType": "story",
 *         "quantity": 1
 *       }
 *     ],
 *     "deadline": "2025-04-15T00:00:00.000Z",
 *     "status": "draft",
 *     "createdAt": "2025-03-30T12:00:00.000Z",
 *     "updatedAt": "2025-03-30T12:00:00.000Z"
 *   }
 *
 * GET /api/contract?status=draft&proposalId=64f8c0e2b5d6c9a1f8e7b123
 * Response (200):
 *   [
 *     {
 *       "_id": "64f8c0e2b5d6c9a1f8e7b789",
 *       "proposalId": "64f8c0e2b5d6c9a1f8e7b123",
 *       "price": 1000,
 *       "socialMediaActions": [
 *         {
 *           "platform": "instagram",
 *           "actionType": "post",
 *           "quantity": 2
 *         },
 *         {
 *           "platform": "tiktok",
 *           "actionType": "story",
 *           "quantity": 1
 *         }
 *       ],
 *       "deadline": "2025-04-15T00:00:00.000Z",
 *       "status": "draft",
 *       "createdAt": "2025-03-30T12:00:00.000Z",
 *       "updatedAt": "2025-03-30T12:00:00.000Z"
 *     }
 *   ]
 */
