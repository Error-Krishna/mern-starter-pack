import mongoose, { Schema } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

export type UserRole = "user" | "admin";

export interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRecord = HydratedDocument<UserDocument>;

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
  },
  { timestamps: true, versionKey: false },
);

export const User =
  (mongoose.models.User as Model<UserDocument> | undefined) ??
  mongoose.model<UserDocument>("User", userSchema);
