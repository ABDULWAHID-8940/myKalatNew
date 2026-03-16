// app/api/messages/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Message from "@/models/MessageSchema";
import Conversation from "@/models/ConversationSchema";
import mongoose from "mongoose";
import { pusherServer } from "@/lib/pusher";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  await dbConnect();

  try {
    const { conversationId, senderId, content } = await request.json();

    // Validate input
    if (
      !mongoose.Types.ObjectId.isValid(conversationId) ||
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !content?.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 },
      );
    }

    // Create new message
    const newMessage = new Message({
      conversationId,
      senderId,
      content: content.trim(),
      status: {
        delivered: true,
        read: false,
      },
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage:
        content.length > 50 ? `${content.substring(0, 47)}...` : content,
    });

    const savedMessage = await newMessage.save();
    // Get conversation participants
    const conversation = await Conversation.findById(conversationId);
    const participants = conversation?.participants || [];

    // Trigger message event
    await pusherServer
      .trigger(`conversation-${conversationId}`, "new-message", savedMessage)
      .catch(console.error);

    // Trigger conversation updates
    await Promise.all(
      participants.map(async (participantId: string) => {
        const updatedConv =
          await Conversation.findById(conversationId).populate("participants");

        await pusherServer
          .trigger(`user-${participantId}`, "conversation-updated", {
            _id: conversationId,
            lastMessage:
              content.length > 50 ? `${content.substring(0, 47)}...` : content,
            updatedAt: new Date(),
            otherUser: {
              name: updatedConv?.participants.find(
                (p: {
                  _id: mongoose.Types.ObjectId;
                  name: string;
                  image: string;
                }) => p._id.toString() !== participantId,
              )?.name,
              image: updatedConv?.participants.find(
                (p: {
                  _id: mongoose.Types.ObjectId;
                  name: string;
                  image: string;
                }) => p._id.toString() !== participantId,
              )?.image,
            },
          })
          .catch(console.error);
      }),
    );

    return NextResponse.json({ data: savedMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

/**
 * API Documentation:
 *
 * POST /api/message
 * - Description: Creates a new message in the database and updates the corresponding conversation's last message.
 * - Request Body:
 *   {
 *     "conversationId": "ConversationObjectId",
 *     "senderId": "SenderObjectId",
 *     "content": "Message content"
 *   }
 * - Response:
 *   - 201: Returns the created message document.
 *     {
 *       "_id": "MessageObjectId",
 *       "conversationId": "ConversationObjectId",
 *       "senderId": "SenderObjectId",
 *       "content": "Message content",
 *       "status": {
 *         "delivered": true,
 *         "read": false
 *       },
 *       "createdAt": "2025-03-30T12:00:00.000Z",
 *       "updatedAt": "2025-03-30T12:00:00.000Z"
 *     }
 *   - 400: Returns an error message if the input data is invalid.
 *     {
 *       "error": "Invalid input data"
 *     }
 *   - 500: Returns an error message if the message creation fails.
 *     {
 *       "error": "Failed to send message"
 *     }
 *
 * Detailed Behavior:
 * - Validates the input:
 *   - `conversationId` and `senderId` must be valid MongoDB ObjectIds.
 *   - `content` must be a non-empty string.
 * - Creates a new message with the following fields:
 *   - `conversationId`: The ID of the conversation the message belongs to.
 *   - `senderId`: The ID of the user sending the message.
 *   - `content`: The content of the message (trimmed).
 *   - `status`: An object with:
 *     - `delivered`: Set to `true` by default.
 *     - `read`: Set to `false` by default.
 * - Updates the `lastMessage` field of the corresponding conversation:
 *   - Sets the `lastMessage` to the message content (truncated to 50 characters if necessary).
 *   - Updates the `updatedAt` field to the current timestamp.
 *
 * Example Request:
 * POST /api/message
 * Request Body:
 *   {
 *     "conversationId": "64f8c0e2b5d6c9a1f8e7b123",
 *     "senderId": "64f8c0e2b5d6c9a1f8e7b456",
 *     "content": "Hello, how are you?"
 *   }
 * Response (201):
 *   {
 *     "_id": "64f8c0e2b5d6c9a1f8e7b789",
 *     "conversationId": "64f8c0e2b5d6c9a1f8e7b123",
 *     "senderId": "64f8c0e2b5d6c9a1f8e7b456",
 *     "content": "Hello, how are you?",
 *     "status": {
 *       "delivered": true,
 *       "read": false
 *     },
 *     "createdAt": "2025-03-30T12:00:00.000Z",
 *     "updatedAt": "2025-03-30T12:00:00.000Z"
 *   }
 * Response (400):
 *   {
 *     "error": "Invalid input data"
 *   }
 * Response (500):
 *   {
 *     "error": "Failed to send message"
 *   }
 */
