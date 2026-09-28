import mongoose, { Schema, type Document } from "mongoose";

export interface IOpportunity extends Document {
  title: string;
  organization: string;
  category: string;
  description?: string;
  eligibilityText?: string;
  deadline?: string;
  location?: string;
  state?: string;
  educationLevel?: string;
  branches?: string[];
  minCgpa?: number;
  graduationYears?: number[];
  applyUrl?: string;
  sourceName?: string;
  sourceUrl: string;
  relevantSkills?: string[];
  lastVerifiedAt?: Date;
  verificationStatus: string;
  createdBy?: string;
  eligibility?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true },
    organization: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: String,
    eligibilityText: String,
    deadline: String,
    location: String,
    state: String,
    educationLevel: String,
    branches: [String],
    minCgpa: Number,
    graduationYears: [Number],
    applyUrl: String,
    sourceName: String,
    sourceUrl: { type: String, required: true },
    relevantSkills: { type: [String], default: [] },
    lastVerifiedAt: { type: Date, default: Date.now },
    verificationStatus: { type: String, default: "verified" },
    createdBy: String,
    eligibility: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.eligibility_text = ret.eligibilityText;
        ret.education_level = ret.educationLevel;
        ret.min_cgpa = ret.minCgpa;
        ret.graduation_years = ret.graduationYears;
        ret.apply_url = ret.applyUrl;
        ret.source_name = ret.sourceName;
        ret.source_url = ret.sourceUrl;
        ret.relevant_skills = ret.relevantSkills || [];
        ret.last_verified_at = ret.lastVerifiedAt;
        ret.verification_status = ret.verificationStatus;
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Opportunity =
  mongoose.models.Opportunity || mongoose.model<IOpportunity>("Opportunity", OpportunitySchema);
