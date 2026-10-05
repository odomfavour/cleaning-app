import mongoose, { Schema, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    customerId: {
      type: Types.ObjectId,
      ref: "Customer",
      index: true,
    },

    channel: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "verification",
        "quote_sent",
        "quote_accepted",
        "quote_declined",
        "booking_confirmed",
        "booking_updated",
        "password_reset",
      ],
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
      index: true,
    },

    providerMessageId: {
      type: String,
    },

    sentAt: {
      type: Date,
    },

    failedAt: {
      type: Date,
    },

    errorMessage: {
      type: String,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ customerId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
