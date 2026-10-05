import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(1).max(1000),
  guidance: z.string().trim().min(1).max(500),
  duration: z.string().trim().min(1).max(100),
  active: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
