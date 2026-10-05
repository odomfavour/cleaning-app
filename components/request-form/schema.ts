import { z } from "zod";
import type { Environment } from "@/lib/types";

export const ENVIRONMENTS = [
  "house",
  "apartment",
  "office",
  "restaurant",
  "event_venue",
  "commercial",
  "construction",
  "other",
] as const;
export const isResidential = (e?: Environment) =>
  e === "house" || e === "apartment";

const nextDay = () => {
  const d = new Date("2026-09-30T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
export const MIN_DATE = nextDay();

export const wizardSchema = z
  .object({
    environment: z.enum(ENVIRONMENTS, {
      error: "Choose the type of space you need cleaned",
    }),
    services: z.array(z.string()).min(1, "Choose at least one service"),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    livingRooms: z.string().optional(),
    floors: z.string().optional(),
    kitchens: z.string().optional(),
    size: z.string().optional(),
    rooms: z.string().optional(),
    additional: z.string().optional(),
    description: z
      .string()
      .trim()
      .min(
        10,
        "Describe the job in a sentence or two (at least 10 characters)",
      ),
    specialRequirements: z.string().optional(),
    attentionAreas: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    address: z.string().trim().min(5, "Enter the street address"),
    city: z.string().trim().min(2, "Enter the city"),
    area: z.string().trim().min(2, "Enter the area or neighbourhood"),
    landmark: z.string().optional(),
    directions: z.string().optional(),
    date: z
      .string()
      .min(1, "Choose your preferred date")
      .refine((d) => d >= MIN_DATE, "Choose a date from tomorrow onwards"),
    time: z.string().min(1, "Choose your preferred time"),
    altDate: z
      .string()
      .optional()
      .refine(
        (d) => !d || d >= MIN_DATE,
        "Choose a date from tomorrow onwards",
      ),
    altTime: z.string().optional(),
    flexible: z.boolean().optional(),
    contactName: z.string().trim().min(2, "Enter your full name"),
    contactPhone: z
      .string()
      .min(1, "Enter your phone number")
      .regex(
        /^\+?[\d\s]{10,16}$/,
        "Enter a valid phone number, e.g. 0803 123 4567",
      ),
    contactEmail: z
      .string()
      .min(1, "Enter your email address")
      .email("Enter a valid email address"),
    createAccount: z.boolean().optional(),
    accountPassword: z.string().optional(),
    accountPasswordConfirm: z.string().optional(),
    consent: z.literal(true, {
      error: "Please confirm so we can contact you about this request",
    }),
  })
  .superRefine((v, ctx) => {
    const need = (k: keyof typeof v, msg: string) => {
      if (!v[k]) ctx.addIssue({ code: "custom", path: [k], message: msg });
    };
    if (isResidential(v.environment)) {
      need("bedrooms", "Select the number of bedrooms");
      need("bathrooms", "Select the number of bathrooms");
    } else {
      need("rooms", "Select the approximate number of rooms");
      need("size", "Enter the approximate size");
    }

    if (v.createAccount) {
      if (!v.accountPassword || v.accountPassword.length < 8) {
        ctx.addIssue({
          code: "custom",
          path: ["accountPassword"],
          message: "Use at least 8 characters",
        });
      } else {
        if (!/[A-Z]/.test(v.accountPassword)) {
          ctx.addIssue({
            code: "custom",
            path: ["accountPassword"],
            message: "Include an uppercase letter",
          });
        }
        if (!/\d/.test(v.accountPassword)) {
          ctx.addIssue({
            code: "custom",
            path: ["accountPassword"],
            message: "Include a number",
          });
        }
      }

      if (!v.accountPasswordConfirm) {
        ctx.addIssue({
          code: "custom",
          path: ["accountPasswordConfirm"],
          message: "Confirm your password",
        });
      } else if (v.accountPassword !== v.accountPasswordConfirm) {
        ctx.addIssue({
          code: "custom",
          path: ["accountPasswordConfirm"],
          message: "Passwords don't match",
        });
      }
    }
  });
export type WizardValues = z.infer<typeof wizardSchema>;

export const STEP_FIELDS: (keyof WizardValues)[][] = [
  ["environment"],
  ["services"],
  [
    "bedrooms",
    "bathrooms",
    "livingRooms",
    "floors",
    "kitchens",
    "size",
    "rooms",
    "additional",
  ],
  ["description", "specialRequirements", "attentionAreas"],
  ["address", "city", "area", "landmark", "directions"],
  ["date", "time", "altDate", "altTime", "flexible"],
  [
    "contactName",
    "contactPhone",
    "contactEmail",
    "createAccount",
    "accountPassword",
    "accountPasswordConfirm",
    "consent",
  ],
  [],
];
export const STEPS = [
  "Environment",
  "Service",
  "Property",
  "Details",
  "Location",
  "Schedule",
  "Your details",
  "Review",
];
