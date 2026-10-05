import mongoose, { Schema, Types } from "mongoose";

const verificationCodeSchema = new Schema(
  {
    customerId: {
      type: Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    requestId: {
      type: Types.ObjectId,
      ref: "CleaningRequest",
      index: true,
    },

    channel: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: ["request_access", "registration", "login", "password_reset"],
      required: true,
    },

    codeHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    consumedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

verificationCodeSchema.index({
  customerId: 1,
  purpose: 1,
  createdAt: -1,
});

export const VerificationCode =
  mongoose.models.VerificationCode ||
  mongoose.model("VerificationCode", verificationCodeSchema);
