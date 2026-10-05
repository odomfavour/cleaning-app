import mongoose, { Schema, Types } from "mongoose";

const addressSchema = new Schema(
  {
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "Nigeria",
    },

    postalCode: {
      type: String,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
    },

    area: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    directions: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    _id: false,
  },
);

const requestedServiceSchema = new Schema(
  {
    serviceId: {
      type: Types.ObjectId,
      ref: "CleaningService",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const cleaningRequestSchema = new Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
    },

    customerId: {
      type: Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    contactSnapshot: {
      name: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        trim: true,
      },
    },

    requestedServices: {
      type: [requestedServiceSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) => value.length > 0,
        message: "At least one cleaning service is required",
      },
    },

    address: {
      type: addressSchema,
      required: true,
    },

    propertyType: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    bedrooms: {
      type: Number,
      min: 0,
      max: 100,
    },

    bathrooms: {
      type: Number,
      min: 0,
      max: 100,
    },

    propertyDetails: {
      environment: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      livingRooms: {
        type: Number,
        min: 0,
        max: 100,
      },

      floors: {
        type: Number,
        min: 0,
        max: 100,
      },

      kitchens: {
        type: Number,
        min: 0,
        max: 100,
      },

      rooms: {
        type: Number,
        min: 0,
        max: 100,
      },

      size: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      additional: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },

    preferredDate: {
      type: Date,
    },

    preferredTimeSlot: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    schedule: {
      alternativeDate: {
        type: Date,
      },

      alternativeTimeSlot: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      flexible: {
        type: Boolean,
        default: false,
      },
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

    status: {
      type: String,
      enum: [
        "submitted",
        "reviewing",
        "inspection_required",
        "inspection_scheduled",
        "quoted",
        "accepted",
        "declined",
        "converted",
        "cancelled",
      ],
      default: "submitted",
      index: true,
    },

    inspectionRequired: {
      type: Boolean,
      default: false,
    },

    inspectionId: {
      type: Types.ObjectId,
      ref: "Inspection",
    },
  },
  {
    timestamps: true,
  },
);

cleaningRequestSchema.index({ customerId: 1, createdAt: -1 });
cleaningRequestSchema.index({ status: 1, createdAt: -1 });

export const CleaningRequest =
  mongoose.models.CleaningRequest ||
  mongoose.model("CleaningRequest", cleaningRequestSchema);
