import { z } from "zod";

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const optionalNumber = z.number().int().min(0).max(100).optional();

const addressSchema = z.object({
  addressLine1: z.string().trim().min(3).max(300),
  addressLine2: optionalString(300),
  area: z.string().trim().min(2).max(150),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100).default("Nigeria"),
  postalCode: optionalString(20),
  landmark: optionalString(200),
  directions: optionalString(1000),
});

const requestedServiceSchema = z.object({
  serviceId: z.string().min(1),
});

const propertyDetailsSchema = z.object({
  environment: optionalString(100),

  livingRooms: optionalNumber,
  floors: optionalNumber,
  kitchens: optionalNumber,
  rooms: optionalNumber,

  size: optionalString(100),
  additional: optionalString(2000),
});

const scheduleSchema = z.object({
  alternativeDate: z.coerce.date().optional(),
  alternativeTimeSlot: optionalString(100),
  flexible: z.boolean().default(false),
});

export const createCleaningRequestSchema = z.object({
  contact: z.object({
    name: z.string().trim().min(2).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().min(7).max(30),
  }),

  requestedServices: z
    .array(requestedServiceSchema)
    .min(1, "Select at least one cleaning service"),

  address: addressSchema,

  propertyType: optionalString(100),

  bedrooms: optionalNumber,
  bathrooms: optionalNumber,

  propertyDetails: propertyDetailsSchema,

  preferredDate: z.coerce.date(),

  preferredTimeSlot: z.string().trim().min(1).max(100),

  schedule: scheduleSchema,

  notes: optionalString(5000),

  photos: z.array(z.string().url()).max(8).default([]),
});

export type CreateCleaningRequestInput = z.infer<
  typeof createCleaningRequestSchema
>;
