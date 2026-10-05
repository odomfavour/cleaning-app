import mongoose, { Schema, Types } from "mongoose";

const customerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 320,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    hasAccount: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerifiedAt: {
      type: Date,
    },

    phoneVerifiedAt: {
      type: Date,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
      index: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

customerSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true },
    },
  },
);

customerSchema.index({ phone: 1 });

export const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
