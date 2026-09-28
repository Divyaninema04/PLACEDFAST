import mongoose, { Schema, type Document } from "mongoose";

export interface IRoadmapProgress extends Document {
  userId: string;
  stageKey: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number;
  completedMilestones: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapProgressSchema = new Schema<IRoadmapProgress>(
  {
    userId: { type: String, required: true, index: true },
    stageKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    progress: { type: Number, default: 0 },
    completedMilestones: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.user_id = ret.userId;
        ret.stage_key = ret.stageKey;
        ret.completed_milestones = ret.completedMilestones;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const RoadmapProgress =
  mongoose.models.RoadmapProgress ||
  mongoose.model<IRoadmapProgress>("RoadmapProgress", RoadmapProgressSchema);
