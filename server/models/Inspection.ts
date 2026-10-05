import mongoose, { Schema, Types } from "mongoose";

const inspectionReportSchema = new Schema(
  {
    condition: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    size: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    duration: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    additionalServices: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    specialRequirements: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    photos: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const inspectionSchema = new Schema(
  {
    requestId: {
      type: Types.ObjectId,
      ref: "CleaningRequest",
      required: true,
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    conductedBy: {
      type: Types.ObjectId,
      ref: "StaffProfile",
    },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    findings: {
      type: String,
      trim: true,
      maxlength: 10000,
    },

    report: {
      type: inspectionReportSchema,
      default: undefined,
    },

    completedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

inspectionSchema.index({ scheduledAt: 1 });
inspectionSchema.index({ requestId: 1, createdAt: -1 });

export const Inspection =
  mongoose.models.Inspection || mongoose.model("Inspection", inspectionSchema);
