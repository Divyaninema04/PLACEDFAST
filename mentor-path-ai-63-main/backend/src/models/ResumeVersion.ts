import mongoose, { Schema, type Document } from "mongoose";

export interface IResumeVersion extends Document {
  userId: string;
  label: string;
  targetRole?: string;
  sections: {
    contact?: string;
    summary?: string;
    education?: string;
    skills?: string[];
    projectBullets?: string[];
    achievementBullets?: string[];
  };
  aiSuggested?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeVersionSchema = new Schema<IResumeVersion>(
  {
    userId: { type: String, required: true, index: true },
    label: { type: String, required: true },
    targetRole: String,
    sections: {
      type: Schema.Types.Mixed,
      default: {},
    },
    aiSuggested: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.user_id = ret.userId;
        ret.target_role = ret.targetRole;
        ret.ai_suggested = ret.aiSuggested;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const ResumeVersion =
  mongoose.models.ResumeVersion ||
  mongoose.model<IResumeVersion>("ResumeVersion", ResumeVersionSchema);
