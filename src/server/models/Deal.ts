import "server-only";
import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";
import { COMMISSION_STATUSES, DEAL_STATUSES, PAYMENT_METHODS, SHIPMENT_STATUSES, UNITS } from "@/lib/constants";
import { toJSON } from "./common";

const PaymentSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: PAYMENT_METHODS },
  note: { type: String, trim: true },
  paidAt: { type: Date, default: () => new Date() },
  byId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const ShipmentHistorySchema = new Schema(
  {
    status: { type: String, enum: SHIPMENT_STATUSES, required: true },
    at: { type: Date, default: () => new Date() },
    byId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false },
);

const ShipmentSchema = new Schema({
  quantity: { type: Number, required: true, min: 0 },
  status: { type: String, enum: SHIPMENT_STATUSES, default: "packed" },
  note: { type: String, trim: true },
  history: { type: [ShipmentHistorySchema], default: [] },
  createdAt: { type: Date, default: () => new Date() },
});

const DealSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    enquiryId: { type: Schema.Types.ObjectId, ref: "Enquiry", required: true, unique: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    title: { type: String, required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: UNITS, required: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    totalValue: { type: Number, required: true, min: 0 },
    commissionPercent: { type: Number, required: true, min: 0, max: 100 },
    commissionAmount: { type: Number, required: true, min: 0 },
    commissionStatus: { type: String, enum: COMMISSION_STATUSES, default: "pending" },
    payments: { type: [PaymentSchema], default: [] },
    shipments: { type: [ShipmentSchema], default: [] },
    status: { type: String, enum: DEAL_STATUSES, default: "active", index: true },
    adminNotes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON },
);

DealSchema.index({ status: 1, createdAt: -1 });

export type DealDoc = InferSchemaType<typeof DealSchema> & { _id: Types.ObjectId };
export const DealModel: Model<DealDoc> = (models.Deal as Model<DealDoc>) || model<DealDoc>("Deal", DealSchema);
