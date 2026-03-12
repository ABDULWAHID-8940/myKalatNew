import mongoose, { Schema, Document, model } from "mongoose";

// Define an interface for the Job document
export interface IJob extends Document {
  title: string;
  description: string;
  price: number;
  location?: string;
  campaignPriority: string;
  socialMedia: {
    platform: "instagram" | "youtube" | "tiktok" | "telegram";
  }[];
  postedBy: mongoose.Types.ObjectId;
  status: "open" | "in-progress" | "completed" | "cancelled";
  statusInPercent?: number; // Percentage of job completion
  goalId: mongoose.Types.ObjectId; // Reference to associated goal
  goalContributionPercent?: number; // Percentage contribution to the goal
  hiredInfluencers: mongoose.Types.ObjectId[]; // Array of hired influencers
  proposalsSubmitted: {
    proposal: mongoose.Types.ObjectId;
    influencer: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Job schema
const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // Ensure price is non-negative
    location: { type: String, trim: true },
    campaignPriority: { type: String, required: true },
    socialMedia: [
      {
        platform: {
          type: String,
          enum: ["instagram", "youtube", "tiktok", "telegram"], // Restrict to valid platforms
          required: true,
        },
      },
    ],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"], // Restrict to valid statuses
      default: "open", // Default status is "open"
    },
    statusInPercent: { type: Number, min: 0, max: 100, default: 0 }, // Percentage of job completion
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessGoal",
    },
     
    goalContributionPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 100, // default means full job contributes
    },
    hiredInfluencers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
      },
    ],
    proposalsSubmitted: [
      {
        _id: false,
        proposal: {
          type: Schema.Types.ObjectId,
          ref: "Proposal",
          required: true,
        },
        influencer: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || model<IJob>("Job", JobSchema);
export default Job;
