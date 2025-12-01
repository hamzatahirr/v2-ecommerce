import { z } from "zod";

export const createDomainSchema = z.object({
  domain: z.string().min(1, "Domain is required").max(253, "Domain is too long")
});

export const updateDomainSchema = z.object({
  domain: z.string().min(1, "Domain is required").max(253, "Domain is too long").optional(),
  isActive: z.boolean().optional()
});

export const bulkCreateDomainsSchema = z.object({
  domains: z.array(z.string().min(1, "Domain is required").max(253, "Domain is too long"))
    .min(1, "At least one domain is required")
    .max(100, "Cannot add more than 100 domains at once")
});

export type CreateDomainDto = z.infer<typeof createDomainSchema>;
export type UpdateDomainDto = z.infer<typeof updateDomainSchema>;
export type BulkCreateDomainsDto = z.infer<typeof bulkCreateDomainsSchema>;