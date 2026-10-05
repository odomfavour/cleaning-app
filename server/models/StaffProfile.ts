import mongoose, { Schema, Types } from "mongoose";

const staffProfileSchema = new Schema(
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
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    userId: {
      type: Types.ObjectId,
      index: true,
    },

    role: {
      type: String,
      enum: ["Cleaner", "Team Lead", "Inspector", "Driver"],
      required: true,
      default: "Cleaner",
      index: true,
    },

    availability: {
      type: String,
      enum: ["available", "on_job", "off_duty"],
      default: "available",
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

staffProfileSchema.index({ role: 1, active: 1 });
staffProfileSchema.index({ availability: 1, active: 1 });

export const StaffProfile =
  mongoose.models.StaffProfile ||
  mongoose.model("StaffProfile", staffProfileSchema);
