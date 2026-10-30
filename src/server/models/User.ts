import "server-only";
import { Schema, model, models, type HydratedDocument, type InferSchemaType, type Model, type Types } from "mongoose";
import { ACCOUNT_STATUSES, BUSINESS_TYPES, ROLES } from "@/lib/constants";
import { toJSON } from "./common";

const BusinessSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    type: { type: String, enum: BUSINESS_TYPES },
    categories: { type: [String], default: [] },
    address: { type: String, trim: true },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    pincode: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    yearsInBusiness: { type: Number, min: 0 },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: { type: [{ type: String, enum: ROLES }], required: true, index: true },
    status: { type: String, enum: ACCOUNT_STATUSES, default: "active", index: true },
    publicCode: { type: String, unique: true },
    business: { type: BusinessSchema, required: false },
    resetTokenHash: { type: String },
    resetTokenExpires: { type: Date },
    lastLoginAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON },
);

/** Unique random 5-digit code for the public alias ("Seller #48213"), retried on collision. */
UserSchema.pre("validate", async function () {
  const doc = this as unknown as { publicCode?: string | null; constructor: Model<UserDoc> };
  if (doc.publicCode) return;
  for (let i = 0; i < 20; i++) {
    const code = String(10000 + Math.floor(Math.random() * 90000));
    if (!(await doc.constructor.exists({ publicCode: code }))) {
      doc.publicCode = code;
      return;
    }
  }
  throw new Error("Could not allocate a public code");
});

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: Types.ObjectId };
export type User = HydratedDocument<UserDoc>;
export const UserModel: Model<UserDoc> = (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
