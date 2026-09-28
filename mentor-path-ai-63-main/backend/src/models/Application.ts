import mongoose, { Schema, type Document } from "mongoose";

export interface IApplication extends Document {
  userId: string;
  companyName: string;
  companyId?: mongoose.Types.ObjectId;
  role: string;
  status: "applied" | "assessment" | "interview" | "offer" | "rejected";
  packageLpa?: number;
  location?: string;
  appliedDate?: Date;
  nextStep?: string;
  nextStepDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["applied", "assessment", "interview", "offer", "rejected"],
      default: "applied",
    },
    packageLpa: Number,
    location: String,
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    nextStep: String,
    nextStepDate: Date,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.user_id = ret.userId;
        ret.company_name = ret.companyName;
        ret.company_id = ret.companyId?.toString();
        ret.package_lpa = ret.packageLpa;
        ret.applied_date = ret.appliedDate;
        ret.next_step = ret.nextStep;
        ret.next_step_date = ret.nextStepDate;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Application =
  mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);
