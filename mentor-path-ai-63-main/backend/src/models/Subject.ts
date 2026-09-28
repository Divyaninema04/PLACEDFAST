import mongoose, { Schema, type Document } from "mongoose";

export interface ISubject extends Document {
  userId: string;
  semesterId?: string;
  semesterNumber?: number;
  name: string;
  code?: string;
  credits?: number;
  progress: number;
  interviewTopics: string[];
  resources?: Array<{ title: string; url: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    userId: { type: String, required: true, index: true },
    semesterId: String,
    semesterNumber: { type: Number, default: 1 },
    name: { type: String, required: true },
    code: String,
    credits: { type: Number, default: 4 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    interviewTopics: { type: [String], default: [] },
    resources: [{ title: String, url: String }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.user_id = ret.userId;
        ret.semester_id = ret.semesterId;
        ret.semester_number = ret.semesterNumber || 1;
        ret.interview_topics = ret.interviewTopics || [];
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Subject =
  mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);
