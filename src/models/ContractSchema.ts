import mongoose from "mongoose";

const SocialMediaActionSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ["instagram", "tiktok", "youtube", "telegram"],
    required: true,
  },
  actionType: {
    type: String,
    enum: ["post", "story", "reel", "live"],
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

const ContractSchema = new mongoose.Schema(
  {
    // Core References
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    reciverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },

    // Contract Terms
    price: {
      type: Number,
      required: true,
    },
    socialMediaActions: [SocialMediaActionSchema],
    deadline: {
      type: Date,
      required: true,
    },

    // Status Logic
    status: {
      type: String,
      enum: ["draft", "active", "completed", "terminated"],
      default: "draft",
    },
    influencerConfirmed: {
      type: Boolean,
      default: false,
    },
    ownerConfirmed: {
      type: Boolean,
      default: false,
    },

    activatedAt: Date,
    completedAt: Date,
    terminatedAt: Date,
  },
  { timestamps: true }
);

// Middleware for updating status
ContractSchema.pre("save", async function (this: any) {
  // Set activation date only when influencer sets to active
  if (
    this.isModified("status") &&
    this.status === "active" &&
    !this.activatedAt
  ) {
    this.activatedAt = new Date();
  }

  // Set completed only when both confirm
  if (
    (this.isModified("influencerConfirmed") ||
      this.isModified("ownerConfirmed")) &&
    this.influencerConfirmed &&
    this.ownerConfirmed
  ) {
    this.status = "completed";
    this.completedAt = new Date();
  }

  // Allow termination by either party
  if (
    this.isModified("status") &&
    this.status === "terminated" &&
    !this.terminatedAt
  ) {
    this.terminatedAt = new Date();
  }

  // next();
});

export default mongoose.models.Contract ||
  mongoose.model("Contract", ContractSchema);
