import mongoose, { Schema, Types } from "mongoose";

const bookingSchema = new Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },

    requestId: {
      type: Types.ObjectId,
      ref: "CleaningRequest",
      required: true,
      index: true,
    },

    quoteId: {
      type: Types.ObjectId,
      ref: "Quote",
      required: true,
      unique: true,
    },

    customerId: {
      type: Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    scheduledFor: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "confirmed",
        "assigned",
        "en_route",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "confirmed",
      index: true,
    },

    assignedStaffIds: [
      {
        type: Types.ObjectId,
        ref: "StaffProfile",
      },
    ],

    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },

    amountKobo: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "amountKobo must be an integer",
      },
    },

    confirmedAt: {
      type: Date,
      required: true,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ assignedStaffIds: 1, status: 1 });
bookingSchema.index({ status: 1, scheduledFor: 1 });

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
