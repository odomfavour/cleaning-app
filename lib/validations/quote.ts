import { z } from "zod";

export const createQuoteItemSchema = z.object({
  id: z.string().optional(),

  description: z.string().trim().min(2, "Describe the item").max(500),

  amount: z.coerce
    .number({
      error: "Enter an amount",
    })
    .positive("Amount must be more than 0"),
});

export const createQuoteSchema = z.object({
  requestId: z.string().trim().min(1, "Request is required"),

  items: z.array(createQuoteItemSchema).min(1, "Add at least one item"),

  discount: z.coerce.number().min(0, "Discount cannot be negative").default(0),

  taxRate: z.coerce
    .number()
    .min(0, "Tax cannot be negative")
    .max(100, "Tax cannot exceed 100")
    .default(0),

  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid expiry date"),

  terms: z.string().trim().min(10, "Add terms for the customer").max(10000),
});

export type CreateQuoteInput = z.input<typeof createQuoteSchema>;
export type CreateQuoteOutput = z.output<typeof createQuoteSchema>;
