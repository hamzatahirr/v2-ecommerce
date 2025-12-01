import { z } from "zod";

export const createWithdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.string().optional().default("BANK_TRANSFER"),
  details: z.object({
    accountHolder: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),
  }).optional()
});

export const updateWithdrawalStatusSchema = z.object({
  reason: z.string().optional()
});

export type CreateWithdrawalDto = z.infer<typeof createWithdrawalSchema>;
export type UpdateWithdrawalStatusDto = z.infer<typeof updateWithdrawalStatusSchema>;