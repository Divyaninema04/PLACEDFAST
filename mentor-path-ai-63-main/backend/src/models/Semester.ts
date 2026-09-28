import mongoose, { Schema, type Document } from "mongoose";

export interface ISemester extends Document {
  userId: string;
  number: number;
  label: string;
  gpa?: number;
  credits?: number;
  status: "completed" | "ongoing" | "upcoming";
  backlogsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema = new Schema<ISemester>(
  {
    userId: { type: String, required: true, index: true },
    number: { type: Number, required: true },
    label: { type: String, required: true },
    gpa: Number,
    credits: { type: Number, default: 20 },
    status: {
      type: String,
      enum: ["completed", "ongoing", "upcoming"],
      default: "ongoing",
    },
    backlogsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.user_id = ret.userId;
        ret.semester_number = ret.number;
        ret.number = ret.number;
        ret.label = ret.label;
        ret.sgpa = ret.gpa != null ? ret.gpa : null;
        ret.gpa = ret.gpa != null ? ret.gpa : null;
        ret.credits_earned = ret.credits != null ? ret.credits : 0;
        ret.total_credits = ret.credits != null ? ret.credits : 20;
        ret.credits = ret.credits != null ? ret.credits : 20;
        ret.status = ret.status;
        ret.backlogs_count = ret.backlogsCount || 0;
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Semester =
  mongoose.models.Semester || mongoose.model<ISemester>("Semester", SemesterSchema);
