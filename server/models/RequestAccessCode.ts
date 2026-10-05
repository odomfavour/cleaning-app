import mongoose, { Schema, Types } from "mongoose";

const requestAccessCodeSchema = new Schema(
  {
    requestId: {
      type: Types.ObjectId,
      ref: "CleaningRequest",
      required: true,
      index: true,
    },

    channel: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

requestAccessCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RequestAccessCode =
  mongoose.models.RequestAccessCode ||
  mongoose.model("RequestAccessCode", requestAccessCodeSchema);
