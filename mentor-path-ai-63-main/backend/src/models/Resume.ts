import mongoose, { Schema, type Document } from "mongoose";

export interface IResume extends Document {
  userId: string;
  label?: string;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  sizeBytes?: number;
  isPrimary: boolean;
  atsScore?: number;
  targetRole?: string;
  parsedSkills?: string[];
  extractedData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: String, required: true, index: true },
    label: { type: String, default: "Main resume" },
    fileName: String,
    filePath: String,
    fileUrl: String,
    sizeBytes: Number,
    isPrimary: { type: Boolean, default: false },
    atsScore: Number,
    targetRole: String,
    parsedSkills: { type: [String], default: [] },
    extractedData: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.user_id = ret.userId;
        ret.label = ret.label || ret.fileName || "Main resume";
        ret.file_path = ret.filePath || ret.fileUrl || ret.fileName || "";
        ret.file_name = ret.fileName || ret.label || "";
        ret.file_url = ret.fileUrl || ret.filePath || "";
        ret.size_bytes = ret.sizeBytes != null ? ret.sizeBytes : null;
        ret.is_primary = Boolean(ret.isPrimary);
        ret.ats_score = ret.atsScore;
        ret.target_role = ret.targetRole;
        ret.parsed_skills = ret.parsedSkills || [];
        ret.extracted_data = ret.extractedData || null;
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Resume =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);

