import { NextResponse, NextRequest } from "next/server";
import Earnings from "@/models/EarningSchema";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { userId, amount, source, metadata } = await request.json();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
    }

    const newEarning = new Earnings({
      userId,
      amount,
      source,
      metadata: metadata || "",
      status: "unpaid", // Default status
    });

    const savedEarning = await newEarning.save();
    return NextResponse.json(savedEarning, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create earning record", error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const status = url.searchParams.get("status");
    const query: {
      userId?: string;
      status?: string;
    } = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const earnings = await Earnings.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(earnings, { status: 200 });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return NextResponse.json(
      { message: "Failed to fetch earnings", error },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await dbConnect();

  try {
    const { earningId, status, paymentDate } = await request.json();

    if (!earningId) {
      return NextResponse.json(
        { message: "Earning ID is required" },
        { status: 400 }
      );
    }

    const updateData: {
      status?: string;
      paymentDate?: Date;
    } = {};

    if (status) updateData.status = status;
    if (status === "paid") updateData.paymentDate = paymentDate || new Date();

    const updatedEarning = await Earnings.findByIdAndUpdate(
      earningId,
      updateData,
      { new: true }
    );

    if (!updatedEarning) {
      return NextResponse.json(
        { message: "Earning not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEarning, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update earning", error },
      { status: 500 }
    );
  }
}

/**
 * API Documentation:
 *
 * POST /api/earning
 * - Description: Creates a new earnings record
 * - Request Body:
 *   {
 *     "userId": "userObjectId",
 *     "amount": 1000,
 *     "source": "promo_campaign_123",
 *     "metadata": "optional_additional_data"
 *   }
 * - Response:
 *   - 201: Returns the created earning document
 *   - 400: Invalid User ID
 *   - 500: Creation failed
 *
 * GET /api/earning
 * - Description: Fetches earnings with optional filters
 * - Query Parameters:
 *   - userId (optional): Filter by user
 *   - status (optional): "paid" or "unpaid"
 * - Response:
 *   - 200: Array of earning documents (sorted by newest first)
 *   - 500: Fetch failed
 *
 * PATCH /api/earning
 * - Description: Updates earning status (e.g., mark as paid)
 * - Request Body:
 *   {
 *     "earningId": "earningObjectId",
 *     "status": "paid",
 *     "paymentDate": "2023-01-01" (optional)
 *   }
 * - Response:
 *   - 200: Updated earning document
 *   - 400: Missing earningId
 *   - 404: Earning not found
 *   - 500: Update failed
 */
