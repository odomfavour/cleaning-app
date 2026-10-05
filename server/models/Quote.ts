import mongoose, { Schema, Types } from "mongoose";

const quoteItemSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    unitPriceKobo: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "unitPriceKobo must be an integer",
      },
    },

    totalKobo: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "totalKobo must be an integer",
      },
    },
  },
  {
    _id: true,
  },
);

const quoteSchema = new Schema(
  {
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },

    requestId: {
      type: Types.ObjectId,
      ref: "CleaningRequest",
      required: true,
      index: true,
    },

    customerId: {
      type: Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    items: {
      type: [quoteItemSchema],
      default: [],
    },

    subtotalKobo: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "subtotalKobo must be an integer",
      },
    },

    discountKobo: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "discountKobo must be an integer",
      },
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    taxKobo: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "taxKobo must be an integer",
      },
    },

    totalKobo: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "totalKobo must be an integer",
      },
    },

    terms: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "declined", "expired"],
      default: "draft",
      index: true,
    },

    sentAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
    },

    acceptedAt: {
      type: Date,
    },

    declinedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

quoteSchema.index({ customerId: 1, createdAt: -1 });
quoteSchema.index({ requestId: 1, createdAt: -1 });
quoteSchema.index({ status: 1, expiresAt: 1 });

export const Quote =
  mongoose.models.Quote || mongoose.model("Quote", quoteSchema);
