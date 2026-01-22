// app/api/conversations/[conversationId]/messages/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Message from "@/models/MessageSchema";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  await dbConnect();
  const { id } = await params; // Extract the job ID from the dynamic route parameter

  try {
    // 1. Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid conversation ID" },
        { status: 400 },
      );
    }

    // 2. Fetch messages (newest first)
    const messages = await Message.find({
      conversationId: id,
    })
      .sort({ createdAt: -1 })
      .select("-__v"); // Exclude version key

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 },
    );
  }
}

/**
 * API Documentation:
 *
 * GET /api/conversations/[conversationId]/messages
 * - Description: Fetches all messages for a specific conversation, sorted by the newest first.
 * - Path Parameters:
 *   - conversationId (required): The ID of the conversation whose messages are being fetched.
 * - Response:
 *   - 200: Returns an array of message documents.
 *     [
 *       {
 *         "_id": "MessageObjectId",
 *         "conversationId": "ConversationObjectId",
 *         "senderId": "SenderObjectId",
 *         "content": "Message content",
 *         "status": {
 *           "delivered": true,
 *           "read": false
 *         },
 *         "createdAt": "2025-03-30T12:00:00.000Z",
 *         "updatedAt": "2025-03-30T12:00:00.000Z"
 *       }
 *     ]
 *   - 400: Returns an error message if the conversationId is invalid.
 *     {
 *       "error": "Invalid conversation ID"
 *     }
 *   - 500: Returns an error message if the fetch fails.
 *     {
 *       "error": "Failed to load messages"
 *     }
 *
 * Detailed Behavior:
 * - Validates that `conversationId` is a valid MongoDB ObjectId.
 * - Fetches all messages for the specified conversation ID.
 * - Sorts messages by `createdAt` in descending order (newest first).
 * - Excludes the `__v` field from the returned documents.
 *
 * Example Request:
 *
 * GET /api/conversations/64f8c0e2b5d6c9a1f8e7b123/messages
 * Response (200):
 *   [
 *     {
 *       "_id": "64f8c0e2b5d6c9a1f8e7b456",
 *       "conversationId": "64f8c0e2b5d6c9a1f8e7b123",
 *       "senderId": "64f8c0e2b5d6c9a1f8e7b789",
 *       "content": "Hello, how are you?",
 *       "status": {
 *         "delivered": true,
 *         "read": false
 *       },
 *       "createdAt": "2025-03-30T12:00:00.000Z",
 *       "updatedAt": "2025-03-30T12:00:00.000Z"
 *     }
 *   ]
 * Response (400):
 *   {
 *     "error": "Invalid conversation ID"
 *   }
 * Response (500):
 *   {
 *     "error": "Failed to load messages"
 *   }
 */
