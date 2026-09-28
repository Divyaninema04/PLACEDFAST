import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  googleId?: string;
  fullName: string;
  avatar?: string;
  college?: string;
  university?: string;
  branch?: string;
  degree?: string;
  course?: string;
  yearOfStudy?: number;
  currentSemester?: number;
  graduationYear?: number;
  cgpa?: number;
  targetCgpa?: number;
  skills: string[];
  achievements: string[];
  projects: Array<{
    title: string;
    description: string;
    techStack?: string[];
    link?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate?: Date;
    url?: string;
  }>;
  codingProfiles: Record<string, string> | Array<{
    platform: string;
    handle: string;
    url?: string;
  }>;
  dreamCompanies: string[];
  preferredRoles: string[];
  careerInterests: string[];
  state?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    fullName: {
      type: String,
      required: true,
      default: "Student",
    },
    avatar: String,
    college: String,
    university: String,
    branch: String,
    degree: String,
    course: String,
    yearOfStudy: Number,
    currentSemester: Number,
    graduationYear: Number,
    cgpa: Number,
    targetCgpa: Number,
    skills: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
        link: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        url: String,
      },
    ],
    codingProfiles: {
      type: Schema.Types.Mixed,
      default: {},
    },
    dreamCompanies: {
      type: [String],
      default: [],
    },
    preferredRoles: {
      type: [String],
      default: [],
    },
    careerInterests: {
      type: [String],
      default: [],
    },
    state: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.full_name = ret.fullName || ret.name || "";
        ret.name = ret.fullName || ret.name || "";
        ret.year_of_study = ret.yearOfStudy;
        ret.current_semester = ret.currentSemester;
        ret.graduation_year = ret.graduationYear;
        ret.target_cgpa = ret.targetCgpa;
        ret.dream_companies = ret.dreamCompanies || [];
        ret.preferred_roles = ret.preferredRoles || [];
        ret.career_interests = ret.careerInterests || [];
        ret.coding_profiles = ret.codingProfiles || {};
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  },
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
