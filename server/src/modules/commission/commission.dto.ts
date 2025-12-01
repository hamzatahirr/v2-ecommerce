import { z } from "zod";

export const createCommissionSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  rate: z.number().min(0).max(100, "Commission rate must be between 0 and 100"),
  description: z.string().optional()
});

export const updateCommissionSchema = z.object({
  rate: z.number().min(0).max(100, "Commission rate must be between 0 and 100").optional(),
  description: z.string().optional()
});

export const bulkCreateCommissionsSchema = z.object({
  commissions: z.array(createCommissionSchema)
});

export const setDefaultCommissionRateSchema = z.object({
  rate: z.number().min(0).max(100, "Default commission rate must be between 0 and 100")
});

export type CreateCommissionDto = z.infer<typeof createCommissionSchema>;
export type UpdateCommissionDto = z.infer<typeof updateCommissionSchema>;
export type BulkCreateCommissionsDto = z.infer<typeof bulkCreateCommissionsSchema>;
export type SetDefaultCommissionRateDto = z.infer<typeof setDefaultCommissionRateSchema>;