import "server-only";
import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";
import { ENQUIRY_STATUSES, LISTING_KINDS } from "@/lib/constants";
import { toJSON } from "./common";

const NoteSchema = new Schema({
  text: { type: String, required: true, trim: true },
  byId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  byName: { type: String, required: true },
  at: { type: Date, default: () => new Date() },
});

const HistorySchema = new Schema(
  {
    status: { type: String, enum: ENQUIRY_STATUSES, required: true },
    byId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    at: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const EnquirySchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    listingKind: { type: String, enum: LISTING_KINDS, required: true },
    listingTitle: { type: String, required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    message: { type: String, trim: true },
    status: { type: String, enum: ENQUIRY_STATUSES, default: "new" },
    notes: { type: [NoteSchema], default: [] },
    statusHistory: { type: [HistorySchema], default: [] },
    dealId: { type: Schema.Types.ObjectId, ref: "Deal" },
  },
  { timestamps: true, toJSON },
);

EnquirySchema.index({ listingId: 1, fromUserId: 1 }, { unique: true });
EnquirySchema.index({ status: 1, createdAt: -1 });

export type EnquiryDoc = InferSchemaType<typeof EnquirySchema> & { _id: Types.ObjectId };
export const EnquiryModel: Model<EnquiryDoc> =
  (models.Enquiry as Model<EnquiryDoc>) || model<EnquiryDoc>("Enquiry", EnquirySchema);
