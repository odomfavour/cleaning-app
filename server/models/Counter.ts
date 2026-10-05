import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    sequence: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);
