import mongoose, { Schema, Types } from "mongoose";

const paymentSchema = new Schema(
  {
    customerId: {
      type: Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    quoteId: {
      type: Types.ObjectId,
      ref: "Quote",
      required: true,
      index: true,
    },

    bookingId: {
      type: Types.ObjectId,
      ref: "Booking",
      index: true,
    },

    provider: {
      type: String,
      enum: ["paystack"],
      required: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    providerTransactionId: {
      type: String,
      index: true,
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

    paidAmountKobo: {
      type: Number,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "paidAmountKobo must be an integer",
      },
    },

    currency: {
      type: String,
      enum: ["NGN"],
      default: "NGN",
    },

    status: {
      type: String,
      enum: ["initialized", "success", "failed", "abandoned"],
      default: "initialized",
      index: true,
    },

    paidAt: {
      type: Date,
    },

    failureReason: {
      type: String,
    },

    providerPayload: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ quoteId: 1, createdAt: -1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ provider: 1, providerTransactionId: 1 });

export const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
