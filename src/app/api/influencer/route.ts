import dbConnect from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { User } from "@/models/UserSchema";

export async function GET() {
  await dbConnect();

  try {
    const influencers = await User.find(
      { role: "influencer" },
      {
        name: 1,
        image: 1,
        bio: 1,
        price: 1,
        socialMedia: 1,
        location: 1,
        verified: 1,
        _id: 1,
      },
    );

    return NextResponse.json({ data: influencers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
