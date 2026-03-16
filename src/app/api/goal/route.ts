import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import BusinessGoal from "@/models/Goal";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";
// POST /api/goal - create a new business goal
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const {
      businessId,
      targetValue,
      currentValue = 0,
      unit,
      startDate,
      estimatedEndDate,
    } = body;

    // validate required
    if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid businessId" },
        { status: 400 }
      );
    }
    if (typeof targetValue !== "number" || targetValue < 0) {
      return NextResponse.json(
        { message: "Invalid targetValue" },
        { status: 400 }
      );
    }

    const sd = new Date(startDate);
    const ed = new Date(estimatedEndDate);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return NextResponse.json({ message: "Invalid dates" }, { status: 400 });
    }

    const goal = new BusinessGoal({
      businessId: new mongoose.Types.ObjectId(businessId),
      targetValue,
      currentValue,
      unit,
      startDate: sd,
      estimatedEndDate: ed,
    });

    const saved = await goal.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Failed to create goal:", error);
    return NextResponse.json(
      { message: "Failed to create goal", error },
      { status: 500 }
    );
  }
}

// GET /api/goal?businessId=...  - list goals or by business
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);
    const businessId = url.searchParams.get("businessId");

    const query: any = {};
    if (businessId) {
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        return NextResponse.json(
          { message: "Invalid businessId" },
          { status: 400 }
        );
      }
      query.businessId = new mongoose.Types.ObjectId(businessId);
    }

    const goals = await BusinessGoal.find(query).sort({ createdAt: -1 });
    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return NextResponse.json(
      { message: "Failed to fetch goals", error },
      { status: 500 }
    );
  }
}

// PATCH /api/goal - update fields of a goal (expects goalId in body)
export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const {
      goalId,
      targetValue,
      currentValue,
      unit,
      startDate,
      estimatedEndDate,
    } = body;

    if (!goalId || !mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ message: "Invalid goalId" }, { status: 400 });
    }

    const update: any = {};
    if (typeof targetValue === "number") {
      if (targetValue < 0)
        return NextResponse.json(
          { message: "Invalid targetValue" },
          { status: 400 }
        );
      update.targetValue = targetValue;
    }
    if (typeof currentValue === "number") {
      if (currentValue < 0)
        return NextResponse.json(
          { message: "Invalid currentValue" },
          { status: 400 }
        );
      update.currentValue = currentValue;
    }
    if (unit) {
      const allowedUnits = [
        "birr",
        "customers",
        "sales",
        "tickets",
        "audience",
      ];
      update.unit = unit;
    }
    if (startDate) {
      const sd = new Date(startDate);
      if (Number.isNaN(sd.getTime()))
        return NextResponse.json(
          { message: "Invalid startDate" },
          { status: 400 }
        );
      update.startDate = sd;
    }
    if (estimatedEndDate) {
      const ed = new Date(estimatedEndDate);
      if (Number.isNaN(ed.getTime()))
        return NextResponse.json(
          { message: "Invalid estimatedEndDate" },
          { status: 400 }
        );
      update.estimatedEndDate = ed;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 }
      );
    }

    const updated = await BusinessGoal.findByIdAndUpdate(goalId, update, {
      new: true,
    });
    if (!updated)
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update goal:", error);
    return NextResponse.json(
      { message: "Failed to update goal", error },
      { status: 500 }
    );
  }
}

// DELETE /api/goal - delete a goal (expects goalId in body)
export async function DELETE(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const { goalId } = body;
    if (!goalId || !mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ message: "Invalid goalId" }, { status: 400 });
    }

    const deleted = await BusinessGoal.findByIdAndDelete(goalId);
    if (!deleted)
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });

    return NextResponse.json(
      { message: "Goal deleted", goal: deleted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return NextResponse.json(
      { message: "Failed to delete goal", error },
      { status: 500 }
    );
  }
}
