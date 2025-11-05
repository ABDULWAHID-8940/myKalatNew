import mongoose, { Schema, Document, model } from "mongoose";

// Define an interface for the Business Goal document
export interface IBusinessGoal extends Document {
  businessId: mongoose.Types.ObjectId;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  estimatedEndDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isCompleted?: boolean;
}

// Define the schema
const BusinessGoalSchema = new Schema<IBusinessGoal>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business", // Reference to a Business model
      required: true,
    },
    targetValue: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, default: 0, min: 0 },
    unit: {
      type: String,
      required: true,
    },
    startDate: { type: Date, required: true },
    isCompleted: { type: Boolean, required: false },
    estimatedEndDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const BusinessGoal =
  mongoose.models.BusinessGoal ||
  model<IBusinessGoal>("BusinessGoal", BusinessGoalSchema);

export default BusinessGoal;
