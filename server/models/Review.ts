import mongoose, { Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    bookingId: {
      type: Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    customerId: {
      type: Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5",
      },
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    photos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ customerId: 1, createdAt: -1 });

export const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
