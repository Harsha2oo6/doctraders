import "server-only";
import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";
import { LISTING_KINDS, LISTING_STATUSES, UNITS, UPLOAD_LIMITS } from "@/lib/constants";
import { toJSON } from "./common";

const ListingSchema = new Schema(
  {
    kind: { type: String, enum: LISTING_KINDS, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: UNITS, required: true },
    price: { type: Number, min: 0 },
    minOrderQuantity: { type: Number, min: 0 },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    images: {
      type: [String],
      default: [],
      validate: { validator: (v: string[]) => v.length <= UPLOAD_LIMITS.maxImagesPerListing, message: "Up to 6 photos" },
    },
    status: { type: String, enum: LISTING_STATUSES, default: "active" },
    enquiryCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON },
);

ListingSchema.index({ status: 1, kind: 1, category: 1, createdAt: -1 });
ListingSchema.index({ title: "text", description: "text" });

export type ListingDoc = InferSchemaType<typeof ListingSchema> & { _id: Types.ObjectId };
export const ListingModel: Model<ListingDoc> =
  (models.Listing as Model<ListingDoc>) || model<ListingDoc>("Listing", ListingSchema);
