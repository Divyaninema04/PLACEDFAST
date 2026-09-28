import mongoose, { Schema, type Document } from "mongoose";

export interface ICompany extends Document {
  slug: string;
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  careersUrl?: string;
  hqLocation?: string;
  minCgpa?: number;
  allowedBranches?: string[];
  techStack?: string[];
  salaryMin?: number;
  salaryMax?: number;
  hiringSeason?: string;
  processSteps?: string[];
  dsaTopics?: string[];
  csSubjects?: string[];
  sourceName?: string;
  sourceUrl?: string;
  verificationStatus?: string;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: String,
    description: String,
    website: String,
    careersUrl: String,
    hqLocation: String,
    minCgpa: Number,
    allowedBranches: [String],
    techStack: [String],
    salaryMin: Number,
    salaryMax: Number,
    hiringSeason: String,
    processSteps: [String],
    dsaTopics: [String],
    csSubjects: [String],
    sourceName: String,
    sourceUrl: String,
    verificationStatus: {
      type: String,
      default: "verified",
    },
    lastVerifiedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        // Provide both camelCase and snake_case aliases for 100% frontend compatibility
        ret.careers_url = ret.careersUrl;
        ret.hq_location = ret.hqLocation;
        ret.min_cgpa = ret.minCgpa;
        ret.allowed_branches = ret.allowedBranches;
        ret.tech_stack = ret.techStack;
        ret.salary_min = ret.salaryMin;
        ret.salary_max = ret.salaryMax;
        ret.hiring_season = ret.hiringSeason;
        ret.process_steps = ret.processSteps;
        ret.dsa_topics = ret.dsaTopics;
        ret.cs_subjects = ret.csSubjects;
        ret.source_name = ret.sourceName;
        ret.source_url = ret.sourceUrl;
        ret.verification_status = ret.verificationStatus;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Company = mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);
