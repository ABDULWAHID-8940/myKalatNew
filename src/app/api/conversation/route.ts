import { NextResponse, NextRequest } from "next/server";
import Conversation from "@/models/ConversationSchema";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { participantIds } = await request.json();

    // Validate input
    if (!Array.isArray(participantIds) || participantIds.length !== 2) {
      return NextResponse.json(
        { error: "Exactly 2 participant IDs required" },
        { status: 400 },
      );
    }

    // Check for existing conversation
    const existingConvo = await Conversation.findOne({
      participants: { $all: participantIds },
    });

    if (existingConvo) {
      return NextResponse.json({ data: existingConvo }, { status: 200 });
    }

    // Create new conversation
    const newConversation = new Conversation({
      participants: participantIds,
      lastMessage: "Conversation started",
      updatedAt: new Date(),
    });

    const savedConversation = await newConversation.save();
    // Trigger Pusher event to both participants
    participantIds.forEach(async (userId: string) => {
      await pusherServer.trigger(
        `user-${userId}`,
        "new-conversation", // Changed from 'new-chat'
        savedConversation,
      );
    });
    return NextResponse.json({ data: savedConversation }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid or missing user ID" },
        { status: 400 },
      );
    }

    const conversations = await Conversation.aggregate([
      // 1. Find conversations with this user
      { $match: { participants: new mongoose.Types.ObjectId(userId) } },

      // 2. Sort by most recent
      { $sort: { updatedAt: -1 } },

      // 3. Lookup participant details
      {
        $lookup: {
          from: "user",
          localField: "participants",
          foreignField: "_id",
          as: "participantDetails",
        },
      },

      // 4. Transform to your desired format
      {
        $project: {
          _id: 1,
          updatedAt: 1,
          lastMessage: 1,
          unreadCount: { $ifNull: ["$unreadCount", 0] }, // Default to 0 if missing
          otherUser: {
            $let: {
              vars: {
                otherUser: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$participantDetails",
                        as: "user",
                        cond: {
                          $ne: [
                            "$$user._id",
                            new mongoose.Types.ObjectId(userId),
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                name: "$$otherUser.name",
                image: { $ifNull: ["$$otherUser.image", null] },
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json({ data: conversations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 },
    );
  }
}
/**
 * API Documentation:
 *
 * POST /api/conversation
 * - Description: Creates a new conversation between two participants or retrieves an existing one.
 * - Request Body:
 *   {
 *     "participantIds": ["UserObjectId1", "UserObjectId2"]
 *   }
 * - Response:
 *   - 201: Returns the newly created conversation document.
 *     {
 *       "_id": "ConversationObjectId",
 *       "participants": ["UserObjectId1", "UserObjectId2"],
 *       "lastMessage": "Conversation started",
 *       "updatedAt": "2025-03-30T12:00:00.000Z"
 *     }
 *   - 200: Returns the existing conversation document if it already exists.
 *     {
 *       "_id": "ConversationObjectId",
 *       "participants": ["UserObjectId1", "UserObjectId2"],
 *       "lastMessage": "Last message content",
 *       "updatedAt": "2025-03-30T12:00:00.000Z"
 *     }
 *   - 400: Returns an error message if the input is invalid.
 *     {
 *       "error": "Exactly 2 participant IDs required"
 *     }
 *   - 500: Returns an error message if the conversation creation fails.
 *     {
 *       "error": "Failed to create conversation"
 *     }
 *
 *
 * GET /api/conversation
 * - Description: Fetches all conversations for a specific user, sorted by the most recent.
 * - Query Parameters:
 *   - userId (required): The ID of the user whose conversations are being fetched.
 * - Response:
 *   - 200: Returns an array of conversation documents.
 *     [
 *       {
 *         "_id": "ConversationObjectId",
 *         "updatedAt": "2025-03-30T12:00:00.000Z",
 *         "lastMessage": "Last message content",
 *         "unreadCount": 3,
 *         "otherUser": {
 *           "name": "Other User Name",
 *            "image": "https://example.com/image.jpg",
 *         }
 *       }
 *     ]
 *   - 400: Returns an error message if the userId is invalid.
 *     {
 *       "error": "Invalid user ID"
 *     }
 *   - 500: Returns an error message if the fetch fails.
 *     {
 *       "error": "Failed to load conversations"
 *     }
 *
 * Detailed Behavior:
 * - **POST**:
 *   - Validates that `participantIds` is an array of exactly two valid MongoDB ObjectIds.
 *   - Checks if a conversation already exists between the two participants.
 *   - If it exists, returns the existing conversation.
 *   - If it doesn't exist, creates a new conversation with:
 *     - `participants`: The two user IDs.
 *     - `lastMessage`: "Conversation started".
 *     - `updatedAt`: Current timestamp.
 * - **GET**:
 *   - Validates that `userId` is a valid MongoDB ObjectId.
 *   - Finds all conversations where the user is a participant.
 *   - Sorts conversations by `updatedAt` in descending order.
 *   - Uses `$lookup` to fetch participant details for the other user in the conversation.
 *   - Reshapes the data to include:
 *     - `otherUser`: The other participant's details.
 *     - `lastMessage`: The last message in the conversation.
 *     - `updatedAt`: The timestamp of the last update.
 *
 * Example Requests:
 *
 * POST /api/conversation
 * Request Body:
 *   {
 *     "participantIds": ["64f8c0e2b5d6c9a1f8e7b123", "64f8c0e2b5d6c9a1f8e7b456"]
 *   }
 * Response (201):
 *   {
 *     "_id": "64f8c0e2b5d6c9a1f8e7b789",
 *     "participants": ["64f8c0e2b5d6c9a1f8e7b123", "64f8c0e2b5d6c9a1f8e7b456"],
 *     "lastMessage": "Conversation started",
 *     "updatedAt": "2025-03-30T12:00:00.000Z"
 *   }
 *
 * GET /api/conversation?userId=64f8c0e2b5d6c9a1f8e7b123
 * Response (200):
 *   [
 *     {
 *       "_id": "64f8c0e2b5d6c9a1f8e7b789",
 *       "updatedAt": "2025-03-30T12:00:00.000Z",
 *       "lastMessage": "Last message content",
 *       "unreadCount": 3,
 *       "otherUser": {
 *         "_id": "64f8c0e2b5d6c9a1f8e7b456",
 *         "name": "Other User Name",
 *         "email": "otheruser@example.com"
 *       }
 *     }
 *   ]
 */
