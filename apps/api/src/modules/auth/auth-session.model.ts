import mongoose, { Schema } from "mongoose";
import type { Model, Types } from "mongoose";

export interface AuthSessionDocument {
  userId: Types.ObjectId;
  tokenHash: string;
  previousTokenHash: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const authSessionSchema = new Schema<AuthSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    previousTokenHash: { type: String, default: null, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null, index: true },
    userAgent: { type: String, maxlength: 512 },
    ipAddress: { type: String, maxlength: 128 },
  },
  { timestamps: true, versionKey: false },
);

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthSession =
  (mongoose.models.AuthSession as Model<AuthSessionDocument> | undefined) ??
  mongoose.model<AuthSessionDocument>("AuthSession", authSessionSchema);
