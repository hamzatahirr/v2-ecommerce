import { PrismaClient, ROLE } from "@prisma/client";
import { buildDateFilter } from ".";

export const fetchData = async <T>(
  prisma: PrismaClient,
  model: keyof PrismaClient,
  dateField: string,
  startDate?: Date,
  endDate?: Date,
  yearStart?: Date,
  yearEnd?: Date,
  role?: ROLE,
  include?: Record<string, boolean>,
  sellerId?: string
): Promise<T[]> => {
  const where: any = {
    [dateField]: buildDateFilter(startDate, endDate, yearStart, yearEnd),
  };
  if (role) where.role = role;
  if (sellerId) {
    // For order and orderItem models, filter by sellerId
    if (model === "order" || model === "orderItem") {
      where.sellerId = sellerId;
    }
  }
  return (prisma[model] as any).findMany({ where, include }) as Promise<T[]>;
};
