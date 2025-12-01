import prisma from "@/infra/database/database.config";
import { Prisma, ROLE, SELLER_STATUS } from "@prisma/client";
import { SellerListFilters, SellerListResponse } from "./admin.types";

export class AdminRepository {
  async findPendingSellers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          isSeller: true,
          sellerStatus: SELLER_STATUS.PENDING_APPROVAL,
        },
        include: {
          sellerProfile: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({
        where: {
          isSeller: true,
          sellerStatus: SELLER_STATUS.PENDING_APPROVAL,
        },
      }),
    ]);

    return {
      sellers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllSellers(filters: SellerListFilters): Promise<SellerListResponse> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      isSeller: true,
    };

    if (filters.status) {
      where.sellerStatus = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        {
          sellerProfile: {
            storeName: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          sellerProfile: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      sellers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findSellerById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        sellerProfile: true,
      },
    });
  }

  async updateSellerStatus(
    userId: string,
    status: SELLER_STATUS,
    extraData: Prisma.UserUpdateInput = {}
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        sellerStatus: status,
        ...extraData,
      },
      include: {
        sellerProfile: true,
      },
    });
  }

  async approveSeller(userId: string) {
    return this.updateSellerStatus(userId, SELLER_STATUS.APPROVED, {
      role: ROLE.USER,
      isSeller: true,
    });
  }

  async rejectSeller(userId: string) {
    return this.updateSellerStatus(userId, SELLER_STATUS.REJECTED);
  }

  async suspendSeller(userId: string) {
    return this.updateSellerStatus(userId, SELLER_STATUS.SUSPENDED);
  }
}

