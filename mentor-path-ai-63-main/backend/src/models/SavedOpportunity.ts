import mongoose, { Schema, type Document } from "mongoose";

export interface ISavedOpportunity extends Document {
  userId: string;
  opportunityId: string;
  createdAt: Date;
}

const SavedOpportunitySchema = new Schema<ISavedOpportunity>(
  {
    userId: { type: String, required: true, index: true },
    opportunityId: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.user_id = ret.userId;
        ret.opportunity_id = ret.opportunityId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const SavedOpportunity =
  mongoose.models.SavedOpportunity ||
  mongoose.model<ISavedOpportunity>("SavedOpportunity", SavedOpportunitySchema);
